import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITE } from '../site';
import { getPublished, entryUrl } from '../lib/content';

// RSS에는 본인 글만 넣는다. 자동 생성 신문(news-*)과 기획 결정 로그는 넣지 않는다.
export async function GET(context: APIContext) {
  const collections = ['projects', 'ai-lab', 'log', 'study'] as const;
  const items = [];
  for (const c of collections) {
    for (const e of await getPublished(c)) {
      items.push({
        title: e.data.title,
        description: e.data.summary,
        pubDate: e.data.date,
        link: entryUrl(c, e.id),
        categories: e.data.tags,
      });
    }
  }
  items.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site ?? 'https://worklog.pages.dev',
    items,
    customData: '<language>ko</language>',
  });
}
