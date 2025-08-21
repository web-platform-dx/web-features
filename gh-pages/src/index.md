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

Baseline is calculated using the following core browser set:

- Apple Safari (macOS and iOS)
- Google Chrome (desktop and Android)
- Microsoft Edge (desktop)
- Mozilla Firefox (desktop and Android)

## How do I find the Baseline status of a feature?

You can find at-a-glance Baseline statuses on [Can I Use](https://caniuse.com/) feature entries, and [MDN Web Docs](https://developer.mozilla.org/) reference pages. See [Baseline in the wild](/baseline-in-the-wild/) for more examples.

You can [use Baseline on your site](/use-baseline/) too.

## What about other browsers?

Most modern browsers are built on the rendering engine from one of the browsers in the Baseline core browser set.

All browsers on iOS currently implement WebKit, the Safari rendering engine.

The majority of browsers outside the core browser set on Android, Windows and macOS are built on Chromium/Blink, the open source engine underpinning Chrome and Edge.  These browsers can usually be mapped back to the Baseline feature set they support based on the Chromium version they implement.  The [`baseline-browser-mapping`](https://github.com/web-platform-dx/baseline-browser-mapping) module tracks these mappings, and currently includes data on the following browsers:

- Opera Desktop and Mobile
- Samsung Internet
- Android WebView
- QQ Browser Mobile*
- UC Browser Mobile*
- Yandex Browser Mobile*

> **NOTE**
> Baseline support for the browsers marked with an asterisk (*) is based on mapping their version number and stated Chromium version from user agent strings captured by [useragents.io](https://useragents.io).  This information is provided on a best-effort basis.  For more information on how these mappings are generated, please see [the `baseline-browser-mapping` README](https://github.com/web-platform-dx/baseline-browser-mapping/blob/main/README.md#downstream-browsers).

KaiOS - a feature phone operating system used for flip phones - implements the Gecko engine from Firefox.  It is possible to derive feature support in KaiOS based on Gecko feature support, but please be aware that KaiOS has a significantly different set of UI limitations and interaction model compared to the other browsers on this page.  For more information, see the [KaiOS developer documentation](https://developer.kaiostech.com/docs/sfp-3.0/).

Other browsers built on Chromium/Blink, Gecko and WebKit will also support Baseline features, and the WebDX Community Group is continuing to work on mapping downstream browser versions back to the engine they implement.  If you work on a browser and can provide data connecting your versions back to their upstream engine for `baseline-browser-mapping`, please [create an issue in the repository](https://github.com/web-platform-dx/baseline-browser-mapping/issues/new).

## Who owns and maintains Baseline?

The Baseline definition is written by the [web-features owners group](https://github.com/web-platform-dx/web-features/blob/main/GOVERNANCE.md).

Feature definitions are created and reviewed by web-features owners, peers, and contributors.

This work is coordinated and supported by members of the [WebDX Community Group](/webdx-cg/).

## Learn more

To learn more about the background of Baseline, its goals, audience, and more, see the [full Baseline definition](https://github.com/web-platform-dx/web-features/blob/main/docs/baseline.md).
