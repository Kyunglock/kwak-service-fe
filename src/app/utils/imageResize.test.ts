import { describe, expect, it } from "vitest";
import { fitScale, MAX_EDGE, MAX_PIXELS } from "@/app/utils/imageResize";

describe("fitScale", () => {
  it("예산 안에 드는 이미지는 그대로 둔다", () => {
    expect(fitScale(800, 600)).toBe(1);
  });

  it("휴대폰 스크린샷은 픽셀 예산에 맞춰 줄인다", () => {
    // 갤럭시 스크린샷 1440×3120 (약 4.5MP)
    const scale = fitScale(1440, 3120);

    expect(scale).toBeLessThan(1);
    const width = Math.round(1440 * scale);
    const height = Math.round(3120 * scale);
    expect(width * height).toBeLessThanOrEqual(MAX_PIXELS * 1.01);
    // 가로가 너무 줄면 잔고 화면의 소수점 자리가 뭉개진다
    expect(width).toBeGreaterThan(900);
  });

  it("한 변이 지나치게 길면 변 기준으로도 자른다", () => {
    const scale = fitScale(400, 6000);

    expect(Math.round(6000 * scale)).toBeLessThanOrEqual(MAX_EDGE);
  });

  it("크기를 알 수 없으면 손대지 않는다", () => {
    expect(fitScale(0, 0)).toBe(1);
    expect(fitScale(Number.NaN, 100)).toBe(1);
  });
});
