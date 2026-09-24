/**
 * AiAssistant 입력이 "매매기록"인지 "시황 질문"인지 1차로 가른다.
 *
 * FE 규칙 기반 라우팅을 쓰는 이유: 질문 유형이 고정 5개라 자유 NLU가 아니라
 * 사실상 닫힌 집합의 커맨드 매칭에 가깝다. BE에서 LLM으로 먼저 분류하면
 * 모든 요청에 판단용 LLM 호출이 하나 더 붙어 지연이 늘고, 숫자·종목명이 섞인
 * 질문을 매매추출 프롬프트가 오인해 엉뚱한 매매 초안을 보여줄 위험도 있다.
 *
 * 여기서 걸러지지 않은 애매한 문장은 BE 의도추출 프롬프트가 2차 안전망으로
 * "UNKNOWN" 처리한다 — 오탐이 있어도 사용자에게 이상한 결과가 나가지 않는다.
 */

const QUESTION_TRIGGERS: RegExp[] = [
  // MAX_DROP_DAY / MAX_GAIN_DAY
  /(가장|제일)\s*(많이)?\s*(하락|떨어진|빠진)/,
  /(가장|제일)\s*(많이)?\s*(오른|상승한)/,
  // PERIOD_RETURN
  /수익률/,
  // PERIOD_HIGH_LOW
  /최고가|최저가|고점|저점/,
  // DIVIDEND_SUMMARY
  /배당.*(얼마|언제|이력|줬)/,
];

export function detectQuestionIntent(text: string): boolean {
  return QUESTION_TRIGGERS.some((re) => re.test(text));
}
