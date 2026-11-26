import type { APIContext } from 'astro';
import { UNLISTED } from '../visibility.mjs';

// 비공개 링크 모드에서도 크롤링 자체는 막지 않는다. 막으면 검색엔진이 noindex를 읽지 못해
// 다른 곳에 걸린 링크만으로 주소가 색인될 수 있다. 대신 모든 페이지가 noindex이고 sitemap을 알리지 않는다.
export function GET(context: APIContext) {
  const lines = ['User-agent: *', 'Allow: /'];
  if (!UNLISTED && context.site) lines.push('', `Sitemap: ${new URL('/sitemap-index.xml', context.site)}`);
  return new Response(lines.join('\n') + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
