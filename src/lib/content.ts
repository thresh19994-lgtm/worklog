import { getCollection, type CollectionEntry } from 'astro:content';

export type PostCollection = 'projects' | 'decisions' | 'ai-lab' | 'log' | 'study';
export type NewsCollection = 'news-game' | 'news-ai';

/** 운영 빌드에서는 draft 글을 뺀 목록을 날짜 내림차순으로 돌려준다. */
export async function getPublished<C extends PostCollection | NewsCollection>(
  collection: C,
): Promise<CollectionEntry<C>[]> {
  const entries = (await getCollection(collection, (e: CollectionEntry<C>) =>
    import.meta.env.PROD ? !(e.data as { draft: boolean }).draft : true,
  )) as CollectionEntry<C>[];
  return entries.sort(
    (a, b) =>
      (b.data as { date: Date }).date.getTime() - (a.data as { date: Date }).date.getTime(),
  );
}

/** 컬렉션 글의 URL. 기획 결정은 프로젝트 페이지의 타임라인 항목(앵커)으로 연결한다. */
export function entryUrl(
  collection: PostCollection | NewsCollection,
  id: string,
  projectId?: string,
): string {
  switch (collection) {
    case 'projects':
      return `/projects/${id}/`;
    case 'decisions':
      return `/projects/${projectId}/#${id}`;
    case 'ai-lab':
      return `/ai-lab/${id}/`;
    case 'log':
      return `/archive/log/${id}/`;
    case 'study':
      return `/archive/study/${id}/`;
    case 'news-game':
      return `/archive/news/game/${id}/`;
    case 'news-ai':
      return `/archive/news/ai/${id}/`;
  }
}

export const COLLECTION_LABEL: Record<PostCollection | NewsCollection, string> = {
  projects: '프로젝트',
  decisions: '기획 결정',
  'ai-lab': 'AI 활용 사례',
  log: '작업 일지',
  study: '스터디',
  'news-game': '게임 주간 신문',
  'news-ai': 'AI 주간 신문',
};

/** KST 기준 날짜 표시. */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function isoDate(date: Date): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(date);
}
