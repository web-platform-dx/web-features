import fs from 'fs';
import path from 'path';

import { Temporal } from '@js-temporal/polyfill';
import { fdir } from 'fdir';
import YAML from 'yaml';
import { FeatureData, GroupData, SnapshotData, WebFeaturesData } from './types';

import { toString as hastTreeToString } from 'hast-util-to-string';
import rehypeStringify from 'rehype-stringify';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';

import { BASELINE_LOW_TO_HIGH_DURATION, coreBrowserSet, parseRangedDateString } from 'compute-baseline';
import { Compat } from 'compute-baseline/browser-compat-data';

// The longest name allowed, to allow for compact display.
const nameMaxLength = 80;

// The longest description allowed, to avoid them growing into documentation.
const descriptionMaxLength = 300;

// Internal symbol to mark draft entries, so that using the draft field outside
// of a draft directory doesn't work.
const draft = Symbol('draft');

const identifierPattern = /^[a-z0-9-]*$/;

function* yamlEntries(root: string): Generator<[string, any]> {
    const filePaths = new fdir()
        .withBasePath()
        .filter((fp) => fp.endsWith('.yml'))
        .crawl(root)
        .sync() as string[];

    for (const fp of filePaths) {
        // The feature identifier/key is the filename without extension.
        const { name: key } = path.parse(fp);

        if (!identifierPattern.test(key)) {
            throw new Error(`${key} is not a valid identifier (must be lowercase a-z, 0-9, and hyphens)`);
        }

        const data = YAML.parse(fs.readFileSync(fp, { encoding: 'utf-8'}));
        const distPath = `${fp}.dist`;
        if (fs.existsSync(distPath)) {
            const dist = YAML.parse(fs.readFileSync(distPath, { encoding: 'utf-8'}));
            Object.assign(data, dist);
        }

        if (fp.split(path.sep).includes('draft')) {
            data[draft] = true;
        }

        yield [key, data];
    }
}

// Load groups and snapshots first so that those identifiers can be validated
// while loading features.

const groups: { [key: string]: GroupData } = Object.fromEntries(yamlEntries('groups'));

// Validate group name and parent fields.
for (const [key, data] of Object.entries(groups)) {
    if (typeof data.name !== 'string') {
        throw new Error(`group ${key} does not have a name`);
    }
    // Walk the parent chain to detect cycles. This is not the most efficient
    // way to detect cycles overall, but it is simple and will fail for some
    // group if there is a cycle.
    const chain = [key];
    let iter = data;
    while (iter.parent) {
        chain.push(iter.parent);
        if (chain.at(0) === chain.at(-1)) {
            throw new Error(`cycle in group parent chain: ${chain.join(' < ')}`);
        }
        iter = groups[iter.parent];
        if (!iter) {
            throw new Error(`group ${chain.at(-2)} refers to parent ${chain.at(-1)} which does not exist.`);
        }
    }
}

const snapshots: { [key: string]: SnapshotData } = Object.fromEntries(yamlEntries('snapshots'));
// TODO: validate the snapshot data.

// Helper to iterate an optional string-or-array-of-strings value.
function* identifiers(value) {
    if (value === undefined) {
        return;
    }
    if (Array.isArray(value)) {
        yield* value;
    } else {
        yield value;
    }
}

function convertMarkdown(markdown: string) {
    const mdTree = unified().use(remarkParse).parse(markdown);
    const htmlTree = unified().use(remarkRehype).runSync(mdTree);
    const text = hastTreeToString(htmlTree);

    let html = unified().use(rehypeStringify).stringify(htmlTree);
    // Remove leading <p> and trailing </p> if there is only one of each in the
    // description. (If there are multiple paragraphs, let them be.)
    if (html.lastIndexOf('<p>') === 0 && html.indexOf('</p>') === html.length - 4) {
      html = html.substring(3, html.length - 4);
    }

    return { text, html };
}

// Map from BCD keys/paths to web-features identifiers.
const bcdToFeatureId: Map<string, string> = new Map();

const features: { [key: string]: FeatureData } = {};
for (const [key, data] of yamlEntries('features')) {
    // Draft features reserve an identifier but aren't complete yet. Skip them.
    if (data[draft]) {
        if (!data.draft_date) {
            throw new Error(`The draft feature ${key} is missing the draft_date field. Set it to the current date.`);
        }
        continue;
    }

    // Convert markdown to text+HTML.
    if (data.description) {
        const { text, html } = convertMarkdown(data.description);
        data.description = text;
        data.description_html = html;
    }

    // Compute Baseline high date from low date.
    if (data.status?.baseline === 'high') {
        const [date, ranged] = parseRangedDateString(data.status.baseline_low_date);
        const lowDate = Temporal.PlainDate.from(date);
        const highDate = lowDate.add(BASELINE_LOW_TO_HIGH_DURATION);
        data.status.baseline_high_date = ranged ? `≤${highDate}` : String(highDate);
    }

    // Ensure name and description are not too long.
    if (data.name?.length > nameMaxLength) {
        throw new Error(`The name field in ${key}.yml is too long, ${data.name.length} characters. The maximum allowed length is ${nameMaxLength}.`);
    }
    if (data.description?.length > descriptionMaxLength) {
        throw new Error(`The description field in ${key}.yml is too long, ${data.description.length} characters. The maximum allowed length is ${descriptionMaxLength}.`);
    }

    // Ensure that only known group and snapshot identifiers are used.
    for (const group of identifiers(data.group)) {
        if (!Object.hasOwn(groups, group)) {
            throw new Error(`group ${group} used in ${key}.yml is not a valid group. Add it to groups/ if needed.`);
        }
    }
    for (const snapshot of identifiers(data.snapshot)) {
        if (!Object.hasOwn(snapshots, snapshot)) {
            throw new Error(`snapshot ${snapshot} used in ${key}.yml is not a valid snapshot. Add it to snapshots/ if needed.`);
        }
    }

    if (data.compat_features) {
        // Sort compat_features so that grouping and ordering in dist files has
        // no effect on what web-features users see.
        data.compat_features.sort();

        // Check that no BCD key is used twice until the meaning is made clear in
        // https://github.com/web-platform-dx/web-features/issues/1173.
        for (const bcdKey of data.compat_features) {
            const otherKey = bcdToFeatureId.get(bcdKey);
            if (otherKey) {
                throw new Error(`BCD key ${bcdKey} is used in both ${otherKey} and ${key}, which creates ambiguity for some consumers. Please see https://github.com/web-platform-dx/web-features/issues/1173 and help us find a good solution to allow this.`);
            } else {
                bcdToFeatureId.set(bcdKey, key);
            }
        }
    }

    features[key] = data;
}

const compat = new Compat();
const browsers: Partial<WebFeaturesData["browsers"]> = {};
for (const browser of coreBrowserSet.map(identifier => compat.browser(identifier))) {
    const { id, name } = browser;
    const releases = browser.releases.filter(release => !release.isPrerelease()).map(release => ({
        version: release.version,
        date: String(release.date),
    }))
    browsers[id] = {
        name,
        releases,
    }
}

export { browsers, features, groups, snapshots };

