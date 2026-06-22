import { Card } from "@/app/components/ui/layout/card";
import { Button } from "@/app/components/ui/form/button";
import { Badge } from "@/app/components/ui/feedback/badge";
import { Briefcase, Plus, Loader2 } from "lucide-react";
import type { StockPrice, PortfolioItemResponse } from "@/app/types";
import type { StockWithPrice } from "@/app/services/stockService";
import { useCurrency } from "@/app/contexts/CurrencyContext";

interface PositionListProps {
  positions: PortfolioItemResponse[];
  loading: boolean;
  stockPrices?: Record<string, StockPrice>;
  stocks?: StockWithPrice[];
  onAddClick: () => void;
}

export function PositionList({ positions, loading, stockPrices, stocks = [], onAddClick }: PositionListProps) {
  const { format, convert, currency } = useCurrency();

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
    return { main: stockCd };
  }

  // 총 자산 계산 (선택된 통화 기준)
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

  return (
    <div className="space-y-1.5">
      <h3 className="font-semibold text-sm text-gray-100 mb-1.5">보유 종목</h3>
      {loading ? (
        <Card className="p-6 text-center bg-slate-700 border-slate-600">
          <Loader2 className="w-8 h-8 text-indigo-400 mx-auto mb-2 animate-spin" />
          <p className="text-xs text-gray-300">포트폴리오를 불러오는 중...</p>
        </Card>
      ) : positions.length === 0 ? (
        <Card className="p-6 text-center bg-slate-700 border-slate-600">
          <Briefcase className="w-10 h-10 text-gray-500 mx-auto mb-2" />
          <p className="text-xs text-gray-300 mb-3">아직 보유 종목이 없습니다.</p>
          <Button
            size="sm"
            onClick={onAddClick}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4 mr-1" />
            첫 종목 추가하기
          </Button>
        </Card>
      ) : (
        <Card className="p-4 bg-slate-700 border-slate-600">
          {/* 총 평가 요약 */}
          <div className="mb-3 pb-3 border-b border-slate-600">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">총 평가금액</span>
              <span className="text-sm font-bold text-gray-100">{fmtConverted(totalCurrentValue)}</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-gray-400">총 손익</span>
              <span className={`text-xs font-semibold ${totalProfit >= 0 ? "text-green-400" : "text-red-400"}`}>
                {totalProfit >= 0 ? "+" : ""}{fmtConverted(totalProfit)} ({totalProfitPct >= 0 ? "+" : ""}{totalProfitPct.toFixed(2)}%)
              </span>
            </div>
          </div>

          <div className="space-y-2">
            {stockDetails.map((stock) => {
              const { main: displayName, sub: displaySub } = getStockName(stock.stockCd, stock.nativeCurrency);
              return (
                <div key={stock.stockCd} className="bg-slate-600/50 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <div className="text-sm font-bold text-gray-100">{displayName}</div>
                        {stock.nativeCurrency === "KRW" ? (
                          <Badge className="text-[9px] px-1 py-0 bg-rose-700/60 text-rose-300 border-0">KRW</Badge>
                        ) : (
                          <Badge className="text-[9px] px-1 py-0 bg-blue-700/60 text-blue-300 border-0">USD</Badge>
                        )}
                      </div>
                      <div className="text-xs text-gray-400">
                        {displaySub && <span className="mr-1">{displaySub}</span>}
                        {stock.holdQty.toLocaleString("en-US")}주 보유
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-bold ${stock.profit >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {stock.profit >= 0 ? "+" : ""}{stock.profitPercent.toFixed(2)}%
                      </div>
                      <div className={`text-xs ${stock.profit >= 0 ? "text-green-300" : "text-red-300"}`}>
                        {stock.profit >= 0 ? "+" : "-"}{fmtConverted(Math.abs(stock.profit))}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-slate-700/50 p-2 rounded">
                      <div className="text-gray-400 mb-1">매수가</div>
                      <div className="font-semibold text-gray-100">{fmtConverted(stock.buyPriceConverted)}</div>
                    </div>
                    <div className="bg-slate-700/50 p-2 rounded">
                      <div className="text-gray-400 mb-1">현재가</div>
                      <div className="font-semibold text-gray-100">
                        {stock.currentPriceConverted !== null ? fmtConverted(stock.currentPriceConverted) : "-"}
                      </div>
                    </div>
                    <div className="bg-slate-700/50 p-2 rounded">
                      <div className="text-gray-400 mb-1">평가액</div>
                      <div className="font-semibold text-gray-100">{fmtConverted(stock.currentValueConverted)}</div>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-500/50 flex justify-between text-xs text-gray-400">
                    <span>투자금: {fmtConverted(stock.buyAmountConverted)}</span>
                    <span>비중: {stock.weight.toFixed(1)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
