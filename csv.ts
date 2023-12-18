import features from './index.js';

const browsers = [
    'chrome',
    'chrome_android',
    'edge',
    'firefox',
    'firefox_android',
    'safari',
    'safari_ios',
];

const header = [
    'feature',
    'spec',
    'baseline',
    'baseline_low_date',
    ...browsers,
    'caniuse',
    'usage_stats'
];

console.log(header.join(','));

function first(value) {
    if (Array.isArray(value)) {
        return value[0];
    }
    return value;
}

for (const [feature, data] of Object.entries(features)) {
    const cells = [
        feature,
        first(data.spec),
        data.status?.baseline,
        data.status?.baseline_low_date,
        ...browsers.map((browser) => data.status?.support ? data.status.support[browser] : ''),
        first(data.caniuse),
        first(data.usage_stats),
    ];
    console.log(cells.join(','));
}
