## Baseline

This document describes what Baseline intends to do and specifies how features are to receive a Baseline status.

## Background and motivation

Web developers report that [keeping up with changes to the platform is a major issue for them](https://web.dev/deep-dive-into-developer-pain-points/).
Developers have difficulty keeping up with changes in the web platform, such as the introduction of new features and the resolution of interoperability issues, and knowing when features are well-established in their users’ browsers.

Historically, a developer could have regarded a single browser, such as Internet Explorer 11, as the least common denominator for browser capabilities in general.
But the advent of so-called “evergreen” browsers has upended that approach.

Many developers enjoy access to detailed information about their audiences and the browsers they use (e.g., through site analytics, support metrics, user interviews, etc.) but others don’t.
A new project won’t have a measurable audience until it launches.
A library maintainer or application vendor might have, at best, an indirect view of the capabilities of users’ browsers.

Despite the glut of information about browser support, releases, and global usage, these developers are left on their own to draw a platform-wide support picture, with ample opportunity for errors and confusion.
_Baseline_ (alongside related statuses) is intended to help these developers by offering a shortcut past the complexity.

## Goals

_Baseline_ status is a wayfinding tool for web developers.
Baseline status aims to help web developers to identify consensus web platform features and distinguish them from features that are in other states of development (e.g., proposals, experiments, or deprecated and historic features; see also [Future considerations](#future-considerations)).
In other words, Baseline status aims to identify features of developers’ contemporary, workaday web.

Goal 1: **Tailor Baseline status to a developer audience.**
The Baseline status is intended for developers creating and maintaining hypertext applications for the web, who may not have access to the resources, data, tools, or knowledge needed to identify their users’ browsers capabilities more directly.
See [Audience illustration for Baseline status](#audience-illustration-for-baseline-status) for a detailed story to help understand this goal in more detail.

Goal 2: **Change with the web and web developers’ needs.**
Features can and should join and leave Baseline status as their respective interoperability, reliability, commitment, and availability profiles change.
Likewise, Baseline statuses should change as developers’ needs change (for example, developers come to rely on a new browser or an established browser fades from use).
Baseline is not an inert, one-time assessment, nor is it arbitrary, changing form from one day to the next.

Goal 3: **Identify interoperability through support across browser implementations.**
Baseline features demonstrate consensus through multiple implementations.
Baseline is not for single-implementation browser features.

Goal 4: **Identify availability through popular browser support.**
Baseline features demonstrate consensus through user reach, a supermajority of global users by reasonable measures used by web developers.
Baseline features should not surprise a web developer with compatibility failures.

Goal 5: **Identify continuity through support over time.**
Baseline features demonstrate consensus through constancy: uninterrupted support from one release to the next.
Baseline is not for prototypes, betas, or temporary hacks.
All software has bugs, but Baseline features have narrow, known bugs.

Goal 6: **Identify commitment through documentation.**
Baseline features demonstrate consensus through specifications, documentation for web developers, and other signs that the feature will continue to have a place in a web developer’s toolbox.
Baseline features aren’t unspecified or formally discouraged.

<!-- TODO: https://github.com/web-platform-dx/web-features/issues/437 -->

## Non-goals

Baseline status cannot or will not satisfy the following non-goals:

* **Identify universally available features.**
  Many Baseline features will not achieve 100% user reach soon or perhaps ever.
  If a web developer needs to support a globally uncommon or discontinued browser (e.g., Internet Explorer 11), then the developer needs to know the specific limitations of that browser, not a broad overview of developers’ most commonly required browsers.
  Baseline can’t be both.
* **Identify support in assistive technology.**
  Baseline does not cover support for screen readers, screen magnifiers, voice control, and other assistive technology that is not built into browsers.
  See also: [Future considerations](#future-considerations).
* **Identify support in non-web environments.**
  Developers use web technologies in non-web settings, such as JavaScript in Node.js, Web APIs in Deno, or HTML and CSS in Electron-based applications.
  For good reasons, web technologies in non-web settings often depart from interoperability with web browsers.
  Baseline’s ability to report broad consistency would be undermined by accommodating such departures.
* **Tailor Baseline status to standards bodies, browser implementers, and other audiences.**
  Baseline is intended to fill a troublesome gap in web developer experience.
  Other audiences may find utility in Baseline, but their needs must not come at the expense of developer experience.
* **Identify features that are good candidates for polyfilling or progressive enhancement.**
  Baseline features should "just work" when you use them, without requiring polyfills or workarounds.
  Instead, developers should be able to use Baseline to decide when to stop shipping a polyfill.
  See also: [Future considerations](#future-considerations).
* **Replace fine-grained or site-specific reporting or analyses.**
  Baseline is a complement to, not a replacement for, detailed compatibility reporting, such as _Can I Use…?_ or browser compatibility tables on MDN.
  Likewise, Baseline is not a substitute for custom analysis (e.g., [Import statistics on Can I Use…?](https://caniuse.com/ciu/import)).
  Baseline may aid web developers in directing their browser support investigations but, as a summary, won’t eliminate application-specific analysis.
* **Foreclose on other statuses.**
  Baseline’s goals capture a certain kind of stability in web platform features, but that’s far from the only status relevant to web developers.
  Other categories could surely exist to complement or work alongside Baseline.
  Baseline should seek to summarize underlying facts about web platform features, not canonize them.
  See also: [Future considerations](#future-considerations).

## Audience illustration for Baseline status

<!-- TODO: https://github.com/web-platform-dx/web-features/issues/438 -->

Although Baseline is intended for web developers, “web developers” is an extremely broad category, which includes ranges of experience, goals, and motivations.
It’s hard to make tools for a broad category.
Instead, we can use a more specific example as a proxy for the group as a whole.

The audience for Baseline status is illustrated through the following story.
This is but one of several possible stories to help keep in mind the needs and constraints of web developers who use Baseline.

> A web developer is responsible for the maintenance of a static site generator.
>
> The application is typically used in a self-hosted manner: other, downstream web developers download, install, and run the application themselves.
> The downstream developers rarely contribute to the application’s source code or documentation and even less rarely contribute funds for ongoing development.
> But they are generous with bug reports and complaints.
>
> The developer needs to make browser support decisions that work for them, for downstream developers (the site generator users), and for _their_ users (end users).
> The developer wants to maximize backwards compatibility and minimize complaints from downstream developers about browser support issues.
>
> But the developer has several constraints that influence their day-to-day decisions about whether to use a given web platform feature:
>
> * The developer does not have access to downstream developers’ analytics and they don't use telemetry in the application itself, so they can’t directly know anything about end users’ browsers.
> * The developer has limited time and budget to get relatively old or new devices and test with.
>   They use a 2-year old laptop that they keep _mostly_ up-to-date with OS and browser updates.
> * The developer has limited time and interest to keep up with browser news.
>   They don’t routinely read web development blogs.
> * The developer recently decided to stop worrying about end-of-life browsers.
>
> Today, to decide whether to use a new-to-them web platform feature, the developer uses the same techniques taught by their mentors: skim _Can I use…?_ and MDN browser compatibility tables.
> They mostly work on a gut feeling: is there _enough_ green in the table to use this feature?
> This works some of the time, but they’ve been occasionally surprised by both “new” (and unfamiliar) features being long-supported and unexpected complaints of incompatibility.

## Ownership and maintenance

The WebDX community group, through the [web-platform-dx/web-features-set owners group](../GOVERNANCE.md), maintains this document.
Based on WebDX community group research, the web-features owners group decides matters such as the core browser set, releases, editorial overrides, and so on.

The status definition is due for review by the governance group on 7 November 2024.

## Status definition

The status has two substatuses: an interoperable low status and a wider-support high status.
If a feature satisfies the requirements of both substatuses, then the high status takes precedence over the low status.

### Interoperable (low) status

This status represents the initial interoperability of a feature across many browsers.
The status marks the starting point for setting the wider support (high) status.
The status provides a versionable date for a feature, called the _keystone date_.

For each feature definition in `web-features`, an interoperable status shall be assigned to the feature if the feature satisfies all of the following tests:

1. For each current stable release in the [core browser set](#core-browser-set), the release supports the feature (as reported by the current version of `@mdn/browser-compat-data`, excluding those features identified as having `partial_implementation`).
2. The feature definition does not have a value set indicating that:

   - The specification text contains discouraging language, such as a deprecation notice, obsolescence warning, or legacy tag.
   - The governance group is withholding or modifying the status (i.e., there is no editorial override of the feature’s status).

If the feature has the interoperable status, then the feature’s _keystone date_ shall be set to the last release date on which a browser introduced support for the feature
If there was more than one introduction (e.g., a feature was withdrawn then reintroduced), then only the latest date applies.

### Wider-support (high) status

For each feature definition in `web-features`, a wider-support status shall be conferred to the feature if the feature satisfies the following test:

The feature’s keystone date is on or before today’s date minus 30 months and the dates of the following long-term support releases:

* Mozilla Firefox ESR, given by the release date for the latest x.0 release of Firefox ESR (or the previous x.0 release, when there are two active ESR releases).

This duration is selected to approximate developer signals, estimates of browser release uptake over time, an estimate of high total market share support, and the project governance group’s best judgment.

### Core browser set

Both the interoperable and wider-support substatuses observe support with respect to a set of browsers.
The _core browser set_ shall be defined as:

* Apple Safari (iOS)
* Apple Safari (macOS)
* Google Chrome (Android)
* Google Chrome (desktop)
* Microsoft Edge (desktop)
* Mozilla Firefox (Android)
* Mozilla Firefox (desktop)

## Future considerations

There are many things Baseline does not cover.
Here are some areas for future consideration and not currently in-scope for Baseline, particularly other candidate states such as:

<!-- TODO: Replace these with issues -->

* Upcoming (e.g., not yet shipped in all browsers)
* Progressive enhancement safe (i.e., limited penalties for support failures)
* Developer feedback requested
* Buggy (e.g., supported but in ways that are surprising and semi-interoperable)
* Support in assistive technology that is not built into browsers.
* Obsolete/deprecated/legacy/etc. (i.e., flagged as such in the specification or dropped from newer versions of the specification)
* Having high-quality polyfills available
