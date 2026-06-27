import { Card } from "@/app/components/ui/layout/card";
import { Button } from "@/app/components/ui/form/button";
import { Badge } from "@/app/components/ui/feedback/badge";
import { Briefcase, Plus, Loader2, TrendingUp, TrendingDown } from "lucide-react";
import type { StockPrice, PortfolioItemResponse } from "@/app/types";
import type { StockWithPrice } from "@/app/services/stockService";
import { useCurrency } from "@/app/contexts/CurrencyContext";

const WEIGHT_COLORS = [
  "#6366f1", "#ec4899", "#f59e0b", "#10b981",
  "#3b82f6", "#f97316", "#06b6d4", "#a78bfa",
  "#34d399", "#fb7185",
];

interface PositionListProps {
  positions: PortfolioItemResponse[];
  loading: boolean;
  stockPrices?: Record<string, StockPrice>;
  stocks?: StockWithPrice[];
  onAddClick: () => void;
}

export function PositionList({ positions, loading, stockPrices, stocks = [], onAddClick }: PositionListProps) {
  const { convert, currency } = useCurrency();

  const getCurrentPrice = (stockCd: string): number | null => {
    if (!stockPrices) return null;
    const live = stockPrices[stockCd];
    return live ? live.currentPrice : null;
  };

  function getStockName(stockCd: string, posCurrency: string): { main: string; sub?: string } {
    const stock = stocks.find((s) => s.stockCd === stockCd);
    if (posCurrency === "KRW") {
      const name = stock?.stockNmKo || stock?.stockNm;
      return name ? { main: name, sub: stockCd } : { main: stockCd };
    }
    return { main: stockCd, sub: stocks.find((s) => s.stockCd === stockCd)?.stockNmKo };
  }

  const totalCurrentValue = positions.reduce((sum, pos) => {
    const price = getCurrentPrice(pos.stockCd);
    const val = price ? price * pos.holdQty : pos.buyAmount;
    return sum + convert(val, pos.currency);
  }, 0);

  const totalInvestment = positions.reduce((sum, pos) => {
    return sum + convert(pos.buyAmount, pos.currency);
  }, 0);

  const totalProfit = totalCurrentValue - totalInvestment;
  const totalProfitPct = totalInvestment > 0 ? (totalProfit / totalInvestment) * 100 : 0;

  const stockDetails = positions.map((pos) => {
    const price = getCurrentPrice(pos.stockCd);
    const currentValNative = price ? price * pos.holdQty : pos.buyAmount;
    const currentValConverted = convert(currentValNative, pos.currency);
    const buyAmountConverted = convert(pos.buyAmount, pos.currency);
    const profit = currentValConverted - buyAmountConverted;
    const profitPercent = buyAmountConverted > 0 ? (profit / buyAmountConverted) * 100 : 0;
    const weight = totalCurrentValue > 0 ? (currentValConverted / totalCurrentValue) * 100 : 0;
    const buyPriceConverted = convert(pos.buyPrice, pos.currency);
    const currentPriceConverted = price !== null ? convert(price, pos.currency) : null;

    return {
      stockCd: pos.stockCd,
      holdQty: pos.holdQty,
      buyPriceConverted,
      currentPriceConverted,
      buyAmountConverted,
      currentValueConverted: currentValConverted,
      profit,
      profitPercent,
      weight,
      nativeCurrency: pos.currency,
    };
  }).sort((a, b) => b.currentValueConverted - a.currentValueConverted);

  function fmtConverted(amount: number): string {
    if (currency === "KRW") {
      return `₩${Math.round(amount).toLocaleString("ko-KR")}`;
    }
    return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-base text-gray-100 flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-indigo-400" />
          보유 종목
        </h3>
        <Card className="p-10 text-center bg-slate-800 border-slate-700">
          <Loader2 className="w-8 h-8 text-indigo-400 mx-auto mb-3 animate-spin" />
          <p className="text-sm text-gray-400">포트폴리오를 불러오는 중...</p>
        </Card>
      </div>
    );
  }

  if (positions.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-base text-gray-100 flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-indigo-400" />
          보유 종목
        </h3>
        <Card className="p-12 text-center bg-slate-800 border-slate-700">
          <Briefcase className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-sm text-gray-400 mb-4">아직 보유 종목이 없습니다.</p>
          <Button size="sm" onClick={onAddClick} className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-4 h-4 mr-1.5" />
            첫 종목 추가하기
          </Button>
        </Card>
      </div>
    );
  }

  const profitColor = totalProfit >= 0 ? "text-green-400" : "text-red-400";
  const profitBg = totalProfit >= 0 ? "bg-green-950/40 border-green-800/30" : "bg-red-950/40 border-red-800/30";

  return (
    <div className="space-y-4">
      {/* 섹션 헤더 */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-base text-gray-100 flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-indigo-400" />
          보유 종목
          <span className="text-xs text-gray-500 font-normal">{positions.length}개</span>
        </h3>
      </div>

      {/* 4개 통계 카드 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-800 rounded-xl p-3.5 border border-slate-700">
          <p className="text-xs text-gray-400 mb-1">총 평가금액</p>
          <p className="text-base font-bold text-gray-100 leading-tight">{fmtConverted(totalCurrentValue)}</p>
        </div>
        <div className={`rounded-xl p-3.5 border ${profitBg}`}>
          <p className="text-xs text-gray-400 mb-1">총 손익</p>
          <div className="flex items-center gap-1">
            {totalProfit >= 0
              ? <TrendingUp className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
              : <TrendingDown className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
            }
            <p className={`text-base font-bold leading-tight ${profitColor}`}>
              {totalProfit >= 0 ? "+" : ""}{fmtConverted(totalProfit)}
            </p>
          </div>
        </div>
        <div className={`rounded-xl p-3.5 border ${profitBg}`}>
          <p className="text-xs text-gray-400 mb-1">수익률</p>
          <p className={`text-base font-bold leading-tight ${profitColor}`}>
            {totalProfitPct >= 0 ? "+" : ""}{totalProfitPct.toFixed(2)}%
          </p>
          <p className="text-xs text-gray-500 mt-0.5 truncate">
            원금 {fmtConverted(totalInvestment)}
          </p>
        </div>
        <div className="bg-slate-800 rounded-xl p-3.5 border border-slate-700">
          <p className="text-xs text-gray-400 mb-1">종목 수</p>
          <p className="text-base font-bold text-gray-100 leading-tight">{positions.length}개</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {stockDetails.filter(s => s.profit >= 0).length}↑ / {stockDetails.filter(s => s.profit < 0).length}↓
          </p>
        </div>
      </div>

      {/* 종목 테이블 */}
      <Card className="bg-slate-800 border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-800/80">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 tracking-wide">종목</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 tracking-wide hidden sm:table-cell">매수가</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 tracking-wide hidden sm:table-cell">현재가</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 tracking-wide">평가금액</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 tracking-wide">손익</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 tracking-wide hidden lg:table-cell">비중</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {stockDetails.map((stock, i) => {
                const { main: displayName, sub: displaySub } = getStockName(stock.stockCd, stock.nativeCurrency);
                return (
                  <tr key={stock.stockCd} className="hover:bg-slate-700/30 transition-colors group">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        {/* 종목 색상 인디케이터 */}
                        <div
                          className="w-1.5 h-8 rounded-full flex-shrink-0"
                          style={{ backgroundColor: WEIGHT_COLORS[i % WEIGHT_COLORS.length] }}
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-sm text-gray-100">{displayName}</span>
                            {stock.nativeCurrency === "KRW" ? (
                              <Badge className="text-[9px] px-1 py-0 bg-rose-700/50 text-rose-300 border-0 leading-4">KRW</Badge>
                            ) : (
                              <Badge className="text-[9px] px-1 py-0 bg-blue-700/50 text-blue-300 border-0 leading-4">USD</Badge>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {displaySub && <span className="mr-1.5">{displaySub}</span>}
                            {stock.holdQty.toLocaleString("en-US")}주
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right text-sm text-gray-400 hidden sm:table-cell">
                      {fmtConverted(stock.buyPriceConverted)}
                    </td>
                    <td className="px-4 py-3.5 text-right text-sm hidden sm:table-cell">
                      {stock.currentPriceConverted !== null
                        ? <span className="text-gray-300">{fmtConverted(stock.currentPriceConverted)}</span>
                        : <span className="text-gray-600">-</span>
                      }
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="text-sm font-semibold text-gray-100">
                        {fmtConverted(stock.currentValueConverted)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className={`text-sm font-bold ${stock.profit >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {stock.profit >= 0 ? "+" : ""}{stock.profitPercent.toFixed(2)}%
                      </div>
                      <div className={`text-xs mt-0.5 ${stock.profit >= 0 ? "text-green-400/60" : "text-red-400/60"}`}>
                        {stock.profit >= 0 ? "+" : "-"}{fmtConverted(Math.abs(stock.profit))}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right hidden lg:table-cell">
                      <div className="flex flex-col items-end gap-1.5">
                        <span className="text-xs text-gray-400">{stock.weight.toFixed(1)}%</span>
                        <div className="w-16 bg-slate-700 rounded-full h-1">
                          <div
                            className="h-1 rounded-full transition-all"
                            style={{
                              width: `${Math.min(stock.weight, 100)}%`,
                              backgroundColor: WEIGHT_COLORS[i % WEIGHT_COLORS.length],
                            }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
