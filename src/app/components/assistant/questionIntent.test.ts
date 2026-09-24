import { describe, expect, it } from "vitest";
import { detectQuestionIntent } from "./questionIntent";

// 매매기록 예문(AiAssistant.tsx 의 EXAMPLES 앞 3개)이 질문으로 오탐되지 않는 것이
// 이 테스트의 핵심이다 — 오탐되면 매매기록을 입력했는데 시황 질문 경로로 새서
// 포트폴리오 확인 없이 처리되거나 엉뚱한 답이 나간다.
describe("detectQuestionIntent", () => {
  it("매매기록 예문은 질문으로 오탐하지 않는다", () => {
    expect(detectQuestionIntent("어제 애플 10주를 230달러에 샀어")).toBe(false);
    expect(detectQuestionIntent("삼성전자 5주 71,000원에 매도했어")).toBe(false);
    expect(detectQuestionIntent("엔비디아 2주 매수, 단가는 180.5")).toBe(false);
  });

  it("MAX_DROP_DAY / MAX_GAIN_DAY 트리거 문구를 감지한다", () => {
    expect(detectQuestionIntent("올해 애플 가장 많이 하락했던 날 무슨 일이 있었는지")).toBe(true);
    expect(detectQuestionIntent("테슬라 가장 떨어진 날이 언제야")).toBe(true);
    expect(detectQuestionIntent("삼성전자 최근 3개월 중 제일 오른 날")).toBe(true);
    expect(detectQuestionIntent("엔비디아 가장 많이 상승한 날")).toBe(true);
  });

  it("PERIOD_RETURN 트리거 문구를 감지한다", () => {
    expect(detectQuestionIntent("테슬라 올해 수익률 얼마야?")).toBe(true);
  });

  it("PERIOD_HIGH_LOW 트리거 문구를 감지한다", () => {
    expect(detectQuestionIntent("엔비디아 올해 최고가가 언제였어")).toBe(true);
    expect(detectQuestionIntent("애플 최저가는 얼마였어")).toBe(true);
    expect(detectQuestionIntent("삼성전자 고점 저점 알려줘")).toBe(true);
  });

  it("DIVIDEND_SUMMARY 트리거 문구를 감지한다", () => {
    expect(detectQuestionIntent("코카콜라 최근 배당 얼마씩 줬어")).toBe(true);
    expect(detectQuestionIntent("애플 배당 이력 알려줘")).toBe(true);
  });

  it("트리거 문구가 전혀 없으면 false", () => {
    expect(detectQuestionIntent("안녕하세요")).toBe(false);
    expect(detectQuestionIntent("")).toBe(false);
  });
});
