# Feature groups

This directory houses the experiment to provide structured definitions groups of web platform features.
At inception, it consists of this README file only, but it should soon contain data and tools.
See [ddbeck/common-web-feature-mockup](https://github.com/ddbeck/common-web-feature-mockup/) for more information.

## What is a web platform feature?

To identify, group, and report on the availability of web platform features, it might be nice to have a working definition of a web platform feature.
For the purposes of this project, consider this definition:

**A _feature_ (or _feature group_) is a logical subset of all the addressable behaviors and interfaces that the web platform, as mediated by browsers and related tools, exposes to web developers.**

This definition is surely not authoritative, complete, or universally applicable (see [_Limitations of this definition_](#limitations-of-this-definition)).
You could come up with many reasonable alternative definitions.
This definition focuses on things that are useful to this project, but potentially less useful to others.

Also, it's a mouthful. Take a look at each piece:


### A logical subset

_A logical subset_ means that all web technologies together are not a feature;
all of the web platform features taken together **are** the web.
It also means that a feature does not represent a random or arbitrary selection of web technologies.

For example, a group of JavaScript’s `Symbol` built-in object, the CSS `border-color` property, and the HTTP `POST` method is not a web feature, but all of the CSS border properties (individually or as a group) might be.

The definition leaves the size the subset undefined on purpose. Logical subsets may be composed of a single specific feature or hundreds of them. For example, the [range syntax](https://drafts.csswg.org/mediaqueries-4/#mq-ranges) in Media Queries may be a web feature, but so would Media Queries as a whole.


### Addressable

_Addressable_ means that a feature must be identifiable and distinguishable from other features.

For example, “a form” is not a web feature, but the HTML `<form>` element, the `HTMLFormElement` API, or a group of both (“forms”) might be.


### Behaviors and interfaces

_Behaviors and interfaces_ means that a feature must represent the things that the web platform can do, not specific instances of those behaviors and interfaces in use.

For example, the document retrieved from `https://www.wikipedia.org/`, parsed, and turned into a `Document` object is not a feature;
the general browser behavior of retrieving a resource from a URL, parsing its HTML, and turning it into a `Document` object might be.


### The web platform

_The web platform_ means the many technologies developed as open standards with aspirations of compatibility and interoperability that facilitate the use of hypermedia documents and applications on the Internet.
This includes technologies such as HTML, CSS, JavaScript, SVG, WebAssembly, and more, but excludes vendor- or platform-specific exclusive or proprietary technologies.

For example, a standardized API implemented by web browsers might be a feature; a proprietary API exposed to an operating system’s web views is not a feature (even if the web view otherwise implements web platform technologies).


### Mediated by browsers

_As mediated by web browsers and related tools_ means that features must be implemented (or enjoy a reasonable prospect of being implemented in the near future) by web browsers or closely related tools (e.g., a JavaScript engine).
Immature proposals or long-withdrawn behaviors of web browsers are not features (though they might be in the future or have been in the past).


### Exposes to web developers

_The web platform … exposes to web developers_ means that a feature must be open to inspection or manipulation by web developers via the web documents and applications that they make.

For example, the ability to request permission to stream video from a webcam might be a feature (i.e., to call the `getUserMedia()` method), but the particular format, placement, or wording of the prompt to the user to grant that permission is not.

### Limitations of this definition

This definition has many limitations.
To name just a few:

- The definition was written to be descriptive of web features, as opposed to prescriptive.
  The definition intends to capture things that have the look of a web feature, not describe all of the formal requirements or expectations of a web feature.

- The definition was written with a narrow application in mind:
  to characterize web platform features as they relate to the experience of web developers.
  Other definitions might be more useful to specification authors or implementers or technical writers.

- The definition was written with the understanding that it is necessarily incomplete.
  The web, understood broadly, involves many technologies, technologists, and users.
  A one-sentence definition cannot capture everything.
  Even focusing on web developers as a group requires approximating a great many individual perspectives.

In other words, don't treat this as the one true definition of a web platform feature because it isn't.
