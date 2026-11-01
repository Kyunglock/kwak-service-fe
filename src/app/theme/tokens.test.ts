import { describe, expect, it } from 'vitest';
import { CHART_COLORS, CHART_COLORS_10, THEME, chartLabelColor } from './tokens';
import css from '../../styles/theme.css?raw';

// 테마 토큰의 단일 출처는 theme.css 다. tokens.ts 는 CSS 변수를 못 쓰는 곳(recharts SVG 속성)용 사본이라
// 두 값이 어긋나면 차트만 다른 색이 된다.
const rootBlock = css.match(/:root\s*\{([\s\S]*?)\n\}/)?.[1] ?? '';

const kebab = (key: string) => key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
const cssVar = (name: string) => rootBlock.match(new RegExp(`--${name}:\\s*([^;]+);`))?.[1].trim();

// WCAG 2.x 상대휘도·대비
const luminance = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
// 반투명 틴트(bg-up/10 등)를 카드 위에 합성한 실제 면 색
const tint = (fg: string, alpha: number, bg: string = THEME.card) => {
  const ch = (h: string, i: number) => parseInt(h.slice(i, i + 2), 16);
  return '#' + [1, 3, 5].map((i) => Math.round(ch(fg, i) * alpha + ch(bg, i) * (1 - alpha)).toString(16).padStart(2, '0')).join('');
};
const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

describe('theme tokens', () => {
  it.each(Object.entries(THEME))('tokens.ts %s 가 theme.css :root 값과 같다', (key, value) => {
    expect(cssVar(kebab(key))?.toLowerCase()).toBe(value.toLowerCase());
  });

  it.each(CHART_COLORS.map((c, i) => [i + 1, c] as const))('CHART_COLORS[%i] 가 --chart-n 과 같다', (n, value) => {
    expect(cssVar(`chart-${n}`)?.toLowerCase()).toBe(value.toLowerCase());
  });

  it('CHART_COLORS_10 은 서로 다른 10색(불투명)이고 앞 5색은 CHART_COLORS 와 같다', () => {
    expect(new Set(CHART_COLORS_10).size).toBe(10);
    expect(CHART_COLORS_10.slice(0, 5)).toEqual([...CHART_COLORS]);
    CHART_COLORS_10.forEach((c) => expect(c).toMatch(/^#[0-9A-Fa-f]{6}$/));
  });

  it('body 규칙에 옛 남색 배경 #1e293b 가 없다', () => {
    expect(css).not.toMatch(/#1e293b/i);
  });

  it('.dark 블록이 없다', () => {
    expect(css).not.toMatch(/^\.dark\s*\{/m);
  });

  it.each([
    ['foreground', 'background'],
    ['foreground', 'card'],
    ['mutedForeground', 'card'],
    ['faintForeground', 'card'],
    ['faintForeground', 'background'],
    ['primaryForeground', 'primary'],
    ['up', 'card'],
    ['down', 'card'],
    ['destructive', 'card'],
    ['primary', 'card'],
    ['primary', 'background'],
    ['up', 'background'],
    ['down', 'background'],
    ['success', 'card'],
    ['warning', 'card'],
  ] as const)('%s / %s 대비가 4.5:1 이상', (fg, bg) => {
    expect(contrast(THEME[fg], THEME[bg])).toBeGreaterThanOrEqual(4.5);
  });

  // 옅은 면 위 작은 글자(선택된 메뉴, 배지, 칩 등)도 본문 기준 4.5:1 (스펙 4.4)
  it.each([
    ['primary on accent', THEME.primary, THEME.accent],
    ['up on accent', THEME.up, THEME.accent],
    ['up on muted', THEME.up, THEME.muted],
    ['faintForeground on accent', THEME.faintForeground, THEME.accent],
    ['faintForeground on muted', THEME.faintForeground, THEME.muted],
    ['mutedForeground on accent', THEME.mutedForeground, THEME.accent],
    ['up on up/10', THEME.up, tint(THEME.up, 0.1)],
    ['down on down/10', THEME.down, tint(THEME.down, 0.1)],
    ['success on success/15', THEME.success, tint(THEME.success, 0.15)],
    ['warning on warning/15', THEME.warning, tint(THEME.warning, 0.15)],
    ['destructive on destructive/10', THEME.destructive, tint(THEME.destructive, 0.1)],
  ] as const)('%s 대비가 4.5:1 이상', (_, fg, bg) => {
    expect(contrast(fg, bg)).toBeGreaterThanOrEqual(4.5);
  });

  // 파이 조각 위 이름·퍼센트 라벨(11px)은 조각 색마다 흰색/갈색 중 읽히는 쪽을 쓴다
  it.each(CHART_COLORS_10.map((c) => [c] as const))('차트 조각 %s 위 라벨이 4.5:1 이상', (c) => {
    expect(contrast(chartLabelColor(c), c)).toBeGreaterThanOrEqual(4.5);
  });
});
