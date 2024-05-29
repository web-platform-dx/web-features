import elements from "@webref/elements";
import { Compat } from "compute-baseline/browser-compat-data";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import YAML from "yaml";

// sourced from `npm run traverse | grep '^html.elements' | cut -d. -f3 | sort | uniq`
const tagGroups = [
  ['a'],
  ['abbr'],
  ['acronym'],
  ['address'],
  ['area', 'map'],
  ['article'],
  ['aside'],
  ['audio'],
  ['b'],
  ['base'],
  ['bdi'],
  ['bdo'],
  ['big'],
  ['blockquote'],
  ['body'],
  ['br'],
  ['button'],
  ['canvas'],
  ['center'],
  ['cite'],
  ['code'],
  ['data'],
  ['datalist'],
  ['dd', 'dl', 'dt'],
  ['del', 'ins'],
  ['details', 'summary'],
  ['dfn'],
  ['dialog'],
  ['dir'],
  ['div'],
  ['em'],
  ['embed', 'noembed'],
  ['fencedframe'],
  ['fieldset', 'legend'],
  ['figure', 'figcaption'],
  ['font'],
  ['footer', 'header'],
  ['form'],
  ['frameset', 'frame', 'noframes'],
  ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
  ['head'],
  ['hgroup'],
  ['hr'],
  ['html'],
  ['i'],
  ['iframe'],
  ['img'],
  ['input'],
  ['kbd'],
  ['label'],
  ['li', 'ol', 'ul'],
  ['link'],
  ['main'],
  ['mark'],
  ['marquee'],
  ['menu'],
  ['meta'],
  ['meter'],
  ['nav'],
  ['nobr'],
  ['object', 'param'],
  ['output'],
  ['p'],
  ['picture'],
  ['plaintext'],
  ['portal'],
  ['pre'],
  ['progress'],
  ['q'],
  ['rb'],
  ['rtc'],
  ['ruby', 'rt', 'rp'],
  ['s'],
  ['samp'],
  ['script', 'noscript'],
  ['search'],
  ['section'],
  ['select', 'optgroup', 'option'],
  ['slot'],
  ['small'],
  ['span'],
  ['strike'],
  ['strong'],
  ['style'],
  ['sub', 'sup'],
  ['table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr', 'caption', 'col', 'colgroup'],
  ['template'],
  ['textarea'],
  ['time'],
  ['title'],
  ['track'],
  ['tt'],
  ['u'],
  ['var'],
  ['video', 'source'],
  ['wbr'],
  ['xmp'],
];

async function main() {
  const compat = new Compat();

  const tagMap = new Map();
  const all = await elements.listAll();
  for (const data of all.html.elements) {
    tagMap.set(data.name, data);
  }

  for (const tagGroup of tagGroups) {
    // Collect the set of BCD prefixes to consider in
    // html.elements.* and api.HTML*Element.*.
    const bcdPaths = new Set();;
    const spec_urls: Set<string> = new Set();
    for (const tag of tagGroup) {
      if (!tagMap.has(tag)) {
        continue;
      }
      bcdPaths.add(`html.elements.${tag}`);
      const { href, interface: iface } = tagMap.get(tag);
      spec_urls.add(href);
      if (iface && iface !== 'HTMLElement' && iface !== 'HTMLUnknownElement') {
        bcdPaths.add(`api.${iface}`);
      }
    }

    // Find all of the BCD paths.
    const bcdKeys = [];
    for (const feature of compat.walk()) {
      if (feature.data.__compat.status?.deprecated) {
        continue;
      }
      for (const prefix of bcdPaths.values()) {
        if (feature.id === prefix || feature.id.startsWith(`${prefix}.`)) {
          bcdKeys.push(feature.id);
        }
      }
    }

    if (!bcdKeys.length) {
      console.log('Skipping', tagGroup);
      continue;
    }

    // Write out draft feature.
    const id = tagGroup[0];
    let spec: string | string[] = Array.from(spec_urls).sort();
    if (spec.length === 1) {
      spec = spec[0];
    }
    const feature = {
      draft_date: new Date().toISOString().substring(0, 10),
      name: `<${id}>`,
      description: `The \`<${id}>\` element TODO.`,
      spec,
      group: 'html',
      compat_features: Array.from(bcdKeys),
    };
    const yaml = YAML.stringify(feature);
    await fs.writeFile(`features/draft/html-elements/${id}.yml`, yaml);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
