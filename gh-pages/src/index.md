---
layout: "default.html"
title: "What is Baseline?"
---

Baseline gives you summarized information about which web platform features work across our [core browser set](#which-browsers-are-in-the-core-browser-set) today.

When you read an article about features of the web platform, or when you choose a library that uses web features for your project, if those features are all Baseline, you can make quicker decisions about using them. Baseline helps to reduce the number of cross-browser surprises when testing your site.

## How do features become part of Baseline?

Baseline has two stages:

- **Newly available**
  
  The feature has recently become available in all the browsers of the core browser set. The feature might not work yet in older devices or browsers.
  This status is indicated with the following blue icon: <img src="/assets/img/baseline-widely-icon.svg" alt="Baseline widely available icon" style="height:1em;">.

- **Widely available**

  The feature has been available in all the browsers of the core browser set for at least 2½ years (30 months). It is now well established and works across many devices and browser versions.
  This status is indicated with the following green icon: <img src="/assets/img/baseline-newly-icon.svg" alt="Baseline newly available icon" style="height:1em;">.

Prior to being part of Baseline, a feature has **Limited availability** when it's not yet available across all the browsers of the core browser set.
Limited availability features are indicated with the following grey and orange icon: <img src="/assets/img/baseline-limited-icon.svg" alt="Limited availability icon" style="height:1em;">

Baseline is a simplification of the complex reality of web platform feature support, and it can't replace detailed testing for your specific use case.
For example, a feature that's limited availability or Baseline newly available might still work well enough for your needs, or as a progressive enhancement. Or, a feature that's Baseline widely available might not work for your specific audience if they use older browsers or devices.

## Which browsers are in the core browser set?

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
