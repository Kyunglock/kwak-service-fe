import { describe, expect, it } from 'vitest';
import { CHART_COLORS, CHART_COLORS_10, THEME } from './tokens';
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

  it('CHART_COLORS_10 은 서로 다른 10색이고 앞 5색은 CHART_COLORS 와 같다', () => {
    expect(new Set(CHART_COLORS_10).size).toBe(10);
    expect(CHART_COLORS_10.slice(0, 5)).toEqual([...CHART_COLORS]);
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
});
