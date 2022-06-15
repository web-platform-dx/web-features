'use strict'

import bcd from '@mdn/browser-compat-data' assert { type: 'json' };
import features from './features.json' assert { type: 'json' };
import resultData from './result.json' assert { type: 'json' };


export const findBcdData = (name, src) => {
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

    const url = mdn_url || parent_mdn_url || special_urls[item];
    const headerText = '`' + item + '`';
    const header = url ? `[${headerText}](${url})` : headerText;
    const specLink = spec_url ? `([spec](${spec_url}))` : '';

    const data = resultData[item];

    const demoSuccess = data?.demoSuccess ? Object.keys(data.demoSuccess).sort().map(name => name + (data.demoSuccess[name] ? '✔' : (data.demoSuccess[name] === false ? '❌' : '🤷'))).join(', ') : '';

    console.log(`* [${data ? 'x' : ' '}] ${header} ${specLink} ${demoSuccess ? `: ${demoSuccess}` : ''}`.trim());
  }
  console.log('');
}
