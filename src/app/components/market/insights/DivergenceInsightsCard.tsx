import { useState, useEffect } from "react";
import { Card } from "@/app/components/ui/layout/card";
import { getDivergenceResults, getDivergenceInterpretations } from "@/app/services/divergenceService";
import type { PortfolioItemResponse, DivergenceResultResponse, DivergenceInterpretationResponse } from "@/app/types";

const DIVERGENCE_TYPE_KO: Record<string, string> = {
  CHANNEL_STUFFING: "채널 스터핑",
  INVENTORY_BUILDUP: "재고 급증",
  MARGIN_MIX_SHIFT: "마진 믹스 변화",
  CAPEX_REGIME_SHIFT: "설비투자 패턴 변화",
  PEER_OUTLIER: "동종업계 이상치",
  REVENUE_ACCRUAL_DIVERGENCE: "매출-현금 괴리",
  WORKING_CAPITAL_BLOAT: "운전자본 급증",
  RECURRING_CHARGES: "반복 일회성 비용",
  DEBT_COVENANT_STRESS: "부채 위약 스트레스",
  BUYBACK_TIMING: "자사주 매입 타이밍",
};

const RISK_BADGE: Record<string, string> = {
  HIGH: "bg-destructive/10 text-destructive",
  MEDIUM: "bg-warning/15 text-warning",
  LOW: "bg-success/15 text-success",
};

const SEVERITY_BAR: Record<string, string> = {
  HIGH: "bg-destructive",
  MEDIUM: "bg-warning",
  LOW: "bg-success",
};

interface Props {
  portfolioItems: PortfolioItemResponse[];
}

interface StockDivergence {
  stockCd: string;
  results: DivergenceResultResponse[];
  interpretations: DivergenceInterpretationResponse[];
}

export function DivergenceInsightsCard({ portfolioItems }: Props) {
  const [stockDivergences, setStockDivergences] = useState<StockDivergence[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stockCds = [...new Set(portfolioItems.map((i) => i.stockCd))];
    if (stockCds.length === 0) return;

    setLoading(true);
    Promise.all(
      stockCds.map(async (stockCd) => {
        const [resultsRes, interpsRes] = await Promise.allSettled([
          getDivergenceResults(stockCd),
          getDivergenceInterpretations(stockCd),
        ]);
        const results =
          resultsRes.status === "fulfilled" ? (resultsRes.value.data ?? []) : [];
        const interpretations =
          interpsRes.status === "fulfilled" ? (interpsRes.value.data ?? []) : [];
        return { stockCd, results, interpretations };
      })
    )
      .then((all) => setStockDivergences(all.filter((s) => s.results.length > 0)))
      .finally(() => setLoading(false));
  }, [portfolioItems]);

  return (
    <Card className="p-0 gap-0 bg-card border-border overflow-hidden">
      <div className="h-1 bg-accent" />
      <div className="p-4">
      <h3 className="font-semibold text-sm mb-3 flex items-center gap-2 text-foreground">
        <span>⚠️ 재무 이상 징후 감지</span>
        <span className="text-[10px] font-normal text-faint-foreground ml-auto">AI 분석</span>
      </h3>

      {loading && (
        <p className="text-xs text-muted-foreground text-center py-4">분석 중...</p>
      )}

      {!loading && stockDivergences.length === 0 && (
        <div className="text-center py-4">
          <p className="text-2xl mb-1">✅</p>
          <p className="text-xs text-muted-foreground">보유 종목에 이상 징후가 감지되지 않았습니다.</p>
        </div>
      )}

      {!loading && stockDivergences.length > 0 && (
        <div className="space-y-4">
          {stockDivergences.map(({ stockCd, results, interpretations }) => (
            <div key={stockCd} className="bg-muted rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold bg-muted text-foreground px-2 py-0.5 rounded">
                  {stockCd}
                </span>
                <span className="text-xs text-muted-foreground">{results.length}건 감지</span>
              </div>
              <div className="space-y-2">
                {results.map((r) => {
                  const interp = interpretations.find(
                    (i) =>
                      i.divergenceType === r.divergenceType &&
                      i.fiscalYear === r.fiscalYear &&
                      i.fiscalQuarter === r.fiscalQuarter
                  );
                  const severityPct = Math.round(r.severity * 100);
                  const riskLevel =
                    interp?.riskLevel ??
                    (r.severity >= 0.7 ? "HIGH" : r.severity >= 0.4 ? "MEDIUM" : "LOW");

                  return (
                    <div
                      key={r.id}
                      className="border border-border rounded-lg bg-card p-2.5 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-foreground">
                          {DIVERGENCE_TYPE_KO[r.divergenceType] ?? r.divergenceType}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                            RISK_BADGE[riskLevel] ?? RISK_BADGE.MEDIUM
                          }`}
                        >
                          {riskLevel}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-faint-foreground shrink-0">
                          {r.fiscalYear}Q{r.fiscalQuarter}
                        </span>
                        <div className="flex-1 bg-muted rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full transition-all duration-500 ${
                              SEVERITY_BAR[riskLevel] ?? SEVERITY_BAR.MEDIUM
                            }`}
                            style={{ width: `${severityPct}%` }}
                          />
                        </div>
                        <span className="text-muted-foreground shrink-0 tabular-nums">{severityPct}%</span>
                      </div>
                      {interp?.summary ? (
                        <p className="text-muted-foreground leading-relaxed">{interp.summary}</p>
                      ) : (
                        r.evidence && (
                          <p className="text-muted-foreground leading-relaxed">{r.evidence}</p>
                        )
                      )}
                      {interp?.watchPoints && interp.watchPoints.length > 0 && (
                        <ul className="mt-1 space-y-0.5">
                          {interp.watchPoints.map((wp, idx) => (
                            <li key={idx} className="flex items-start gap-1 text-faint-foreground">
                              <span className="mt-0.5 flex-shrink-0">·</span>
                              <span>{wp}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </Card>
  );
}
