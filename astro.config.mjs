// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import rehypeExternalLinks from './src/plugins/rehype-external-links.mjs';

// Cloudflare Pages 운영 주소 (worklog.pages.dev는 이미 사용 중이라 -4ce가 붙었다).
const SITE = 'https://worklog-4ce.pages.dev';

export default defineConfig({
  site: SITE,
  trailingSlash: 'ignore',
  integrations: [
    sitemap({
      // 자동 생성 신문은 sitemap에서 뺀다.
      filter: (page) => !page.includes('/archive/news/'),
    }),
  ],
  markdown: {
    processor: unified({ rehypePlugins: [[rehypeExternalLinks, { site: SITE }]] }),
  },
});
