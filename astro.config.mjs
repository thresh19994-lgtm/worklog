// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import rehypeExternalLinks from './src/plugins/rehype-external-links.mjs';

// 임시 주소. Cloudflare Pages 프로젝트를 만든 뒤 실제 주소로 바꾼다.
const SITE = 'https://worklog.pages.dev';

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
