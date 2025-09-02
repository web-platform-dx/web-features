---
layout: "default.html"
title: "What is Baseline?"
---

Baseline gives you clear information about which web platform features work across our [core browser set](#how-do-features-become-part-of-baseline%3F) today. When reading an article, or choosing a library for your project, if the features used are all part of Baseline, you can trust the level of browser compatibility. By aligning with Baseline, there should be fewer surprises when testing your site.

## How do features become part of Baseline?

Baseline features are available across popular browsers. Baseline has two stages:

- **Newly available**: The feature works across the latest devices and browser versions. The feature might not work in older devices or browsers. Indicated with a blue icon.
- **Widely available**: The feature is well established and works across many devices and browser versions. It’s been available across browsers for at least 2½ years (30 months). Indicated with a green icon.

Prior to being newly available, a feature has **Limited availability** when it's not yet available across all browsers.

All the features that were **Newly available** at the end of a given calendar year can be described as being in that Baseline year's feature set. For example, [overflow: clip](https://webstatus.dev/features/overflow-clip) became Newly available in September 2022, so it is part of [Baseline 2022](https://webstatus.dev/?q=baseline_date%3A2000-01-01..2022-12-31) and all subsequent Baseline years.

Baseline is calculated using the following core browser set:

- Apple Safari (macOS and iOS)
- Google Chrome (desktop and Android)
- Microsoft Edge (desktop)
- Mozilla Firefox (desktop and Android)

## What about other browsers?

Many browsers outside the core browser set typically support the same Baseline feature set as a browser in the core browser set.

For example, many browsers on Android, Windows, and macOS are built on Chromium, the open source engine underpinning Chrome and Edge. On iOS, all browsers use the same engine, WebKit, that underpins that device's Safari browser.

For a wider range of browsers, see [supported browsers](/supported-browsers/) to find out which minimum browser versions support different Baseline feature sets, including Newly and Widely available and Baseline years.

The [`baseline-browser-mapping`](https://github.com/web-platform-dx/baseline-browser-mapping) module tracks these mappings to derive the feature set for browsers outside the core browser set.

## How do I find the Baseline status of a feature?

You can find at-a-glance Baseline statuses on [Can I Use](https://caniuse.com/) feature entries, and [MDN Web Docs](https://developer.mozilla.org/) reference pages. See [Baseline in the wild](/baseline-in-the-wild/) for more examples.

You can [use Baseline on your site](/use-baseline/) too.

## Who owns and maintains Baseline?

The Baseline definition is written by the [web-features owners group](https://github.com/web-platform-dx/web-features/blob/main/GOVERNANCE.md).

Feature definitions are created and reviewed by web-features owners, peers, and contributors.

This work is coordinated and supported by members of the [WebDX Community Group](/webdx-cg/).

## Learn more

To learn more about the background of Baseline, its goals, audience, and more, see the [full Baseline definition](https://github.com/web-platform-dx/web-features/blob/main/docs/baseline.md).
