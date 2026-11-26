import { visit } from 'unist-util-visit';

/**
 * 외부 링크(<a href="http...">)에 rel="nofollow noopener noreferrer"를 붙인다.
 * @param {{ site?: string }} [options]
 */
export default function rehypeExternalLinks(options = {}) {
  const siteHost = options.site ? new URL(options.site).host : '';
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'a') return;
      const href = node.properties?.href;
      if (typeof href !== 'string' || !/^https?:\/\//i.test(href)) return;
      let host = '';
      try {
        host = new URL(href).host;
      } catch {
        return;
      }
      if (siteHost && host === siteHost) return;
      node.properties.rel = ['nofollow', 'noopener', 'noreferrer'];
    });
  };
}
