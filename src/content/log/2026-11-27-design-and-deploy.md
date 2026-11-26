---
title: "디자인 적용과 배포·보호 설정"
date: "2026-11-27"
tags: ["사이트"]
summary: "AstroPaper 디자인을 옮기고, GitHub 룰셋과 Cloudflare Pages·Access를 설정해 사이트를 배포했다."
ai_assist: "자동 생성"
---

Claude Code가 지시서 v2의 Phase 3–4를 진행한 기록이다.

## 디자인 (Phase 3)

- 후보: AstroPaper(별 5,230개, MIT)와 Astro Micro(별 541개, MIT). 긴 기획서를 읽기 좋은 목차와 유지보수 활발함을 보고 AstroPaper를 골랐다.
- 테마를 통째로 덮지 않고 색·헤더·카드·본문 스타일만 일반 CSS로 옮겼다. Tailwind를 들이지 않아 혼자 유지보수하기 쉽다.
- 모바일 Lighthouse: 홈 성능 97·접근성 100, 프로젝트 페이지 100·100. 글꼴 CSS를 비차단으로 불러와 홈 성능이 92에서 97로 올랐다.

## 배포와 보호 (Phase 4)

- GitHub 공개 저장소 + Actions에서 `npm run check`.
- Cloudflare Pages: `worklog.pages.dev`는 이미 쓰이고 있어 `worklog-4ce.pages.dev`가 됐다.
- 미리보기 배포는 Cloudflare Access로 잠갔다. 운영 주소는 공개.
- 룰셋: main 직접 push 금지, PR 필수, 검사 통과 필수, 강제 push 금지.

## 겪은 문제

- 룰셋의 "필수 검사" 목록에 옵션 이름("require branches to be up to date…")이 검사 이름으로 들어가, 어떤 PR도 머지할 수 없는 상태가 됐다. 존재하지 않는 검사는 영원히 "대기"로 남는다. 목록에서 빼고 옵션을 켜서 해결했다.
- GitHub 로그인 토큰에 `workflow` 권한이 없어 워크플로 파일이 든 첫 push가 거부됐다. 권한을 추가해 해결했다.
