import { toString as hastTreeToString } from "hast-util-to-string";
import rehypeParse from "rehype-parse";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

export function convertMarkdown(markdown: string) {
  const mdTree = unified().use(remarkParse).parse(markdown);
  const htmlTree = unified().use(remarkRehype).runSync(mdTree);
  const text = hastTreeToString(htmlTree);

  let html = unified().use(rehypeStringify).stringify(htmlTree);
  // Remove leading <p> and trailing </p> if there is only one of each in the
  // description. (If there are multiple paragraphs, let them be.)
  if (
    html.lastIndexOf("<p>") === 0 &&
    html.indexOf("</p>") === html.length - 4
  ) {
    html = html.substring(3, html.length - 4);
  }

  return { text, html };
}

export function convertHTML(html: string) {
  const htmlTree = unified().use(rehypeParse).parse(html);
  const text = hastTreeToString(htmlTree);

  return { text };
}
