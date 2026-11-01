// 기능별 고유 색. 색 계열(분홍·남색·호박 등)은 기능의 정체성이라 유지하되, 크림 바탕에 맞춰 채도를 낮춘 톤만 쓴다.
// 이 파일은 색 가드(colorGuard.test.ts) 대상에서 빠진다 — 고유 색은 여기에만 둔다.

/** 대문 "투자 놀이터" 카드 3종. 키는 카드 제목(인앱 카피 그대로). */
export const PLAYGROUND_TONES: Record<string, { icon: string; iconBg: string; hover: string }> = {
  '투자 MBTI 알아보기!': { icon: 'text-[#A3546A]', iconBg: 'bg-[#F5E3E7]', hover: 'hover:border-[#E3C3CC]' },
  '내 포트폴리오와 맞는 투자 대가는?': { icon: 'text-[#4A6FA5]', iconBg: 'bg-[#E3EAF3]', hover: 'hover:border-[#C5D2E4]' },
  '오늘의 종목운세': { icon: 'text-[#94660F]', iconBg: 'bg-[#F5EAD2]', hover: 'hover:border-[#E6D2A8]' },
};

/** 시황 브리핑 감성 테마. 호재=초록(up), 악재=빨강(down) — 앱 전체 규칙(상승·호재 초록 / 하락·악재 빨강)과 같다. */
export const BRIEFING_SENTIMENT: Record<
  'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | 'UNKNOWN',
  { header: string; iconBox: string; iconColor: string; chip: string }
> = {
  POSITIVE: { header: 'bg-up/10 border-up/25', iconBox: 'bg-up/15', iconColor: 'text-up', chip: 'bg-up/10 text-up border border-up/30' },
  NEGATIVE: { header: 'bg-down/10 border-down/25', iconBox: 'bg-down/15', iconColor: 'text-down', chip: 'bg-down/10 text-down border border-down/30' },
  NEUTRAL: { header: 'bg-muted border-border', iconBox: 'bg-secondary', iconColor: 'text-muted-foreground', chip: 'bg-muted text-muted-foreground border border-border' },
  UNKNOWN: { header: 'bg-accent border-border', iconBox: 'bg-primary/15', iconColor: 'text-primary', chip: 'bg-muted text-muted-foreground border border-border' },
};

/** 종목운세 카드 — 호박(amber) 계열을 크림에 맞춘 톤. 놀이터 '오늘의 종목운세'와 같은 색. */
export const FORTUNE_TONES = {
  border: 'border-[#E6D2A8]',
  title: 'text-[#94660F]',
  button: 'bg-[#94660F] text-primary-foreground hover:bg-[#7D560C]',
  focus: 'focus:border-[#94660F]/60',
  surface: 'bg-[#F5EAD2]/60',
} as const;
