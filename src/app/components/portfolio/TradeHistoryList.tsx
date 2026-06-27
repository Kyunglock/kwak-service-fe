import { Card } from "@/app/components/ui/layout/card";
import { Badge } from "@/app/components/ui/feedback/badge";
import { History, Pencil, Plus, Trash2 } from "lucide-react";
import type { TransactionResponse } from "@/app/types";
import type { StockWithPrice } from "@/app/services/stockService";
import { useCurrency } from "@/app/contexts/CurrencyContext";

interface TradeHistoryListProps {
  transactions: TransactionResponse[];
  stocks?: StockWithPrice[];
  onEdit?: (tx: TransactionResponse) => void;
  onDelete?: (tx: TransactionResponse) => void;
  onAddClick?: () => void;
}

export function TradeHistoryList({ transactions, stocks = [], onEdit, onDelete, onAddClick }: TradeHistoryListProps) {
  const { convert, currency } = useCurrency();

  function fmtConverted(amount: number): string {
    if (currency === "KRW") {
      return `₩${Math.round(amount).toLocaleString("ko-KR")}`;
    }
    return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  function getStockName(stockCd: string, txCurrency: string): { main: string; sub?: string } {
    const stock = stocks.find((s) => s.stockCd === stockCd);
    if (txCurrency === "KRW") {
      const name = stock?.stockNmKo || stock?.stockNm;
      return name ? { main: name, sub: stockCd } : { main: stockCd };
    }
    const nameKr = stock?.stockNmKo;
    return { main: stockCd, sub: nameKr };
  }

  return (
    <div className="space-y-4">
      {/* 섹션 헤더 */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-base text-gray-100 flex items-center gap-2">
          <History className="w-4 h-4 text-gray-400" />
          매매 내역
          {transactions.length > 0 && (
            <span className="text-xs text-gray-500 font-normal">{transactions.length}건</span>
          )}
        </h3>
        {onAddClick && (
          <button
            onClick={onAddClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/15 hover:bg-indigo-600/25 text-indigo-400 text-xs font-medium transition-colors border border-indigo-600/25"
          >
            <Plus className="w-3.5 h-3.5" />
            종목 추가
          </button>
        )}
      </div>

      {transactions.length === 0 ? (
        <Card className="p-10 text-center bg-slate-800 border-slate-700">
          <History className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <p className="text-sm text-gray-400">매매 내역이 없습니다.</p>
        </Card>
      ) : (
        <Card className="bg-slate-800 border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-800/80">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 tracking-wide">구분</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 tracking-wide">종목</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 tracking-wide hidden sm:table-cell">날짜</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 tracking-wide hidden sm:table-cell">수량</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 tracking-wide hidden md:table-cell">단가</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 tracking-wide">거래금액</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 tracking-wide w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {transactions.slice(0, 15).map((tx) => {
                  const isBuy = tx.transType === "BUY";
                  const txCurrency = tx.currency || "USD";
                  const { main: displayName, sub: displaySub } = getStockName(tx.stockCd, txCurrency);
                  const tradeDate = new Date(tx.transDt).toLocaleDateString("ko-KR", {
                    year: "2-digit",
                    month: "2-digit",
                    day: "2-digit",
                  }).replace(/\. /g, "/").replace(".", "");

                  const priceConverted = convert(tx.price, txCurrency);
                  const amountConverted = convert(tx.amount, txCurrency);

                  return (
                    <tr key={tx.transId} className="hover:bg-slate-700/30 transition-colors group">
                      <td className="px-4 py-3.5">
                        <Badge
                          className={`text-xs font-semibold border ${
                            isBuy
                              ? "bg-blue-600/15 text-blue-400 border-blue-600/30"
                              : "bg-red-600/15 text-red-400 border-red-600/30"
                          }`}
                        >
                          {isBuy ? "매수" : "매도"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <div>
                            <div className="font-semibold text-sm text-gray-100">{displayName}</div>
                            {displaySub && (
                              <div className="text-xs text-gray-500 mt-0.5">{displaySub}</div>
                            )}
                          </div>
                          {txCurrency === "KRW" ? (
                            <Badge className="text-[9px] px-1 py-0 bg-rose-700/50 text-rose-300 border-0 leading-4">KRW</Badge>
                          ) : (
                            <Badge className="text-[9px] px-1 py-0 bg-blue-700/50 text-blue-300 border-0 leading-4">USD</Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-right text-sm text-gray-400 hidden sm:table-cell">
                        {tradeDate}
                      </td>
                      <td className="px-4 py-3.5 text-right text-sm text-gray-300 hidden sm:table-cell">
                        {tx.qty.toLocaleString("en-US")}주
                      </td>
                      <td className="px-4 py-3.5 text-right text-sm text-gray-400 hidden md:table-cell">
                        {fmtConverted(priceConverted)}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span className={`text-sm font-semibold ${isBuy ? "text-blue-400" : "text-red-400"}`}>
                          {fmtConverted(amountConverted)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          {onEdit && (
                            <button
                              onClick={() => onEdit(tx)}
                              className="p-1.5 rounded-md hover:bg-slate-600 text-gray-500 hover:text-blue-400 transition-colors"
                              title="수정"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {onDelete && (
                            <button
                              onClick={() => onDelete(tx)}
                              className="p-1.5 rounded-md hover:bg-slate-600 text-gray-500 hover:text-red-400 transition-colors"
                              title="삭제"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {transactions.length > 15 && (
            <div className="px-4 py-2.5 text-xs text-gray-500 text-center border-t border-slate-700/50">
              최근 15개 거래 내역만 표시됩니다.
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
