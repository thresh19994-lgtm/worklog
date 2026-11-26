// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import rehypeExternalLinks from './src/plugins/rehype-external-links.mjs';
import { UNLISTED } from './src/visibility.mjs';

// Cloudflare Pages 운영 주소 (worklog.pages.dev는 이미 사용 중이라 -4ce가 붙었다).
const SITE = 'https://worklog-4ce.pages.dev';

export default defineConfig({
  site: SITE,
  trailingSlash: 'ignore',
  integrations: [
    sitemap({
      // 비공개 링크 모드에서는 sitemap을 비운다. 정식 공개 후에도 자동 생성 신문은 뺀다.
      filter: (page) => !UNLISTED && !page.includes('/archive/news/'),
    }),
  ],
  markdown: {
    processor: unified({ rehypePlugins: [[rehypeExternalLinks, { site: SITE }]] }),
  },
});
