# Exploring the set of interoperable features in the Web Platform

## Background

In 2019 and 2020, Mozilla and the [MDN Product Advisory Board](https://developer.mozilla.org/en-US/docs/MDN/MDN_Product_Advisory_Board/Membership) developed and ran the [Web Developer Needs Assessment (DNA)](https://insights.developer.mozilla.org/), a large-scale study of developer needs.

One of the key themes emerging from the results was how high **fragmentation** (i.e. browser incompatibilities) was in the list of pain points that developers reported. The goal of this WebDX effort is to build a **shared understanding and description of the existing interoperable surface of the web platform**, and to provide supporting infrastructure that projects that reference web features may leverage to report on their implementation status across browsers.

## Starting point: heterogeneous lists of Web Features

Various sources &mdash;&nbsp;web sites, projects, libraries&nbsp;&mdash; discuss and maintain a list of web features. These include:

- **Platform status projects** that track support across browsers such as [Can I Use](https://caniuse.com/), [Chrome Platform Status](https://chromestatus.com/), [Browser Compatibility Data](https://github.com/mdn/browser-compat-data) (BCD) used in [MDN Web Docs](https://developer.mozilla.org/), [Webkit Status](https://webkit.org/status/).
- **Survey platforms** such as the [State of CSS](https://2021.stateofcss.com/en-US/features) or the [State of JS](https://2021.stateofjs.com/en-US/features/browser-apis/).
- **Projects that track ideas and proposals** such as [proposals for new APIs](https://github.com/WICG/proposals/issues) in the Web Platform Incubator Community Group (WICG) or ideas raised in the [Web we want](https://webwewant.fyi/).
- **Standardization roadmap documents** and other use cases documents such as the [Roadmap of web applications on mobile](https://w3c.github.io/web-roadmaps/mobile/).
- **Lists of polyfill** such as [Polyfill.io](https://polyfill.io/v3/url-builder/).
- **Collective knowledge platforms** such as [Stack Overflow](https://stackoverflow.com/)
- **Bug trackers** such as [Bugzilla](https://bugzilla.mozilla.org/home) or [Chromium bugs](https://bugs.chromium.org/p/chromium/issues/list).

These lists of web features have grown organically, are at different levels of granularity (from specific API functions such as support for `SourceBuffer.textTracks` to large features such as "media streaming"), and discuss features from different angles (browser vendors look at features from an implementation perspective, developers from a usage scenario perspective). Additionally, the lists are more or less flat and cannot easily be categorized into groups. The heterogeneity of these existing lists of features makes it hard to combine and compare sources of information, e.g. to evaluate whether a given feature is supported across browsers.

## Value of converging on a common list of web features

A common list of web features, along with a companion grouping mechanism, seems needed for the web community at large to _talk about the same thing_ and build a shared understanding of the interoperable status of the web platform. Immediate benefits include the ability to more easily and more correctly:

- Assess support for a given feature or feature group across browsers.
- Enhance discussions on features with data from various sources.
- Track progress of a feature over time, from its introduction in web discourse to its standardization, implementation, and bug reports in browsers.
- Detect and fix data errors about features in sources viewed as authoritative (e.g. Can I Use, BCD).
- And overall **send consistent signals on the list of interoperable features** that developers can build on with confidence.

## Building on top of a common list of web features

With the need to support IE11 fading, we have a new opportunity to define a set of features as the baseline of the web platform and update that set regularly with new browser releases. Those would be features that work interoperably across major browsers. That would on the one hand, give developers an easy shorthand to look for in terms of browser support, and on the other hand give us an opportunity to talk regularly about which new features have become part of the baseline of the web. Defining this baseline requires a somewhat stable set of browsers and respective versions that developers consider as required before they can use features. We have started research in this space to better understand audiences and requirements.

## Explorations done in 2022

As the WebDX effort was being explored, an initial investigation of what it would take to [converge on a common list of web features](https://github.com/web-platform-dx/web-features/blob/main/towards-features.md#towards-a-common-list-of-web-features) was conducted.

Following that investigation, a [methodology to group web features was developed](https://docs.google.com/document/d/1XjYQybcbOGPKxQnxtIp8C9iXYZBTlczvst5VVn83ty0/edit), leading to a [mockup of how common web platform features could be represented](https://github.com/ddbeck/common-web-feature-mockup/#common-web-platform-feature-representation-mockup-wip).

Maintainers and contributors to main platform status projects were also contacted to seek input on the proposal.

Also see the [Common web platform feature representation update](https://docs.google.com/presentation/d/1bctHvvVJtdLZ5RmprdmyDI5cqXBtYanDqtH95nQU4I8) presentation made by Daniel Beck (@ddbeck).

## Next steps

Daniel Beck is currently prototyping code and tools to create and maintain a common list of web features, coordinating with main platform status projects to ease integration and make sure that requirements are correctly captured and addressed. The idea is to leverage BCD at the heart of the list, given its fine-grained nature.
