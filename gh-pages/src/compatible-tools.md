---
title: Baseline compatible tools
description: Developer tooling to incorporate Baseline targets into your projects.
layout: "default.html"
---

Baseline targets are relevant in a number of tools that developers use on a daily basis, including:

- Analytics and RUM tools
- Linters
- Build and polyfill tools
- IDEs

## Analytics and RUM tools

Analytics and RUM tools can help you choose the right Baseline target. Widely available is suitable for most projects, but you can consult real user traffic determine whether you need to choose a different target. [web.dev provides an article outlining the tools available to help you choose a Baseline target](https://web.dev/articles/how-to-choose-your-baseline-target).

If you're launching a new site and don't have any user data, you can look at [RUM Archive Insights Baseline support tables](https://rumarchive.com/insights/#baseline) which are based on aggregated traffic from users of Akamai's mPulse RUM tools.

## Linters

The following linting tools have direct support for Baseline targets:

- [`@eslint/css`](https://github.com/eslint/css) ([Baseline rule documentation](https://github.com/eslint/css/blob/main/docs/rules/use-baseline.md))
- [`html-eslint`](https://github.com/yeonjuan/html-eslint) ([Baseline rule documentation](https://github.com/yeonjuan/html-eslint/blob/main/docs/rules/use-baseline.md))
- [Stylelint](https://stylelint.io/) ([Via `stylelint-plugin-use-baseline` module](https://github.com/ryo-manba/stylelint-plugin-use-baseline))

## Build and polyfill tools

### browserslist support

Some polyfill and build tools are compatible with `browserslist` and will use whatever browser version <> feature mappings they have available to polyfill code where necessary.

[Browserslist](https://github.com/browserslist/browserslist) is a popular tool for communicating minimum supported browser versions to many other tools. It does not support Baseline queries directly, but the W3C WebDX Community Group provides a module that takes Baseline targets in your `package.json` file and dynamically generates a list of supported browsers for your chosen Baseline target. To target Widely available, install `browserslist-config-baseline` using the package manager of your choice, then add the following to your `package.json`:

```json
"browserslist": "extends browserslist-config-baseline"
```

For more information including how to target Baseline years and browsers outside the core browser set, see [`browserslist-config-baseline` on GitHub](https://github.com/web-platform-dx/browserslist-config-baseline).

### esbuild

Some tools rely on [`esbuild`](https://esbuild.github.io/) which supports [minimum browser targets](https://esbuild.github.io/api/#target). [`browserslist-to-esbuild`](https://github.com/marcofugaro/browserslist-to-esbuild) provides a mechanism for converting a `browserslist` config to an `esbuild` target string, or you can use a similar approach to [Vite's for generating an `esbuild` target string using `baseline-browser-mapping`](https://github.com/vitejs/vite/blob/bdde0f9e5077ca1a21a04eefc30abad055047226/packages/vite/scripts/generateTarget.ts#L4).

## IDEs

VS Code hover cards for HTML and CSS include Baseline status indicators as of [the April 2025 100.1 release](https://code.visualstudio.com/updates/v1_100#_languages).

JetBrains' WebStorm IDE hover cards for HTML, CSS and JS include Baseline status indicators as of [the June 2025 2025.1.3 release](https://youtrack.jetbrains.com/articles/WEB-A-233538621/WebStorm-2025.1.3-251.26927.40-build-Release-Notes).
