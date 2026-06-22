import { useState, useEffect } from "react";
import { Card } from "@/app/components/ui/layout/card";
import { DollarSign, ChevronDown } from "lucide-react";
import type { PortfolioItemResponse, DividendHistoryRecord } from "@/app/types";
import { getRecentDividendHistory } from "@/app/services/marketDividendService";

interface DividendHistoryPanelProps {
  positions: PortfolioItemResponse[];
}

export function DividendHistoryPanel({ positions }: DividendHistoryPanelProps) {
  const [selectedStock, setSelectedStock] = useState<string>("");
  const [records, setRecords] = useState<DividendHistoryRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (positions.length > 0 && !selectedStock) {
      setSelectedStock(positions[0].stockCd);
    }
  }, [positions, selectedStock]);

  useEffect(() => {
    if (!selectedStock) return;
    setLoading(true);
    getRecentDividendHistory(selectedStock, 8)
      .then((res) => setRecords(res.data.data ?? []))
      .catch(() => setRecords([]))
      .finally(() => setLoading(false));
  }, [selectedStock]);

  const selectedPosition = positions.find((p) => p.stockCd === selectedStock);

  // 최근 4건 합산 → 연간 예상 배당금 (분기 배당 기준)
  const annualDividendPerShare = records.slice(0, 4).reduce((sum, r) => sum + r.dividend, 0);
  const estimatedAnnual = selectedPosition
    ? annualDividendPerShare * selectedPosition.holdQty
    : 0;

  if (positions.length === 0) return null;

  return (
    <Card className="p-4 bg-slate-700 border-slate-600 shadow-lg">
      <div className="flex items-center gap-2 mb-3">
        <DollarSign className="w-4 h-4 text-green-400" />
        <h3 className="font-semibold text-sm text-gray-100">배당 이력</h3>
      </div>

      {/* 종목 선택 */}
      <div className="relative mb-4">
        <select
          value={selectedStock}
          onChange={(e) => setSelectedStock(e.target.value)}
          className="w-full bg-slate-600 text-gray-100 text-sm rounded-lg px-3 py-2 border border-slate-500 appearance-none pr-8 focus:outline-none focus:ring-1 focus:ring-green-500"
        >
          {positions.map((p) => (
            <option key={p.stockCd} value={p.stockCd}>
              {p.stockCd}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>

      {loading ? (
        <div className="flex justify-center py-6">
          <div className="w-6 h-6 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : records.length === 0 ? (
        <p className="text-center text-sm text-gray-400 py-6">배당 데이터가 없습니다.</p>
      ) : (
        <>
          {/* 연간 예상 배당금 요약 */}
          {estimatedAnnual > 0 && (
            <div className="bg-slate-600 rounded-lg p-3 mb-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-300 font-medium">연간 예상 배당금</p>
                <p className="text-xs text-gray-400">
                  {selectedPosition?.holdQty}주 × 최근 4분기 ${annualDividendPerShare.toFixed(4)}
                </p>
              </div>
              <span className="text-lg font-bold text-green-400">
                ${estimatedAnnual.toFixed(2)}
              </span>
            </div>
          )}

          {/* 배당 이력 목록 */}
          <div className="space-y-1.5">
            <div className="grid grid-cols-2 text-xs text-gray-400 px-1 mb-1">
              <span>배당락일</span>
              <span className="text-right">주당 배당금</span>
            </div>
            {records.map((r) => (
              <div
                key={r.exDate}
                className="grid grid-cols-2 text-xs bg-slate-600 rounded-lg px-3 py-2"
              >
                <span className="text-gray-300">{r.exDate}</span>
                <span className="text-right text-green-300 font-medium">
                  ${r.dividend.toFixed(4)}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
