import { describe, expect, it } from 'vitest';
import { INVEST_MBTI_TONE, MBTI_TYPE_TONES } from './featurePalettes';
import { THEME } from './tokens';

// 기능별 고유 색도 크림 카드 위 글자로 쓰이면 본문 대비(AA 4.5:1)를 지켜야 한다.
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
const hexOf = (cls: string) => cls.match(/#[0-9a-fA-F]{6}/)?.[0] ?? '';

describe('MBTI_TYPE_TONES', () => {
  it('성격 기질 4그룹(NT·NF·SJ·SP)이 모두 있다', () => {
    expect(Object.keys(MBTI_TYPE_TONES).sort()).toEqual(['NF', 'NT', 'SJ', 'SP']);
  });

  it.each(Object.entries(MBTI_TYPE_TONES))('%s 글자색이 크림 카드·히어로 면 위에서 4.5:1 이상', (_, tone) => {
    const fg = hexOf(tone.text);
    expect(contrast(fg, THEME.card)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(fg, hexOf(tone.hero))).toBeGreaterThanOrEqual(4.5);
  });
});

describe('INVEST_MBTI_TONE', () => {
  it('분홍 글자가 크림 카드·분홍 틴트 면 위에서 4.5:1 이상', () => {
    const fg = hexOf(INVEST_MBTI_TONE.text);
    expect(contrast(fg, THEME.card)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(fg, hexOf(INVEST_MBTI_TONE.surface))).toBeGreaterThanOrEqual(4.5);
  });
});
