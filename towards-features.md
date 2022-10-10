# Towards a common list of web features

## Abstract

This document investigates the definition of a common set of web features with browser support information for use in dashboards, platform status projects, and contexts that discuss specific usage scenarios on the web. Examples include Can I Use, Chrome Platform Status, MDN.


## The web as a set of specs

The unit of discourse in standardization circles is the **specification**. W3C, the WHATWG, IETF, the Khronos Group, Ecma International all publish specifications. Taking a browser-centric perspective, the web platform can be roughly defined as the set of specifications implemented or considered for implementation across browsers.

To consolidate information about specifications from multiple sources (e.g. [Web Platform Tests](https://github.com/web-platform-tests/wpt), the [W3C API](https://www.w3.org/api/), [Specref](https://www.specref.org/)), we need to agree on criteria to select specifications and identifiers to reference them.

This is a bit more complicated than meets the eye. Specifications start as proposals somewhere, get incubated in a group and are often standardized in another group, or abandoned. They exist as editor’s drafts, working drafts, dated documents, etc., and each version has its own URL. The specification’s title or short name (which is often used as an identifier) may also change over time. Some specifications get merged into other specifications and disappear (for instance, the [Visual Viewport API](https://wicg.github.io/visual-viewport/) proposal was recently merged into the [CSSOM View Module](https://drafts.csswg.org/cssom-view/)). Platform status projects sometimes reference outdated or retracted versions of specifications. For instance, entries in [Chrome Platform Status](https://chromestatus.com/) are typically no longer maintained once a feature has shipped. On top of tracking changes, some specifications have early implementations, while others go through several maturity stages before they get implemented. When should a specification be added to the list?

The [browser-specs](https://github.com/w3c/browser-specs/) project was created to converge on a common list of web specifications with canonical identifiers for each of them. Maintaining the list over time requires keeping an eye on organizations that publish web specifications. A good chunk of that process can be automated but human review and intervention remains needed to assess whether a specification meets selection criteria.

In other words, building a curated list of specifications takes time. And specifications are not the most useful level to talk about the web platform outside of standardization circles.


## The web as a set of features

The unit of discourse in developer circles is the **feature**. If you want to offload canvas rendering to a dedicated worker, you will be looking at `OffscreenCanvas` support, defined in [HTML](https://html.spec.whatwg.org/multipage/canvas.html#the-offscreencanvas-interface). In some cases, there is a one-to-one mapping between features and specifications. Flexbox as a feature is essentially the [CSS Flexbox module](https://drafts.csswg.org/css-flexbox/). In other cases, a feature is defined within a single specification, e.g. support for `OffscreenCanvas` is defined in HTML. From time to time, a feature worthy of interest spans multiple specifications. For instance, the notion of web components encompasses features in [HTML](http://html.spec.whatwg.org/multipage/), [DOM](https://dom.spec.whatwg.org/), [CSS Scoping](https://drafts.csswg.org/css-scoping/), and [CSS Shadow Parts](https://drafts.csswg.org/css-shadow-parts/).

As with specifications, to cross information about features from multiple sources, e.g. [Can I Use](https://caniuse.com/), [Chrome Platform Status](https://chromestatus.com/), [Webkit status](https://webkit.org/status/), or [Browser Compatibility Data](https://github.com/mdn/browser-compat-data) (BCD), we need to agree on a common list of features and identifiers to reference them.

The sources mentioned above have grown ad-hoc lists of features to track support across browsers. Similarly, other dashboards and projects that talk about web features use their own organically grown lists. These include, in no particular order:

- features documented in [MDN Web Docs](https://developer.mozilla.org/)
- features that appear in surveys such as the [State of CSS](https://2021.stateofcss.com/en-US/features) or the [State of JS](https://2021.stateofjs.com/en-US/features/browser-apis/)
- [proposals for new APIs](https://github.com/WICG/proposals/issues) in the Web Platform Incubator Community Group (WICG)
- ideas raised in the [Web we want](https://webwewant.fyi/)
- features explored in standardization roadmap documents such as the [Roadmap of web applications on mobile](https://w3c.github.io/web-roadmaps/mobile/), workshops and other use cases documents.
- features that can be polyfilled in [Polyfill.io](https://polyfill.io/v3/url-builder/)
- CSS features in the [CSS database](https://cssdb.org/)
- Specifications and features in [Mozilla’s specification positions](https://mozilla.github.io/standards-positions/)
- …

All of these dashboards and projects maintain a list of features. They may not be looking at the same granularity, simply because they do not look at features from the same perspective. BCD deals with IDL interfaces and attributes, CSS properties, events, etc. creating a very fine-grained list of **about 14000 features** that can provide data for the comprehensive MDN documentation reference. Can I Use has a much more coarse-grained list of **about 520 features** (not including features from BCD that Can I Use also returns) that developers can lookup to quickly assess whether the bit they need is widely supported across browsers. Chrome Platform Status defines **about 2200 entries** from an implementer point of view; some of them being coarse-grained, at the specification level (e.g. the [Custom Highlight API](https://chromestatus.com/feature/5436441440026624) entry), while others are fine-grained (e.g. [MediaCapabilities: query HDR with `decodingInfo()`](https://chromestatus.com/feature/6640863931269120)).

Sometimes, platform status projects align on a specific feature. For instance, all platform status projects have a single entry for the `<datalist>` element in HTML ([BCD](https://github.com/mdn/browser-compat-data/blob/main/html/elements/datalist.json#L4), [Can I Use](https://caniuse.com/datalist), [Chrome Platform Status](https://chromestatus.com/feature/6090950820495360), [Webkit status](https://webkit.org/status/#feature-datalist-element)). They seem to slightly disagree on the implementation status across browsers but at least they agree on what `<datalist>` means. In other cases, the granularity may be different. Taking the example of the File API specification, while Can I use has a single entry for the [FileReader API](https://caniuse.com/filereader), Chrome Platform Status also has an entry for [FileReader](https://chromestatus.com/feature/5171003185430528) but also has more specific implementation-related entries such as [FileReader - Set Result Only on Load](https://chromestatus.com/feature/5336723045220352) and [Simpler reading methods for Blob interface](https://chromestatus.com/feature/6206980857266176). Meanwhile, BCD has detailed support information for the [`FileReader`](https://github.com/mdn/browser-compat-data/blob/c040a3c1aca86166ffae056a0dfabd373cefa6b5/api/FileReader.json) and the [`Blob`](https://github.com/mdn/browser-compat-data/blob/c040a3c1aca86166ffae056a0dfabd373cefa6b5/api/Blob.json) interfaces (and their members), and Webkit status does not have any entry related to the File API.

In any case, as illustrated with the `<datalist>` example above, the level of granularity is but one problem on the way to building a useful list of features. Most dashboards will also want to evaluate support for features in browsers.


## Features and browser support

There are always specific behaviors, attributes, corner cases, implementation bugs that make it impossible to assert that a feature is fully supported in a browser.

Is Media Source Extensions (MSE) supported? It sure is across browsers. Or is it? If you consider that MSE is the sum of individual IDL features, you may be tempted to conclude otherwise:

- [`SourceBuffer.textTracks`](https://w3c.github.io/media-source/#dom-sourcebuffer-texttracks) is not supported in Firefox or Chrome. It just turns out that typical MSE scenarios can live without that feature so it seems fine to ignore that on first approximation.
- The MSE specification still evolves. New features include the possibility to create and use MediaSource objects off the main thread in dedicated workers. This feature is not yet supported across browsers. You may still be tempted to ignore that because talking about MSE today implicitly means something like talking about “the MSE recommendation that was published in 2016, completed with `changeType()` since that is now supported everywhere”. In a few years from now, the implicit meaning will likely encompass MSE in workers as well.

The MSE example illustrates that **it is hard to deal in absolutes with the implementation status of web features**. It depends on the usage scenario that you are contemplating. If you are specifically interested in running MSE off the main thread or in scenarios that involve `textTracks`, you probably don’t want to assert that MSE is supported. If you are rather considering MSE in typical adaptive streaming scenarios, you can safely report support across the board. Implementation status also depends on when you are making the assertion, as the meaning of a feature may evolve over time.

Dashboards often deal with this on a best effort basis. Can I use reports that [CSS Grid (Level 1)](https://caniuse.com/css-grid) is supported across browsers while [CSS Subgrid](https://caniuse.com/css-subgrid) (defined in Level 2) is not. In this case, the specification level can be used to disambiguate what supporting CSS Grid means. That mechanism does not work in the generic case though: a new level may introduce more than the set of features that one may be contemplating, and many web specifications (including most specifications that define IDL content) do not use levels and are rather updated on a continuous basis.

The usage scenario may also involve browser behavior that goes beyond mere “support” that is not commonly reported in platform status projects. For instance, browsers added support for video quite early without accessible controls, and this was not always reported accurately in implementation dashboards.

Ideally, **it should be easy to scope, extend and compose features in a list** so that we can all agree on what the support information represents. For composition of features, it would also be great if some level of automation could be achieved. For instance, the [Web Speech API](https://wicg.github.io/speech-api/) can be divided into speech recognition and speech synthesis. This composition could perhaps be done automatically, at least to compute support information. Finding sub-features that compose a specification automatically is easy: they will somehow target the specification URL. Finding sub-features of a feature within a specification automatically is much harder though as features do not always point to a particular section in a specification (and even if they did, it is not easy to tell which sub-features are in the same section too). Additionally, this would require a mechanism to exclude too fine-grained sub-features from the computation of support data (to avoid getting too fine-grained a result).

**It should equally be possible to update the scope of a feature over time**. Unfortunately, this means that authors of documents and dashboards referencing features will need to track changes and update the underlying data when the scope of a feature changes. That may be an acceptable trade-off though. The browser-specs project takes a similar approach: it pushes changes onto consumers, including change of identifiers, each time a new version is released, which effectively forces everyone to converge on the same list and identifiers.


## Selection criteria for features

As said, projects that list features tend to grow features organically, adding new ones when the need arises: entries are created in Chrome Platform Status and Webkit status as part of internal development workflows, new features are added to projects that collect ideas from users (e.g. Web we want) when they get submitted, roadmap documents create features when they need to talk about them.

To keep the list useful as a means to provide web developers with clear signals for whether they can or cannot use a feature, we would need to settle on selection criteria. Can I Use defines a [set of criteria](https://github.com/Fyrd/caniuse/blob/main/CONTRIBUTING.md#adding-a-feature) for adding new features that provide food for thought:

1. Feature is on the higher end of the spectrum on the [Feature suggestion list](https://caniuse.com/issue-list/)
2. Feature is *not* already widely supported
3. Feature is at least supported in one (possibly upcoming) browser
4. PR includes a link to the test case(s) used to test support (can be codepen, jsfiddle, etc)
5. Support data was properly validated using either test cases or from information from reliable sources.
6. The more actual support information, the better (rather than most data simply being unknown).

These criteria do not mention the granularity of features to be considered. The fact that Can I Use has a coarse-grained list of features probably results from the first criterion: features worth considering preferably need to have some level of support. This would exclude features that describe internal too specific implementation details, which seems a good thing. For the list to be useful across dashboards, we may still need a faster mechanism than relying on popularity to add features, so that documents can start referencing a feature whenever needed and not only when the feature starts getting traction among developers. One possible mechanism could track BCD data, making sure that all entries in BCD map to a feature in the list.

Projects that need to list new ideas and proposals may find the third criterion too restrictive. Support for brand new ideas should still be an explicit non-goal, at least initially: a good chunk of ideas will stay at the idea level and never turn into implemented features. It seems wise to restrict the list to features that are at least considered for implementation in browsers or already supported (similar to how specifications get selected in browser-specs).

The list may contain both fine-grained and coarse-grained features. That is fine. What matters is that consumers of the list want to talk about these features.

Focus on features that are not already widely supported also makes sense on an ongoing basis (although not for the actual creation of the list!). We would probably want the list to contain widely supported specifications but this should de facto happen on an ongoing basis because specifications will get added to the list before they are widely supported. The same goes for popular features such as support for the video element. All specifications in browser-specs should probably appear in the list of features and good news is that this is easy to achieve and automate.

All in all, selection criteria will probably end up close, though not identical, to the selection criteria used in Can I Use and, as with the selection of specs in browser-specs, exceptions-to-the-rule are to be expected.

On top of selection criteria, we would need to settle on maintenance criteria. When should the scope of a feature be updated? How to deal with feature levels and maturity stages? When can a feature be deprecated or dropped? This needs more thoughts.


## Suggestions for next steps

We talked about coarse-grained and fine-grained features, and implementation support. Good news is that:

1. A list of fine-grained web features with support information is already maintained in the [Browser Compatibility Data](https://github.com/mdn/browser-compat-data) (BCD) project.
2. A list of web specifications is already maintained in [browser-specs](https://github.com/w3c/browser-specs/) and it is easy to map BCD support information to specifications to report on implementation status (well, with some caveats, see below).
3. Partial lists of coarse-grained features already exist, including [Can I Use](https://caniuse.com/), [Chrome Platform Status](https://chromestatus.com/) and standardization roadmap documents.

What is still missing:

- **A consolidated list of coarse-grained features** that covers the entire web platform. That consolidated list should typically build on top of existing ones such as Can I Use.
- **Mappings between the consolidated list and platform status projects**. For instance, specification entries in Can I Use need to be mapped to corresponding entries in the list. This is trivial for the about 100 Can I Use entries that cover specs in browser-specs, simply by mapping URLs. Similarly, all entries in BCD should ideally map to features in the consolidated list.
- **The possibility to specify the scope of a feature when it can be further subdivided or when it evolves over time** (e.g. `Array` methods in JavaScript), and to distinguish related entries in platform status projects - in particular BCD entries - that are representative of a feature, from those that are either out of scope or implementation details and that should be ignored to compute rough implementation support for the feature.
- **Update mechanisms** for managing new info published in platform status projects. The more automated the mechanisms, the better.
- Similarly, **mechanisms for advertising changes** made to the list so that consumers can easily track evolutions.

The [browser-statuses](https://github.com/w3c/browser-statuses#web-browser-implementation-statuses) project, initially created for standardization roadmap documents (such as the [Overview of media technologies on the web](https://w3c.github.io/web-roadmaps/media/)), achieves some of these goals and could perhaps be a useful starting point or a source of inspiration:

- It depends on browser-specs to provide the initial list of specifications
- It maintains mappings (mostly) automatically between these specifications, BCD, Can I Use and other platform status projects.
- It includes a list of features within these specifications (the list grew organically as features needed to be mentioned in roadmaps). Features also map to platform status projects but this process is manual.
- It contains a (manual) mechanism to select representative entries in platform status projects to compute rough implementation support for a feature or a specification.
- It contains code to actually compute a rough implementation support score from data in platform status projects

Among the things that may need to be revisited: the browser-statuses project does not yet try to be a comprehensive list of features. Also, brower-statuses only includes features that are always defined within a specification and does not yet let one group features into higher-level ones.

Regardless of the starting point, what is needed is a coordination effort between status platforms to converge on a shared vision for features, agree on a common mechanism to add new ones, and identify contributors and maintainers.