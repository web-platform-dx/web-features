'use strict'

import bcd from '@mdn/browser-compat-data' assert { type: 'json' };
import features from './features.json' assert { type: 'json' };
import resultData from './result.json' assert { type: 'json' };
import { readdir } from 'node:fs/promises';

const demoDir = await readdir(new URL('demos/', import.meta.url));

const demos = {};
for (const demoFile of demoDir) {
  const [name] = demoFile.split('.html');
  demos[name] = `demos/${demoFile}`;
}

const findBcdData = (name, src) => {
  if (!src) return

  const resolvedName = Array.isArray(name)
    ? name
    : name.split('.').filter(part => part !== 'prototype')

  const current = resolvedName.shift()

  if (current) {
    return src[current] ? findBcdData(resolvedName, { ...src[current], key: current, parent: src }) : undefined
  }

  return { ...src.__compat, parent: src.parent };
}

const CATEGORY_TITLES = {
  supportInAll: 'Supported in all',
  other: 'Other',
};

const special_urls = {
  'api.Navigation.navigatesuccess_event': 'https://chromestatus.com/feature/6232287446302720'
};

const result = {};

for (const category in features) {
  result[category] = {}
  for (const item of features[category]) {
    const { mdn_url, spec_url, parent } = findBcdData(item, bcd);
    const parent_mdn_url = parent?.__compat?.mdn_url || parent?.parent?.__compat?.mdn_url;
    result[category][item] = { mdn_url, spec_url, parent_mdn_url };
  }
}

for (const category in result) {
  console.log(`# ${CATEGORY_TITLES[category]}\n`);
  for (const item in result[category]) {
    const { mdn_url, spec_url, parent_mdn_url } =  result[category][item];
    const {
      demoSuccess,
      comment,
      mdnDocPage404,
      bugTrackers,
      stackOverflow,
      supportedWellInDevTools
    } = resultData[item] || {};

    const url = mdn_url || parent_mdn_url || special_urls[item];
    const headerText = '`' + item + '`';
    const header = url ? `[${headerText}${mdnDocPage404 ? ' :warning:' : ''}](${url})` : headerText;

    const meta = [
      spec_url ? `[spec](${spec_url})` : '',
      demos[item] ? `[demo](${demos[item]})` : '',
      demoSuccess ? Object.keys(demoSuccess).sort().map(
        name => name + (demoSuccess[name] ? ' ✔' : (demoSuccess[name] === false ? ' ❌' : ' 🤷'))
      ).join(' ') : ''
    ].filter(value => !!value);

    const line = [
      `[${resultData[item] ? 'x' : ' '}]`,
      header,
      meta.length ? `(${meta.join(', ')})` : '',
      comment ? `- ${comment}` : '',
    ].filter(value => !!value);

    console.log(`* ${line.join(' ')}`);
  }
  console.log('');
}
