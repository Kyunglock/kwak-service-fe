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
    <div className="space-y-1.5 mt-4">
      <div className="flex items-center gap-2 mb-1.5">
        <History className="w-5 h-5 text-gray-400" />
        <h3 className="font-semibold text-sm text-gray-100">매매 내역</h3>
        {onAddClick && (
          <button
            onClick={onAddClick}
            className="ml-auto flex items-center gap-1 px-2 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
            title="종목 추가"
          >
            <Plus className="w-3.5 h-3.5" />
            종목 추가
          </button>
        )}
      </div>
      {transactions.length === 0 ? (
        <Card className="p-4 text-center bg-slate-700 border-slate-600">
          <History className="w-8 h-8 text-gray-500 mx-auto mb-1.5" />
          <p className="text-xs text-gray-300">매매 내역이 없습니다.</p>
        </Card>
      ) : (
        <div className="space-y-1">
          {transactions.slice(0, 10).map((tx) => {
            const isBuy = tx.transType === "BUY";
            const txCurrency = tx.currency || "USD";
            const { main: displayName, sub: displaySub } = getStockName(tx.stockCd, txCurrency);
            const tradeDate = new Date(tx.transDt).toLocaleDateString('ko-KR', {
              year: '2-digit',
              month: '2-digit',
              day: '2-digit'
            }).replace(/\. /g, '/').replace('.', '');

            const priceConverted = convert(tx.price, txCurrency);
            const amountConverted = convert(tx.amount, txCurrency);

            return (
              <Card key={tx.transId} className="p-2 bg-slate-700 border-slate-600">
                {/* 종목명 헤더 */}
                <div className="flex items-center gap-2 mb-1.5 pb-1.5 border-b border-slate-600">
                  <Badge
                    variant={isBuy ? "default" : "secondary"}
                    className={`text-sm py-0.5 px-2 ${
                      isBuy ? "bg-blue-600 text-white" : "bg-red-600 text-white"
                    }`}
                  >
                    {isBuy ? "매수" : "매도"}
                  </Badge>
                  <span className="font-bold text-base text-gray-100">{displayName}</span>
                  {displaySub && (
                    <span className="text-xs text-gray-400">{displaySub}</span>
                  )}
                  {txCurrency === "KRW" ? (
                    <Badge className="text-[9px] px-1 py-0 bg-rose-700/60 text-rose-300 border-0">KRW</Badge>
                  ) : (
                    <Badge className="text-[9px] px-1 py-0 bg-blue-700/60 text-blue-300 border-0">USD</Badge>
                  )}
                  <div className="ml-auto flex items-center gap-1">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(tx)}
                        className="p-1 rounded hover:bg-slate-600 text-gray-400 hover:text-blue-400 transition-colors"
                        title="수정"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(tx)}
                        className="p-1 rounded hover:bg-slate-600 text-gray-400 hover:text-red-400 transition-colors"
                        title="삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* 거래 정보 그리드 */}
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div>
                    <div className="text-xs text-gray-400 mb-0.5">매매일</div>
                    <div className="text-sm text-gray-200 font-medium">{tradeDate}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-0.5">수량</div>
                    <div className="text-sm text-gray-100 font-semibold">{tx.qty.toLocaleString("en-US")}주</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-0.5">단가</div>
                    <div className="text-sm text-gray-100 font-semibold">{fmtConverted(priceConverted)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-0.5">거래금액</div>
                    <div className={`text-sm font-bold ${isBuy ? "text-blue-400" : "text-red-400"}`}>
                      {fmtConverted(amountConverted)}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
          {transactions.length > 10 && (
            <p className="text-xs text-gray-400 text-center pt-0.5">
              최근 10개 거래 내역만 표시됩니다.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
