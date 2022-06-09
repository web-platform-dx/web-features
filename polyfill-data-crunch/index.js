import browserslist from 'browserslist';

import { matchFeatures } from './lib/feature-match.js';

await matchFeatures(
  browserslist([
    'last 2 major versions and last 2 years',
    'Firefox ESR',
    'not op_mini all',
    // 'Explorer 10'
  ]),
  [
    'IntersectionObserver',
    'Object.freeze',
    'default',
    'es2015',
    'es2016',
    'es2017',
    'es2018',
    'es2019',
    'fetch',
    'AggregateError',
    'AbortSignal',
  ],
  {
    // includeAllPolyfillableFeatures: true
  }
);
