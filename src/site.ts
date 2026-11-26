// 사이트 기본 정보. 공개 전에 직접 채운다(이메일만 공개, 전화·주소·생년월일은 넣지 않는다).
export const SITE = {
  name: '[이름]',
  title: '[이름] — 게임 기획 포트폴리오',
  description: '게임 기획자 [이름]의 포트폴리오와 작업 기록',
  role: '게임 기획자',
  // 핵심 역량 3줄 (홈 첫 화면)
  strengths: [
    '[핵심 역량 1 — 예: 시스템·밸런스 기획]',
    '[핵심 역량 2 — 예: 팀 리딩과 일정 관리]',
    '[핵심 역량 3 — 예: AI를 활용한 기획 워크플로]',
  ],
  email: 'you@example.com',
  // 비워 두면 홈에 표시하지 않는다. 예: 'https://github.com/<아이디>'
  github: '',
};

export const NAV = [
  { href: '/', label: '홈' },
  { href: '/projects/', label: '프로젝트' },
  { href: '/ai-lab/', label: 'AI 활용' },
  { href: '/archive/', label: '아카이브' },
  { href: '/about/', label: '소개' },
];
