---
title: Baseline in the wild
layout: "default.html"
---

You can find web-features and Baseline data in the places listed below. If you spot somewhere else using Baseline, or are using Baseline on your own site, or to convey compat information in your library, [create a pull request to add it to the list](https://github.com/web-platform-dx/web-features/edit/main/gh-pages/src/baseline-in-the-wild.md).

## From browser vendors

- [Baseline on MDN (Firefox)](https://developer.mozilla.org/en-US/blog/baseline-evolution-on-mdn/)
- [Baseline on web.dev (Google)](https://web.dev/baseline/)

## Documentation and browser compatibility

- [MDN](https://developer.mozilla.org/en-US/docs/Glossary/Baseline/Compatibility)
- [Can I Use](https://caniuse.com/)
- [BCD Watch](https://bcd-watch.igalia.com/)
- [Can I WebView](https://caniwebview.com/search/?cat=web_feature)

## Tools

- [use-baseline](https://github.com/eslint/css/blob/main/docs/rules/use-baseline.md), an ESLint CSS Language Plugin rule to enforce the use of Baseline features.
- [`<baseline-status>` web component](https://github.com/web-platform-dx/baseline-status), for displaying Baseline status on your own site.
- [Baseline Status in a WordPress Block](https://css-tricks.com/baseline-status-in-a-wordpress-block/), to display the `<baseline-status>` web component in a WordPress block.
- [Baseline status of a web platform feature on a Hugo website](https://pawelgrzybek.com/baseline-status-of-a-web-platform-feature-on-a-hugo-website/), to display Baseline data on a static Hugo website.
- [Baseline Status Astro Embed](https://astro-embed.netlify.app/components/baseline-status/), to display Baseline data without client-side JavaScript on an Astro website.
- [RUMvision Baseline integration](https://www.rumvision.com/help-center/monitoring/dashboard/baseline/), a real user monitoring solution, which uses Baseline statuses show which features are safe to use based on actual audience data.
- [RUM Archive Insights](https://rumarchive.com/insights/), a collection of RUM Archive data visualizations, including yearly Baseline features.
- [Baseline MCP Server](https://github.com/yamanoku/baseline-mcp-server), a Model Context Protocol (MCP) server that provides Baseline information for web features.
- [browserslist-config-baseline](https://github.com/web-platform-dx/browserslist-config-baseline), a module that turns Baseline targets into [browserslist](https://github.com/browserslist/browserslist)-compatible lists of browser versions. Dynamically target Widely available by installing the module using your package manager of choice and adding `"browserslist": "extends browserslist-config-baseline"` to your `package.json`.

## Web feature dashboards

- [Web platform features explorer](https://web-platform-dx.github.io/web-features-explorer/), a visualization of the web-features data, with additional data such as MDN documentation, browser vendor positions, or origin trials.
- [Web Platform Status](https://webstatus.dev/), a visualization of the web-features data, together with web platform test results per feature, and additional filtering and sorting options, such as Baseline years.
- [Web Platform Features](https://web-features.lttr.cz/), a visualization of the web-features data with filters and fuzzy search capabilities.
- [Microsoft Edge - 2024 web platform top developer needs](https://microsoftedge.github.io/TopDeveloperNeeds/), a list of web features that developers need, based on data from the Microsoft Edge team.

## Presentations

- [web-features and Baseline](https://www.youtube.com/watch?v=QzfwNFIXOkM) ([slides](https://patrickbrosset.com/slides/AC-2025/)) by Patrick Brosset, W3C AC meeting, April 2025.
- [Baseline and Web Features](https://www.oddbird.net/2024/11/19/winging-it-13/) by Miriam Suzanne and James Stuckey Weber, Winging It Live, November 2024.
- [Baseline features and webstatus.dev](https://www.youtube.com/watch?v=pTsMpoXGlqE) ([slides](https://docs.google.com/presentation/d/1dRWC7aH-FQTj2JVFIaRvrHNylaRKAUCnQ5Y4odRhGGY/edit#slide=id.g2f87bb2d5eb_0_4)) by Kadir Topal and James Scott, BlinkOn, October 2024.
- [Baseline web features for the win](https://www.w3.org/2024/09/TPAC/demo-baseline.html) by Patrick Brosset, TPAC, August 2024.

## Articles mentioning Baseline

- [Clearleft browser support policy](https://browsersupport.clearleft.com/)
- [How to Use Baseline Data](https://12daysofweb.dev/2024/how-to-use-baseline-data/)
- [Introducing Baseline: a unified view of stable web features](https://developer.mozilla.org/en-US/blog/baseline-unified-view-stable-web-features/)
- [Introducing Baseline: ship modern web features with confidence](https://www.rumvision.com/blog/introducing-baseline-ship-modern-web-features-with-confidence/)
