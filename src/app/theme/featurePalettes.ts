// 기능별 고유 색. 색 계열(분홍·남색·호박 등)은 기능의 정체성이라 유지하되, 크림 바탕에 맞춰 채도를 낮춘 톤만 쓴다.
// 이 파일은 색 가드(colorGuard.test.ts) 대상에서 빠진다 — 고유 색은 여기에만 둔다.

/** 대문 "투자 놀이터" 카드 3종. 키는 카드 제목(인앱 카피 그대로). */
export const PLAYGROUND_TONES: Record<string, { icon: string; iconBg: string; hover: string }> = {
  '투자 MBTI 알아보기!': { icon: 'text-[#A3546A]', iconBg: 'bg-[#F5E3E7]', hover: 'hover:border-[#E3C3CC]' },
  '내 포트폴리오와 맞는 투자 대가는?': { icon: 'text-[#4A6FA5]', iconBg: 'bg-[#E3EAF3]', hover: 'hover:border-[#C5D2E4]' },
  '오늘의 종목운세': { icon: 'text-[#94660F]', iconBg: 'bg-[#F5EAD2]', hover: 'hover:border-[#E6D2A8]' },
};
