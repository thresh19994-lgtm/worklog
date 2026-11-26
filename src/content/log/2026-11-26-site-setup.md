---
title: "작업 기록 사이트 뼈대 만들기"
date: "2026-11-26"
tags: ["사이트"]
summary: "Astro 6 Content Layer API로 포트폴리오 겸 작업 기록 사이트의 뼈대를 만들었다."
ai_assist: "자동 생성"
---

Claude Code가 지시서 v2의 Phase 1–2를 진행했다.

- 컬렉션 8개(projects, decisions, ai-lab, log, study, news-game, news-ai, pages)
- `npm run check`: 파일명·slug 검사, 신문 금지어 검사, 원시 HTML 검사, 스키마·타입 검사, 빌드
- 자동 생성 신문은 홈·RSS·sitemap에서 빼고 noindex
