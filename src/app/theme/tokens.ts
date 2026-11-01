// theme.css :root 의 사본. CSS 변수를 쓸 수 없는 곳(recharts 의 SVG 속성 등)에서만 쓴다.
// 값을 바꿀 땐 theme.css 와 함께 바꾼다 — tokens.test.ts 가 둘의 일치를 검사한다.
export const THEME = {
  background: '#FAF6EE',
  card: '#FFFDF8',
  muted: '#F3ECDF',
  border: '#EADFCC',
  borderSoft: '#F0E6D6',
  foreground: '#3B2F26',
  mutedForeground: '#6B5747',
  faintForeground: '#7F6A5A',
  primary: '#B4552F',
  primaryStrong: '#964526',
  primaryForeground: '#FFF8F0',
  up: '#3F7D4E',
  down: '#B3302F',
  success: '#557556',
  warning: '#94660F',
  destructive: '#B83A2E',
} as const;

export const CHART_COLORS = ['#C8643B', '#6B8F6B', '#D69A2D', '#4A6FA5', '#9A6B7F'] as const;
