const { EleventyHtmlBasePlugin } = require("@11ty/eleventy");
const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("./src/assets/img");
  eleventyConfig.addPassthroughCopy("./src/assets/fonts");
  eleventyConfig.addPassthroughCopy("./src/assets/css");
  eleventyConfig.addPassthroughCopy({
    "node_modules/baseline-browser-mapping/dist/baseline-browser-mapping.js": "assets/js/baseline-browser-mapping.js"
  });
  eleventyConfig.addPlugin(EleventyHtmlBasePlugin);
  const mdOpts = {
    html: true,
    breaks: true,
    linkify: true,
  };
  eleventyConfig.setLibrary("md", markdownIt(mdOpts).use(markdownItAnchor));
  return {
    dir: {
      input: "src",
      output: "../_site",
    },
  };
};
