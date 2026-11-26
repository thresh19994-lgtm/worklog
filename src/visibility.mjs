// 사이트 공개 범위.
// true  = 비공개 링크 모드: 주소를 아는 사람만 열 수 있다. 모든 페이지에 noindex를 달고
//         sitemap을 비우고 robots.txt에서 sitemap을 알리지 않는다. 사이트 안 어디에도 주소를 홍보하지 않는다.
// false = 정식 공개: 검색엔진 색인 허용, sitemap 생성 (자동 생성 신문은 항상 noindex).
// 바꿀 때는 public/_headers의 X-Robots-Tag 줄도 함께 정리한다.
export const UNLISTED = true;
