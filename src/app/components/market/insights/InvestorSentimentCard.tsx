import { useEffect, useState } from "react";
import { Card } from "@/app/components/ui/layout/card";
import { getMarketRiskComparison } from "@/app/services/stockAdvisorService";
import type { MarketRiskComparisonItem } from "@/app/types";

export function InvestorSentimentCard() {
  const [items, setItems] = useState<MarketRiskComparisonItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMarketRiskComparison()
      .then((res) => {
        const data = res.data.data;
        setItems(Array.isArray(data) ? data : []);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card className="p-4 bg-card border-border">
      <h3 className="font-semibold text-sm mb-3 text-foreground">
        나 vs 전체 투자자
      </h3>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-muted p-3 rounded-lg">
              <div className="h-3 bg-muted rounded w-3/4 mb-2" />
              <div className="h-3 bg-muted rounded w-1/2 mb-1" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-4 gap-2 text-center">
          <p className="text-sm text-muted-foreground font-medium">데이터 없음</p>
          <p className="text-xs text-muted-foreground">설문 결과가 없거나 불러올 수 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.sortOrder} className="bg-muted p-3 rounded-lg">
              <div className="flex items-start gap-1.5 mb-2">
                <span className="shrink-0 mt-0.5 text-[10px] font-bold text-primary bg-accent border border-primary/40 rounded px-1 py-0.5 leading-none">
                  Q{item.sortOrder}
                </span>
                <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                  {item.questionText}
                </p>
              </div>
              <div className="space-y-1.5">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-primary font-semibold">내 선택</span>
                  <p className="text-xs text-foreground font-semibold leading-relaxed">
                    {item.myOptionText}
                  </p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-muted-foreground font-semibold">다수 선택</span>
                  <p className="text-xs text-foreground font-semibold leading-relaxed">
                    {item.majorityOptionText}
                  </p>
                </div>
                <div className="mt-2 pt-2 border-t border-border flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground">일치</span>
                    <span
                      className={`font-bold ${
                        item.matchYn === "Y" ? "text-success" : "text-destructive"
                      }`}
                    >
                      {item.matchYn === "Y" ? "✓" : "✗"}
                    </span>
                  </div>
                  <span
                    className={`font-bold ${
                      item.myChoicePct >= 70
                        ? "text-success"
                        : item.myChoicePct >= 40
                          ? "text-warning"
                          : "text-destructive"
                    }`}
                  >
                    {item.myChoicePct}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
