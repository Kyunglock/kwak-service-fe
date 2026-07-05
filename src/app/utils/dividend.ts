import type { DividendHistoryRecord } from "@/app/types";

/**
 * 과거 배당락일 간격 평균으로 다음 예상 배당락일 예측.
 * 이력이 없으면 null, 1건이면 분기(91일) 가정.
 */
export function predictNextExDate(records: DividendHistoryRecord[]): string | null {
  if (records.length === 0) return null;
  const sorted = [...records].sort((a, b) => new Date(b.exDate).getTime() - new Date(a.exDate).getTime());
  const lastDate = new Date(sorted[0].exDate);
  let avgIntervalDays = 91;
  if (sorted.length >= 2) {
    const intervals: number[] = [];
    for (let i = 0; i < sorted.length - 1; i++) {
      const diff = new Date(sorted[i].exDate).getTime() - new Date(sorted[i + 1].exDate).getTime();
      intervals.push(diff / (1000 * 60 * 60 * 24));
    }
    avgIntervalDays = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  }
  const next = new Date(lastDate.getTime() + avgIntervalDays * 24 * 60 * 60 * 1000);
  return next.toISOString().split("T")[0];
}

/**
 * 과거 배당락→지급 간격 평균으로 다음 예상 지급일 예측.
 * paymentDt 이력이 없으면 배당락 30일 후로 추정.
 */
export function predictNextPaymentDate(records: DividendHistoryRecord[], nextExDate: string | null): string | null {
  if (!nextExDate) return null;
  const recordsWithPayment = records.filter((r) => r.paymentDt);
  if (recordsWithPayment.length > 0) {
    const gaps = recordsWithPayment.map((r) => {
      const exTs = new Date(r.exDate).getTime();
      const payTs = new Date(r.paymentDt!).getTime();
      return (payTs - exTs) / (1000 * 60 * 60 * 24);
    });
    const avgGap = Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length);
    const next = new Date(new Date(nextExDate).getTime() + avgGap * 24 * 60 * 60 * 1000);
    return next.toISOString().split("T")[0];
  }
  // paymentDt 데이터 없으면 30일 후 추정
  const next = new Date(new Date(nextExDate).getTime() + 30 * 24 * 60 * 60 * 1000);
  return next.toISOString().split("T")[0];
}
