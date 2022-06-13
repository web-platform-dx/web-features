'use strict'

import bcd from '@mdn/browser-compat-data' assert { type: 'json' };
import features from './features.json' assert { type: 'json' };


export const findBcdData = (name, src) => {
  if (!src) return

  const resolvedName = Array.isArray(name)
    ? name
    : name.split('.').filter(part => part !== 'prototype')

  const current = resolvedName.shift()

  if (current) {
    return src[current] ? findBcdData(resolvedName, src[current]) : undefined
  }

  return src.__compat;
}

const CATEGORY_TITLES = {
  supportInAll: 'Supported in all',
  other: 'Other',
}

const result = {}

for (const category in features) {
  result[category] = {}
  for (const item of features[category]) {
    const { mdn_url, spec_url, description, ...rest } = findBcdData(item, bcd);
    result[category][item] = { mdn_url, spec_url, description };
  }
}

for (const category in result) {
  console.log(`# ${CATEGORY_TITLES[category]}\n`);
  for (const item in result[category]) {
    const { mdn_url, spec_url, description } =  result[category][item];

    const headerText = '`' + item + '`';
    const header = mdn_url ? `[${headerText}](${mdn_url})` : headerText;
    const specLink = spec_url ? `([spec](${spec_url}))` : '';

    console.log(`* [ ] ${header} ${specLink}${description ? `: ${description}` : ''}`.trim());
  }
  console.log('');
}
