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
    <Card className="p-4 bg-slate-700 border-slate-600">
      <h3 className="font-semibold text-sm mb-3 text-gray-100">
        나 vs 전체 투자자
      </h3>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-slate-600/50 p-3 rounded-lg">
              <div className="h-3 bg-slate-500 rounded w-3/4 mb-2" />
              <div className="h-3 bg-slate-500 rounded w-1/2 mb-1" />
              <div className="h-3 bg-slate-500 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-4 gap-2 text-center">
          <p className="text-sm text-gray-300 font-medium">데이터 없음</p>
          <p className="text-xs text-gray-400">설문 결과가 없거나 불러올 수 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.sortOrder} className="bg-slate-600/50 p-3 rounded-lg">
              <div className="flex items-start gap-1.5 mb-2">
                <span className="shrink-0 mt-0.5 text-[10px] font-bold text-indigo-400 bg-indigo-900/50 border border-indigo-700/50 rounded px-1 py-0.5 leading-none">
                  Q{item.sortOrder}
                </span>
                <p className="text-xs text-gray-300 font-medium leading-relaxed">
                  {item.questionText}
                </p>
              </div>
              <div className="space-y-1.5">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-purple-300 font-semibold">내 선택</span>
                  <p className="text-xs text-gray-100 font-semibold leading-relaxed">
                    {item.myOptionText}
                  </p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-blue-300 font-semibold">다수 선택</span>
                  <p className="text-xs text-gray-100 font-semibold leading-relaxed">
                    {item.majorityOptionText}
                  </p>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-500/50 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-400">일치</span>
                    <span
                      className={`font-bold ${
                        item.matchYn === "Y" ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {item.matchYn === "Y" ? "✓" : "✗"}
                    </span>
                  </div>
                  <span
                    className={`font-bold ${
                      item.myChoicePct >= 70
                        ? "text-green-400"
                        : item.myChoicePct >= 40
                          ? "text-yellow-400"
                          : "text-red-400"
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
