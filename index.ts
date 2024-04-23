import fs from 'fs';
import path from 'path';

import { fdir } from 'fdir';
import YAML from 'yaml';
import { FeatureData } from './types';
import { Temporal } from '@js-temporal/polyfill';

import { toString as hastTreeToString } from 'hast-util-to-string';
import rehypeStringify from 'rehype-stringify';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';

import { BASELINE_LOW_TO_HIGH_DURATION } from 'compute-baseline';

// The longest description allowed, to avoid them growing into documentation.
const descriptionMaxLength = 300;

// Some FeatureData keys aren't (and may never) be ready for publishing.
// They're not part of the public schema (yet).
const omittables = [
    "description",
    "descriptionHTML",
    "snapshot",
    "group"
]

function scrub(data: any) {
    for (const key of omittables) {
        delete data[key];
    }
    return data as FeatureData;
}

function* yamlEntries(root: string): Generator<[string, any]> {
    const filePaths = new fdir()
        .withBasePath()
        .filter((fp) => fp.endsWith('.yml') && !fp.endsWith('.dist.yml'))
        .crawl(root)
        .sync() as string[];

    for (const fp of filePaths) {
        // The feature identifier/key is the filename without extension.
        const { dir, name: key } = path.parse(fp);
        const dist = path.join(dir, `${key}.dist.yml`);

        const src = fs.existsSync(dist) ? fs.readFileSync(dist, { encoding: 'utf-8'}) : fs.readFileSync(fp, { encoding: 'utf-8'});
        const data = YAML.parse(src);

        yield [key, data];
    }
}

// Load groups and snapshots first so that those identifiers can be validated
// while loading features.

const groups: Map<string, any> = new Map(yamlEntries('groups'));

// Validate group name and parent fields.
for (const [key, data] of groups) {
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
        iter = groups.get(iter.parent);
        if (!iter) {
            throw new Error(`group ${chain.at(-2)} refers to parent ${chain.at(-1)} which does not exist.`);
        }
    }
}

const snapshots: Map<string, any> = new Map(yamlEntries('snapshots'));
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

const features: { [key: string]: FeatureData } = {};
for (const [key, data] of yamlEntries('feature-group-definitions')) {
    // Convert markdown to text+HTML.
    if (data.description) {
        const { text, html } = convertMarkdown(data.description);
        data.description = text;
        data.description_html = html;
    }

    // Compute Baseline high date from low date.
    const isDist = fs.existsSync(`feature-group-definitions/${key}.dist.yml`);
    if (!isDist && data.status?.baseline_high_date) {
        throw new Error(`baseline_high_date is computed and should not be used in source YAML. Remove it from ${key}.yml.`);
    }
    if (!isDist && data.status?.baseline === 'high') {
        const lowDate = Temporal.PlainDate.from(data.status.baseline_low_date);
        const highDate = lowDate.add(BASELINE_LOW_TO_HIGH_DURATION);
        data.status.baseline_high_date = String(highDate);
    }

    // TODO: remove this when description is required by schema.
    // Part of https://github.com/web-platform-dx/web-features/pull/761.
    if (!data.description) {
        throw new Error(`description is missing from ${key}.yml`);
    }

    // Ensure description is not too long.
    if (data.description?.length > descriptionMaxLength) {
        throw new Error(`description in ${key}.yml is too long, ${data.description.length} characters. The maximum allowed length is ${descriptionMaxLength}.`)
    }

    // Ensure that only known group and snapshot identifiers are used.
    for (const group of identifiers(data.group)) {
        if (!groups.has(group)) {
            throw new Error(`group ${group} used in ${key}.yml is not a valid group. Add it to groups/ if needed.`);
        }
    }
    for (const snapshot of identifiers(data.snapshot)) {
        if (!snapshots.has(snapshot)) {
            throw new Error(`snapshot ${snapshot} used in ${key}.yml is not a valid snapshot. Add it to snapshots/ if needed.`);
        }
    }

    features[key] = scrub(data);
}

export default features;
