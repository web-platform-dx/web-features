---
title: Baseline in your project
description: How to use the Baseline in your project.
layout: "default.html"
---

You can use Baseline to:

- Make decisions about what web platform features to use in your sites and applications
- Tell others whether features work across browsers

## Check if a feature works across browsers

When visiting sites like [Can I Use](https://caniuse.com), [MDN Web Docs](https://developer.mozilla.org/), and [RUM Archive Insights](https://rumarchive.com/insights/#baseline) check the status of a feature to learn if it available across browsers.

## Using Baseline to target browser support

If you want to use Baseline status to target browsers you support, you can use the following [Browserlist](https://browsersl.ist/) configuration in your `package.json` file:

```js
"browserslist": [
  "Chrome > 0 and last 2.5 years",
  "ChromeAndroid > 0 and last 2.5 years",
  "Edge > 0 and last 2.5 years",
  "Firefox > 0 and last 2.5 years",
  "FirefoxAndroid > 0 and last 2.5 years",
  "Safari > 0 and last 2.5 years",
  "iOS > 0 and last 2.5 years",
  "not dead"
]
```

This configuration matches the Baseline widely available stage. Tools like [Babel](https://babeljs.io/), [PostCSS Preset Env](https://preset-env.cssdb.org/), [Lightning CSS](https://lightningcss.dev/), and others will use it to determine the level of browser support and transpile your code or include needed polyfills.

## Let others know when a feature works across browsers

Are you writing a blog post or article or presenting at a conference? Use the [Baseline logos](/name-and-logo-usage-guidelines/) as a shorthand to let your audience know the status of a feature.

The [`<baseline-status>` web component](https://github.com/web-platform-dx/baseline-status) is also available to include on your site or pages to indicate the status of a web feature. It renders at run-time, so it’s always up to date with the latest Baseline status.
