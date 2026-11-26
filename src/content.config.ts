import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// KST 날짜 문자열(YYYY-MM-DD)만 받는다.
const kstDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'date는 KST 기준 YYYY-MM-DD 문자열이어야 합니다')
  .pipe(z.coerce.date());

export const AI_ASSIST = ['없음', '교정', '초안', '자동 생성'] as const;

const common = {
  title: z.string().min(1),
  date: kstDate,
  tags: z.array(z.string()).default([]),
  summary: z.string().max(160),
  ai_assist: z.enum(AI_ASSIST),
  draft: z.boolean().default(false),
};

// 최상위 .md만 글로 읽는다. 이미지는 글 옆 폴더에 둔다.
const md = (dir: string) => glob({ pattern: '*.md', base: `./src/content/${dir}` });

const projects = defineCollection({
  loader: md('projects'),
  schema: ({ image }) =>
    z.object({
      ...common,
      role: z.string().min(1),
      team: z.array(z.string().min(1)).min(1), // 실명 대신 역할명
      period: z.string().min(1),
      status: z.enum(['진행 중', '완료']),
      featured: z.boolean().default(false),
      key_decisions: z.array(z.string().min(1)).length(3),
      outputs: z
        .array(z.object({ label: z.string().min(1), url: z.string().min(1) }))
        .min(1),
      cover: image(),
      cover_alt: z.string().min(1),
      retrospective: z.string().min(1),
    }),
});

const decisions = defineCollection({
  loader: md('decisions'),
  schema: z.object({
    ...common,
    project: reference('projects'),
    decision: z.string().min(1),
    rationale: z.string().min(1),
    rejected: z.array(z.string().min(1)).min(1),
    outcome: z.string().min(1),
  }),
});

const aiLab = defineCollection({
  loader: md('ai-lab'),
  schema: z.object({ ...common }),
});

const log = defineCollection({
  loader: md('log'),
  schema: z.object({ ...common }),
});

const study = defineCollection({
  loader: md('study'),
  schema: z.object({ ...common }),
});

const newsSchema = z.object({
  ...common,
  ai_assist: z.literal('자동 생성'),
  issue: z.number().int().positive(),
  coverage: z.object({ from: kstDate, to: kstDate }),
});

const newsGame = defineCollection({ loader: md('news-game'), schema: newsSchema });
const newsAi = defineCollection({ loader: md('news-ai'), schema: newsSchema });

// 고정 페이지(about 등). 파일명 = 경로 이름.
const pages = defineCollection({
  loader: md('pages'),
  schema: z.object({
    title: z.string().min(1),
    summary: z.string().max(160),
    ai_assist: z.enum(AI_ASSIST),
    updated: kstDate,
  }),
});

export const collections = {
  projects,
  decisions,
  'ai-lab': aiLab,
  log,
  study,
  'news-game': newsGame,
  'news-ai': newsAi,
  pages,
};
