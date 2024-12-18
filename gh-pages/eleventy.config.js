const { EleventyHtmlBasePlugin } = require("@11ty/eleventy");
const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");
const webFeatures = require("web-features/data.json");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(EleventyHtmlBasePlugin);
  eleventyConfig.addPassthroughCopy("./src/assets/img");
  eleventyConfig.addPassthroughCopy("./src/assets/fonts");
  eleventyConfig.addPassthroughCopy("./src/assets/css");

  // Get keys from features, loop through them to create an array of
  // objects with the feature names & keys.
  eleventyConfig.addGlobalData("featuresList", () => {
    const result = [];

    const features = webFeatures.features;
    const keys = Object.keys(features);
    for (const key of keys) {
      const featureName = features[key].name;
      const name = featureName.replaceAll("<", "&lt;").replaceAll(">", "&gt;");
      result.push({ key, name });
    }

    return result;
  });

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
