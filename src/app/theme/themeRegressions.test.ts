import { describe, expect, it } from 'vitest';

// 크림 테마 최종 리뷰에서 나온 "안 보이는 글자·막대" 회귀를 막는다.
const SOURCES: Record<string, string> = import.meta.glob<string>('../components/**/*.tsx', {
  query: '?raw',
  import: 'default',
  eager: true,
});
const files = Object.keys(SOURCES).sort();
const src = (suffix: string) => SOURCES[files.find((f) => f.endsWith(suffix))!];

describe('theme regressions', () => {
  // prop="...${x}..." 는 보간되지 않고 '${x}' 글자 그대로 클래스가 된다
  it.each(files)('%s: 일반 문자열 속성에 ${} 가 없다', (f) => {
    const bad = SOURCES[f].split('\n').filter((l) => /\b\w+="[^"]*\$\{/.test(l));
    expect(bad).toEqual([]);
  });

  // 비활성 시 면이 bg-muted 로 바뀌는데 글자가 크림(primary-foreground)이면 글자가 사라진다
  it.each(files)('%s: disabled:bg-muted 버튼은 disabled 글자색도 바꾼다', (f) => {
    const bad = SOURCES[f]
      .split('\n')
      .filter((l) => /disabled:bg-muted\b/.test(l) && /\btext-primary-foreground\b/.test(l) && !/disabled:text-/.test(l));
    expect(bad).toEqual([]);
  });

  // 진한 색 면(테라코타·성공·경고·오류) 바로 안쪽에 갈색 본문 글자를 두지 않는다
  it.each(files)('%s: 진한 색 면 안에 text-foreground 글자가 없다', (f) => {
    const lines = SOURCES[f].split('\n');
    const bad: string[] = [];
    lines.forEach((l, i) => {
      if (!/\bbg-(primary|success|warning|destructive)(?![\w/-])/.test(l) || /-foreground\b(?!.*text-foreground)/.test(l)) return;
      if (!/<(div|span|button|Badge|Button)\b/.test(l)) return;
      [l, lines[i + 1] ?? '', lines[i + 2] ?? ''].forEach((x) => {
        if (/className=[^>]*\btext-foreground\b/.test(x)) bad.push(`${i + 1}: ${x.trim()}`);
      });
    });
    expect(bad).toEqual([]);
  });

  it('MBTI 게이지 트랙·중앙선이 카드(bg-card)와 구분된다', () => {
    const s = src('insights/StockMbtiCard.tsx');
    expect(s).not.toMatch(/relative h-2\.5 w-full overflow-hidden rounded-full bg-card/);
    expect(s).not.toMatch(/left-1\/2 top-0 h-full w-px bg-muted/);
  });

  it('응답·점수 막대의 "다른 항목" 색이 트랙(bg-muted)과 다르다', () => {
    expect(src('survey/components/SurveyStatsView.tsx')).not.toMatch(/isMine \? "bg-primary" : "bg-muted"/);
    expect(src('market/insights/GuruMatchCard.tsx')).not.toMatch(/isTop \? "bg-primary" : "bg-muted"/);
  });

  it('설문 결과 % 라벨이 테라코타 막대 위에서는 크림 글자다', () => {
    expect(src('survey/components/SurveyResult.tsx')).toMatch(/isMyAnswer && pct >= 50 \? "text-primary-foreground"/);
  });

  it('파이 라벨이 흰색 고정이 아니다', () => {
    expect(src('portfolio/PortfolioAnalysis.tsx')).not.toMatch(/fill="white"/);
    expect(src('portfolio/DividendDashboard.tsx')).not.toMatch(/fill="white"/);
  });
});
