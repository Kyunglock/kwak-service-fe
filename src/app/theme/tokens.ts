// theme.css :root 의 사본. CSS 변수를 쓸 수 없는 곳(recharts 의 SVG 속성 등)에서만 쓴다.
// 값을 바꿀 땐 theme.css 와 함께 바꾼다 — tokens.test.ts 가 둘의 일치를 검사한다.
export const THEME = {
  background: '#FAF6EE',
  card: '#FFFDF8',
  muted: '#F3ECDF',
  accent: '#FAEEE6',
  border: '#EADFCC',
  borderSoft: '#F0E6D6',
  foreground: '#3B2F26',
  mutedForeground: '#6B5747',
  faintForeground: '#776352',
  primary: '#A94F2B',
  primaryStrong: '#8E4123',
  primaryForeground: '#FFF8F0',
  up: '#38704A',
  down: '#B3302F',
  success: '#4E6C4F',
  warning: '#87590C',
  destructive: '#B83A2E',
} as const;

// 차트 계열색. 앞 5색은 진한 톤(흰 라벨), CHART_COLORS_10 의 뒤 5색은 같은 계열의 옅은 톤(갈색 라벨).
export const CHART_COLORS = ['#A94F2B', '#4E6C4F', '#87590C', '#3F6290', '#7A4E63'] as const;

// 10색이 필요한 파이·막대(종목·배당 비중)용: 진한 5색 + 같은 계열의 옅은 5색 (모두 불투명)
export const CHART_COLORS_10 = [...CHART_COLORS, '#E8B79C', '#B7CDB0', '#EBCB8B', '#AFC2DD', '#D9B8C6'] as const;

const luminance = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/** 차트 조각(면) 위에 얹는 라벨 색: 흰색과 본문 갈색 중 대비가 큰 쪽. */
export const chartLabelColor = (fill: string): string => {
  const l = luminance(fill);
  const onWhite = 1.05 / (l + 0.05);
  const onInk = (l + 0.05) / (luminance(THEME.foreground) + 0.05);
  return onWhite >= onInk ? '#FFFFFF' : THEME.foreground;
};
