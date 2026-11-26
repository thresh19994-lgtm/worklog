# worklog

게임 기획자 포트폴리오 겸 작업 기록 사이트. Astro 6(Content Layer API) 정적 사이트, Cloudflare Pages 배포.

- 운영: https://worklog-4ce.pages.dev
- 미리보기(`*.worklog-4ce.pages.dev`)는 Cloudflare Access로 계정 소유자만 볼 수 있다.
- **현재는 비공개 링크 모드**다(`src/visibility.mjs`의 `UNLISTED = true`). 주소를 아는 사람은 로그인 없이 열 수 있지만,
  모든 페이지와 파일에 noindex가 붙고 sitemap이 비어 있어 검색엔진에 나오지 않는다.
  - 정식 공개: `UNLISTED = false`로 바꾸고 `public/_headers`의 전체 noindex 줄을 지운다(파일 안 설명 참고).
  - 완전히 잠그기(본인만): Cloudflare → Zero Trust → Access controls → Applications → `worklog - Cloudflare Pages` → Edit →
    Destinations에 하위 도메인이 빈 `worklog-4ce.pages.dev` 줄을 추가 → Save. 풀 때는 그 줄만 지운다. `*` 줄(미리보기)은 항상 남겨 둔다.

- 첫 독자는 채용 담당자: 홈은 고정형(역할·역량 3줄 → 대표작 → 진행 중 → 연락처).
- 자동 생성 신문은 `/archive` 안에만 둔다. 홈·RSS·sitemap·태그 목록에서 빠지고 `noindex`가 붙는다.
- 작업 규칙은 [CLAUDE.md](CLAUDE.md)에 있다.

## 명령

| 명령 | 하는 일 |
|---|---|
| `npm run dev` | 로컬 개발 서버 (http://localhost:4321). 검색은 빌드 후에만 동작 |
| `npm run build` | `astro build && pagefind --site dist` |
| `npm run check` | 콘텐츠 검사 → `astro check`(스키마·타입) → 빌드. 커밋 전에 반드시 통과 |
| `node scripts/check.mjs --content` | 콘텐츠 검사만 (빠름) |

Node 22.12 이상(`.nvmrc` = 22).

## 구조

```
src/
  content.config.ts        컬렉션 스키마 (glob loader, z from 'astro/zod')
  content/
    projects/              프로젝트. YYYY-MM-DD-<slug>.md + 같은 이름 폴더(이미지)
    decisions/             기획 결정 로그. frontmatter project: <프로젝트 id>
    ai-lab/                AI 활용 사례 (문제→선택지→결정→검증→전후→배운 점)
    log/                   작업 일지·분석
    study/                 스터디 기록
    news-game/, news-ai/   자동 생성 주간 신문 (.md만, ai_assist "자동 생성" 고정)
    pages/about.md         소개 페이지 본문
  pages/                   라우트
  layouts/, components/    BaseLayout(헤더·테마 전환·모바일 메뉴), PostLayout(목차), PostMeta, PostList, DecisionItem, Icon
  styles/global.css        디자인 토큰과 전체 스타일 (AstroPaper 기반, THIRD_PARTY_LICENSES.md)
  lib/                     getPublished(draft 제외·날짜 정렬), entryUrl, 태그 수집
  plugins/                 rehype: 외부 링크에 rel="nofollow noopener noreferrer"
  site.ts                  이름·역량 3줄·이메일·메뉴  ← 공개 전에 직접 채우기
scripts/
  check.mjs                검사 스크립트
  forbidden.txt            신문 금지어 목록 (한 줄에 하나)
public/files/              공개 PDF (메타데이터 지운 사본만)
.github/workflows/check.yml  CI: npm run check + 신문 브랜치 경로 검사
```

### 라우트

| 경로 | 내용 |
|---|---|
| `/` | 홈 (고정형) |
| `/projects/`, `/projects/[id]/` | 프로젝트 목록·상세 (필수 항목 + 기획 결정 로그 타임라인) |
| `/ai-lab/`, `/ai-lab/[id]/` | AI 활용 사례 |
| `/archive/` | 작업 일지·스터디·주간 신문 목록 |
| `/archive/log/[id]/`, `/archive/study/[id]/` | 일지·스터디 글 |
| `/archive/news/game/[id]/`, `/archive/news/ai/[id]/` | 신문 (noindex, 자동 생성 배지) |
| `/tags/`, `/tags/[tag]/` | 태그 (신문 제외) |
| `/about/` | 소개 |
| `/search/` | Pagefind 검색 (한국어는 앞부분 일치 수준) |
| `/rss.xml`, `/sitemap-index.xml` | 신문 제외 |

### 스키마 요약

- 공통: `title`, `date`(KST `YYYY-MM-DD`), `tags`, `summary`(≤160자), `ai_assist`(`없음|교정|초안|자동 생성`), `draft`(기본 false)
- projects 필수: `role`, `team`(역할명 배열), `period`, `status`(`진행 중|완료`), `key_decisions`(정확히 3개), `outputs`(`{label,url}` 1개 이상), `cover`(image), `cover_alt`, `retrospective`. `featured: true`인 프로젝트가 홈 대표작
- decisions 필수: `project`, `decision`, `rationale`, `rejected`(배열), `outcome`
- news-* 필수: `issue`(정수), `coverage{from,to}`, `ai_assist: "자동 생성"`
- 필수 항목이 빠지면 `astro check`/빌드가 실패한다.

### 콘텐츠 검사 (`scripts/check.mjs`)

- 파일명 `YYYY-MM-DD-<slug>.md`, slug `^[a-z0-9-]+$`, 존재하는 날짜인지
- 모든 글: `<script`, `<iframe`, `<style`, `on*=`, `javascript:`, 로컬 절대 경로, 토큰·키 형식이 있으면 실패
- news-*: `forbidden.txt`의 금지어가 있으면 실패, `.mdx` 금지
- 이미지: 영문 파일명, 1MB 이하
- 실패하면 사람이 읽을 수 있는 목록을 출력하고 종료 코드 1

## 진행 상황

- [x] Phase 1 — CLAUDE.md, Astro 6 뼈대, 컬렉션·라우트, 예시 글
- [x] Phase 2 — 검사 스크립트 (가짜 신문·스키마 누락 파일로 실패 확인 후 삭제함)
- [x] Phase 1 마지막 — `git init`과 첫 커밋
- [x] Phase 3 — AstroPaper v6.1.0 디자인을 일반 CSS로 이식(Tailwind 없음), Pretendard. 모바일 Lighthouse: 홈 성능 97·접근성 100, 프로젝트 100·100
- [ ] Phase 4 — GitHub 저장소·룰셋·Cloudflare Pages (아래 절차)
- [ ] Phase 5 — 실제 콘텐츠 (예시 글의 `[...]` 자리표시를 모두 교체)

## Phase 4 — 원격 연결·보호·배포 절차

### 1. GitHub 저장소

```powershell
winget install --id Git.Git -e
winget install --id GitHub.cli -e
git config --global core.autocrlf false
gh auth login
```

그다음 이 폴더에서:

```powershell
git init -b main
git add .
git commit -m "Initial site skeleton"
gh repo create worklog --public --source=. --push
```

### 2. 룰셋 (GitHub → Settings → Rules → Rulesets → New branch ruleset)

| 항목 | 값 |
|---|---|
| Ruleset name | `protect-main` |
| Enforcement status | Active |
| Bypass list | 비워 둔다 |
| Target branches | Include default branch (`main`) |
| Restrict deletions | 켬 |
| Require a pull request before merging | 켬 (Required approvals 0 — 혼자 운영) |
| Require status checks to pass | 켬 → `npm run check` 추가. "Require branches to be up to date" 켬 |
| Block force pushes | 켬 |

`news path guard` job은 `claude/news-*` 브랜치의 PR에서만 돌고, `src/content/news-*/` 밖의 파일을 바꾸면 실패한다. 이 job도 필수 검사로 넣으려면 두 번째 룰셋을 만든다. 신문 PR이 아닐 때는 이 job이 건너뛰어지므로(skipped = 통과 처리) 다른 PR을 막지 않는다.

확인: `git push origin main`을 직접 시도해 거부되는지 본다.

### 3. Cloudflare Pages

1. Cloudflare 대시보드 → Workers & Pages → Create → Pages → Connect to Git → `worklog` 선택
2. 빌드 설정
   - Framework preset: Astro
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Environment variable: `NODE_VERSION` = `22`
3. 배포 후 실제 주소(`https://<프로젝트>.pages.dev`)를 `astro.config.mjs`의 `SITE`에 넣는다.

### 4. 미리보기 배포에 Cloudflare Access 걸기

1. Pages 프로젝트 → Settings → General → **Access policy** → Enable(미리보기 배포 보호)
2. Zero Trust 대시보드 → Access → Applications에서 자동 생성된 앱을 연다
3. Policy: Action `Allow`, Include → `Emails` → 내 이메일 하나
4. 로그인 방법: One-time PIN(이메일 코드)
5. 확인: 시크릿 창에서 미리보기 URL(`https://<해시>.<프로젝트>.pages.dev`)을 열어 로그인 화면이 나오는지 본다

Pages 대신 Workers로 옮길 수도 있지만, 미리보기 보호 설정이 간단해서 Pages를 유지한다.

## 공개 전 직접 확인할 것

- `src/site.ts`의 이름·역량 3줄·이메일
- GGC 팀원·강사의 공개 동의, 학원 과제 공개 가능 여부
- 기획서·이력서 PDF는 메타데이터(작성자·경로)를 지운 사본만 `public/files/`에 둔다. 현재 `ggc-design-doc.pdf`는 자리표시 파일이다
- 예시 글의 `[...]` 자리표시가 남아 있지 않은지
