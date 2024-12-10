import { EleventyHtmlBasePlugin } from "@11ty/eleventy";
import markdownIt from "markdown-it";
import markdownItAnchor from "markdown-it-anchor";
import UpgradeHelper from "@11ty/eleventy-upgrade-help";

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("./src/assets/img");
  eleventyConfig.addPassthroughCopy("./src/assets/fonts");
  eleventyConfig.addPassthroughCopy("./src/assets/css");
  eleventyConfig.addPlugin(EleventyHtmlBasePlugin);
  const mdOpts = {
    html: true,
    breaks: true,
    linkify: true,
  };
  eleventyConfig.setLibrary("md", markdownIt(mdOpts).use(markdownItAnchor));
  eleventyConfig.addPlugin(UpgradeHelper);
  return {
    dir: {
      input: "src",
      output: "../_site",
    },
  };
}
