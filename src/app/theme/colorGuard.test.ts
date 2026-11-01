import { describe, expect, it } from 'vitest';

// 크림 테마로 옮긴 경로에 옛 어두운 테마·"AI틱한" 장식이 다시 들어오지 않게 막는다.
// 영역을 하나 옮길 때마다 아래 GUARDED 에 import.meta.glob 한 줄을 추가한다
// (Vite 제약: 패턴과 옵션 모두 리터럴로 직접 써야 한다 — 변수로 뺄 수 없다).
const GUARDED: Record<string, string> = {
  ...import.meta.glob<string>('../components/ui/**/*.tsx', { query: '?raw', import: 'default', eager: true }),
  ...import.meta.glob<string>('../../styles/theme.css', { query: '?raw', import: 'default', eager: true }),
  ...import.meta.glob<string>('../components/layout/**/*.tsx', { query: '?raw', import: 'default', eager: true }),
  ...import.meta.glob<string>('../components/auth/**/*.tsx', { query: '?raw', import: 'default', eager: true }),
  ...import.meta.glob<string>('../components/portfolio/**/*.tsx', { query: '?raw', import: 'default', eager: true }),
  ...import.meta.glob<string>('../components/market/**/*.tsx', { query: '?raw', import: 'default', eager: true }),
  ...import.meta.glob<string>('../components/error/**/*.tsx', { query: '?raw', import: 'default', eager: true }),
  ...import.meta.glob<string>('../components/user/**/*.tsx', { query: '?raw', import: 'default', eager: true }),
  ...import.meta.glob<string>('../components/figma/**/*.tsx', { query: '?raw', import: 'default', eager: true }),
};

// 기능별 고유 색(MBTI 유형, 브랜드 버튼 등)은 featurePalettes.ts 에 모아 두고 가드에서 뺀다.
const EXEMPT = [/\.test\.tsx?$/, /\/theme\/featurePalettes\.ts$/];

const BANNED: { name: string; re: RegExp }[] = [
  { name: 'dark-surface', re: /\bbg-(slate|gray|zinc|neutral)-(6|7|8|9)00\b/ },
  { name: 'ai-gradient', re: /\b(from|via|to)-(teal|emerald|cyan|indigo|purple|violet|blue|sky)-\d/ },
  { name: 'glass', re: /\bbackdrop-blur/ },
  { name: 'glow', re: /\bshadow-(teal|emerald|cyan|indigo|purple|blue)-/ },
  { name: 'white-text', re: /\btext-white\b/ },
  { name: 'translucent-white', re: /\b(bg|border)-white\/(\d|\[)/ },
  { name: 'light-gray-text', re: /\btext-(gray|slate)-[1-4]00\b/ },
  { name: 'raw-semantic', re: /\b(text|bg|border)-(green|emerald|red|rose|blue|teal)-\d{3}\b/ },
  { name: 'slate-hex', re: /#(0f172a|1e293b|334155|475569|64748b|94a3b8|cbd5e1)\b/i },
];

const files = Object.keys(GUARDED)
  .filter((f) => !EXEMPT.some((re) => re.test(f)))
  .sort();

describe('color guard', () => {
  it('가드 대상 파일이 있다', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it.each(files)('%s 에 금지 패턴이 없다', (file) => {
    const violations = GUARDED[file]
      .split('\n')
      .flatMap((line, i) =>
        BANNED.filter(({ re }) => re.test(line)).map(({ name }) => `${file}:${i + 1} ${name} → ${line.trim()}`),
      );
    expect(violations).toEqual([]);
  });
});
