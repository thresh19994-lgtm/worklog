#!/usr/bin/env node
// npm run check = 콘텐츠 검사(이 파일) + 스키마·타입 검사(astro check) + 빌드(astro build && pagefind).
// 사용법:
//   node scripts/check.mjs              전체 실행
//   node scripts/check.mjs --content    콘텐츠 검사만 (빠름)
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = path.join(ROOT, 'src', 'content');
const contentOnly = process.argv.includes('--content');

// 파일명 규칙에서 빠지는 컬렉션 (고정 페이지: about.md 등)
const FILENAME_EXEMPT = new Set(['pages']);
const IMAGE_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.avif', '.svg']);
const MAX_IMAGE_BYTES = 1024 * 1024;

/** @type {{ file: string, rule: string, detail: string }[]} */
const errors = [];
const fail = (file, rule, detail) => errors.push({ file: path.relative(ROOT, file).replaceAll('\\', '/'), rule, detail });

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

function loadForbidden() {
  const file = path.join(ROOT, 'scripts', 'forbidden.txt');
  return readFileSync(file, 'utf8')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'));
}

function isValidDate(y, m, d) {
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

// 콘텐츠 전체에 적용하는 위험 패턴
const DANGEROUS = [
  { re: /<script\b/i, rule: '원시 HTML', detail: '<script 태그' },
  { re: /<iframe\b/i, rule: '원시 HTML', detail: '<iframe 태그' },
  { re: /<style\b/i, rule: '원시 HTML', detail: '<style 태그' },
  { re: /<[a-z][^>]*\son[a-z]+\s*=/i, rule: '원시 HTML', detail: 'on*= 이벤트 속성' },
  { re: /javascript\s*:/i, rule: '위험 링크', detail: 'javascript: 링크' },
  { re: /\b[A-Za-z]:\\(?:Users|dev|Windows|Program Files)\\/i, rule: '로컬 경로', detail: 'Windows 절대 경로' },
  { re: /(?:^|[\s("'])\/(?:Users|home)\/[^\s/]+\//, rule: '로컬 경로', detail: 'macOS/Linux 홈 경로' },
  { re: /\b(?:ghp|gho|ghs|github_pat)_[A-Za-z0-9_]{20,}/, rule: '비밀값', detail: 'GitHub 토큰 형식' },
  { re: /\bsk-(?:ant-)?[A-Za-z0-9_-]{20,}/, rule: '비밀값', detail: 'API 키 형식(sk-...)' },
  { re: /\bAKIA[0-9A-Z]{16}\b/, rule: '비밀값', detail: 'AWS 액세스 키 형식' },
  { re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/, rule: '비밀값', detail: '개인 키' },
];

function lineOf(text, index) {
  return text.slice(0, index).split('\n').length;
}

function checkContent() {
  if (!existsSync(CONTENT)) {
    fail(CONTENT, '구조', 'src/content 폴더가 없습니다');
    return 0;
  }
  const forbidden = loadForbidden();
  const files = walk(CONTENT);
  let docCount = 0;

  for (const file of files) {
    const rel = path.relative(CONTENT, file);
    const parts = rel.split(path.sep);
    const collection = parts[0];
    const base = path.basename(file);
    const ext = path.extname(file).toLowerCase();
    const isNews = collection.startsWith('news-');

    // 이미지: 영문 파일명, 1MB 이하
    if (IMAGE_EXT.has(ext)) {
      if (!/^[a-z0-9][a-z0-9-_.]*$/.test(base)) fail(file, '이미지 파일명', '영문 소문자·숫자·하이픈만 씁니다');
      const size = statSync(file).size;
      if (size > MAX_IMAGE_BYTES) fail(file, '이미지 크기', `${(size / 1024 / 1024).toFixed(2)}MB > 1MB`);
      continue;
    }

    if (ext !== '.md' && ext !== '.mdx') continue;
    docCount++;

    if (ext === '.mdx' && isNews) fail(file, 'MDX 금지', 'news-* 컬렉션에는 .mdx를 쓸 수 없습니다');
    if (parts.length !== 2) fail(file, '위치', '글은 컬렉션 폴더 바로 아래에 둡니다 (하위 폴더는 이미지용)');

    // 파일명: YYYY-MM-DD-<slug>.md
    if (!FILENAME_EXEMPT.has(collection)) {
      const m = /^(\d{4})-(\d{2})-(\d{2})-(.+)\.mdx?$/.exec(base);
      if (!m) {
        fail(file, '파일명', 'YYYY-MM-DD-<slug>.md 형식이 아닙니다');
      } else {
        const [, y, mo, d, slug] = m;
        if (!isValidDate(+y, +mo, +d)) fail(file, '파일명 날짜', `${y}-${mo}-${d}는 없는 날짜입니다`);
        if (!/^[a-z0-9-]+$/.test(slug)) fail(file, 'slug', `"${slug}" — 영문 소문자·숫자·하이픈만 씁니다`);
      }
    } else if (!/^[a-z0-9-]+\.mdx?$/.test(base)) {
      fail(file, 'slug', '영문 소문자·숫자·하이픈만 씁니다');
    }

    const text = readFileSync(file, 'utf8');

    for (const { re, rule, detail } of DANGEROUS) {
      const match = re.exec(text);
      if (match) fail(file, rule, `${detail} (${lineOf(text, match.index)}행)`);
    }

    if (isNews) {
      const lower = text.toLowerCase();
      for (const word of forbidden) {
        const idx = lower.indexOf(word.toLowerCase());
        if (idx !== -1) fail(file, '신문 금지어', `"${word}" (${lineOf(text, idx)}행)`);
      }
    }
  }
  return docCount;
}

function run(label, cmd) {
  console.log(`\n▶ ${label}: ${cmd}`);
  const r = spawnSync(cmd, { cwd: ROOT, stdio: 'inherit', shell: true });
  if (r.status !== 0) {
    console.error(`\n✖ ${label} 실패 (종료 코드 ${r.status})`);
    process.exit(1);
  }
  console.log(`✔ ${label} 통과`);
}

// 1) 콘텐츠 검사
console.log('▶ 콘텐츠 검사: 파일명·slug·이미지·원시 HTML·비밀값·로컬 경로·신문 금지어');
const count = checkContent();
if (errors.length > 0) {
  console.error(`\n✖ 콘텐츠 검사 실패: ${errors.length}건\n`);
  for (const e of errors) console.error(`  - [${e.rule}] ${e.file}: ${e.detail}`);
  console.error('\n규칙은 CLAUDE.md를, 금지어 목록은 scripts/forbidden.txt를 보세요.');
  process.exit(1);
}
console.log(`✔ 콘텐츠 검사 통과 (글 ${count}개)`);

if (contentOnly) process.exit(0);

// 2) 스키마·타입 검사, 3) 빌드
run('스키마·타입 검사', 'npx astro check');
run('빌드', 'npm run build');
console.log('\n✔ npm run check 전체 통과');
