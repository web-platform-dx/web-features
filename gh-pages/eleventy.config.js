import { EleventyHtmlBasePlugin } from "@11ty/eleventy";
import markdownIt from "markdown-it";
import markdownItAnchor from "markdown-it-anchor";

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
  return {
    dir: {
      input: "src",
      output: "../_site",
    },
  };
}
