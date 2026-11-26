import { getPublished, entryUrl, COLLECTION_LABEL, type PostCollection } from './content';

export interface TaggedItem {
  href: string;
  title: string;
  date: Date;
  summary: string;
  badge: string;
  tags: string[];
}

// 자동 생성 신문(news-*)은 태그 기본 목록에서 뺀다.
const TAGGED: PostCollection[] = ['projects', 'decisions', 'ai-lab', 'log', 'study'];

export async function getTaggedItems(): Promise<TaggedItem[]> {
  const items: TaggedItem[] = [];
  for (const collection of TAGGED) {
    const entries = await getPublished(collection);
    for (const e of entries) {
      const data = e.data as { title: string; date: Date; summary: string; tags: string[]; project?: { id: string } };
      items.push({
        href: entryUrl(collection, e.id, data.project?.id),
        title: data.title,
        date: data.date,
        summary: data.summary,
        badge: COLLECTION_LABEL[collection],
        tags: data.tags,
      });
    }
  }
  return items.sort((a, b) => b.date.getTime() - a.date.getTime());
}
