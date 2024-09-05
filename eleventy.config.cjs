const { EleventyHtmlBasePlugin } = require("@11ty/eleventy");
const markdownIt = require("markdown-it");
const markdownItAnchor = require('markdown-it-anchor');

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("./gh-pages/assets/img");
  eleventyConfig.addPassthroughCopy("./gh-pages/assets/fonts");
  eleventyConfig.addPassthroughCopy("./gh-pages/assets/css");
  eleventyConfig.addPlugin(EleventyHtmlBasePlugin);
  eleventyConfig.ignores.add("./gh-pages/README.md");
  const mdOpts = {
    html: true,
    breaks: true,
    linkify: true,
  };
  eleventyConfig.setLibrary("md", markdownIt(mdOpts).use(markdownItAnchor));
  return {
    dir: {
      input: "gh-pages",
      output: "_site",
    },
  };
};
