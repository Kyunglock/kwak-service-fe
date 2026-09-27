/**
 * 업로드 전 화면 캡처 축소.
 *
 * <p>요즘 휴대폰 스크린샷은 1440×3120 PNG 로 3MB 를 넘기 일쑤다. 그대로 올리면
 * 프록시의 업로드 상한에 먼저 걸리고, 통과하더라도 base64 로 1.34배 불어난 페이로드가
 * 로컬 GPU 로 간다. 비전 모델은 어차피 자체 전처리에서 이미지를 줄이므로, 여기서 미리
 * 픽셀 예산에 맞춰 줄여도 읽히는 글자 수는 달라지지 않는다.
 *
 * <p>가로폭이 글자 크기를 결정하므로 긴 변만 자르지 않고 총 픽셀 수로 예산을 잡는다.
 * 세로로 긴 잔고 화면에서 가로를 최대한 남기기 위함이다.
 */

/** 픽셀 예산 (약 2.2MP). 1440×3120 → 약 1010×2188 */
export const MAX_PIXELS = 2_200_000;

/** 한 변 상한 — 예산 안이라도 극단적으로 긴 캡처를 막는다 */
export const MAX_EDGE = 2400;

/** 이 크기 이하이고 축소도 필요 없으면 원본을 그대로 쓴다 */
export const KEEP_ORIGINAL_BYTES = 900 * 1024;

/** JPEG 품질 — 스크린샷의 숫자가 뭉개지지 않는 선 */
const JPEG_QUALITY = 0.9;

/** 원본 대비 축소 배율. 줄일 필요가 없으면 1. */
export function fitScale(width: number, height: number): number {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return 1;
  }
  const byPixels = Math.sqrt(MAX_PIXELS / (width * height));
  const byEdge = MAX_EDGE / Math.max(width, height);
  return Math.min(1, byPixels, byEdge);
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("이미지를 열지 못했습니다"));
    };
    img.src = url;
  });
}

function toBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("이미지 변환 실패"))),
      "image/jpeg",
      JPEG_QUALITY,
    );
  });
}

/**
 * 업로드에 쓸 파일을 만든다.
 *
 * <p>어떤 이유로든 축소에 실패하면 원본을 그대로 돌려준다 — 줄이려다 못 올리게 되는
 * 것이 제일 나쁘다. 축소 결과가 원본보다 크면(이미 잘 압축된 JPEG 등) 원본을 쓴다.
 */
export async function prepareImageForUpload(file: File): Promise<File> {
  try {
    const img = await loadImage(file);
    const scale = fitScale(img.naturalWidth, img.naturalHeight);

    if (scale >= 1 && file.size <= KEEP_ORIGINAL_BYTES) {
      return file;
    }

    const width = Math.max(1, Math.round(img.naturalWidth * scale));
    const height = Math.max(1, Math.round(img.naturalHeight * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, width, height);

    const blob = await toBlob(canvas);
    if (blob.size >= file.size) {
      return file;
    }
    return new File([blob], replaceExtension(file.name), {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } catch {
    return file;
  }
}

function replaceExtension(name: string): string {
  const base = name.replace(/\.[^./\\]+$/, "");
  return `${base || "capture"}.jpg`;
}
