import { useState, useEffect, useMemo } from "react";
import { Button } from "@/app/components/ui/form/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/overlay/dialog";
import { Input } from "@/app/components/ui/form/input";
import { Label } from "@/app/components/ui/form/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/form/select";
import { Search, Loader2 } from "lucide-react";
import type { PortfolioItemResponse } from "@/app/types";
import { addTransaction } from "@/app/services/transactionService";
import { type StockWithPrice } from "@/app/services/stockService";

interface TradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPortfolioId: number;
  positions: PortfolioItemResponse[];
  onTradeComplete: () => void;
  stocks: StockWithPrice[];
}

export function TradeDialog({
  open,
  onOpenChange,
  currentPortfolioId,
  positions,
  onTradeComplete,
  stocks,
}: TradeDialogProps) {
  const [tradeType, setTradeType] = useState<"BUY" | "SELL">("BUY");
  const [buyForm, setBuyForm] = useState({
    stockCd: "",
    displayName: "",
    qty: "",
    price: "",
    transDt: "",
    currency: "",
  });
  const [sellForm, setSellForm] = useState({
    stockCd: "",
    qty: "",
    price: "",
    transDt: "",
    currency: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const searchResults = useMemo(() => {
    if (!searchQuery) return [];
    const q = searchQuery.toLowerCase();
    return stocks.filter(
      (s) =>
        s.stockCd.toLowerCase().includes(q) ||
        s.stockNm.toLowerCase().includes(q) ||
        (s.stockNmKo?.toLowerCase().includes(q) ?? false) ||
        s.sectorKo.toLowerCase().includes(q),
    );
  }, [searchQuery, stocks]);

  // 종목 코드로 통화 자동 감지 (한국 종목: 005930.KS / 005930.KQ → KRW, 미국 종목 → USD)
  function detectCurrency(stockCd: string): "USD" | "KRW" {
    return /^\d{6}\.(KS|KQ|KX)$/.test(stockCd) ? "KRW" : "USD";
  }

  // stockCd로 종목 정보 조회
  function getStockInfo(stockCd: string) {
    const stock = stocks.find((s) => s.stockCd === stockCd);
    return stock
      ? { nameKr: stock.stockNmKo || stock.stockNm, sector: stock.sector }
      : null;
  }

  const handleSelectStock = (stock: StockWithPrice) => {
    const currency = detectCurrency(stock.stockCd);
    setBuyForm({
      ...buyForm,
      stockCd: stock.stockCd,
      displayName: stock.stockNmKo || stock.stockNm,
      price: stock.closePrice.toString(),
      currency,
    });
    setSearchQuery(stock.stockCd);
    setShowSearchResults(false);
  };

  // 매수 거래이력 등록
  const handleBuy = async () => {
    if (!buyForm.stockCd || !buyForm.qty || !buyForm.price || !buyForm.transDt)
      return;
    const qty = parseFloat(buyForm.qty);
    const price = parseFloat(buyForm.price);
    setSubmitting(true);
    try {
      await addTransaction({
        portfolioId: currentPortfolioId,
        stockCd: buyForm.stockCd.toUpperCase(),
        transType: "BUY",
        transDt: buyForm.transDt,
        qty,
        price,
        amount: qty * price,
        currency: buyForm.currency || "USD",
      });
      onTradeComplete();
      resetForm();
      onOpenChange(false);
    } catch {
      // apiClient 인터셉터에서 에러 처리됨
    } finally {
      setSubmitting(false);
    }
  };

  // 매도 거래이력 등록
  const handleSell = async () => {
    if (
      !sellForm.stockCd ||
      !sellForm.qty ||
      !sellForm.price ||
      !sellForm.transDt
    )
      return;
    const qty = parseFloat(sellForm.qty);
    const price = parseFloat(sellForm.price);
    setSubmitting(true);
    try {
      await addTransaction({
        portfolioId: currentPortfolioId,
        stockCd: sellForm.stockCd,
        transType: "SELL",
        transDt: sellForm.transDt,
        qty,
        price,
        amount: qty * price,
        currency: sellForm.currency || "USD",
      });
      onTradeComplete();
      resetForm();
      onOpenChange(false);
    } catch {
      // apiClient 인터셉터에서 에러 처리됨
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setTradeType("BUY");
    setBuyForm({
      stockCd: "",
      displayName: "",
      qty: "",
      price: "",
      transDt: "",
      currency: "",
    });
    setSellForm({ stockCd: "", qty: "", price: "", transDt: "", currency: "" });
    setSearchQuery("");
    setShowSearchResults(false);
  };

  const handleOpenChange = (value: boolean) => {
    if (value) resetForm();
    onOpenChange(value);
  };

  // 매도 종목 선택 시
  const handleSelectSellStock = (stockCd: string) => {
    const position = positions.find((p) => p.stockCd === stockCd);
    setSellForm({
      ...sellForm,
      stockCd,
      qty: position ? position.holdQty.toString() : "",
      currency: position?.currency || detectCurrency(stockCd),
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[90vw] max-h-[80vh] overflow-y-auto bg-slate-700 border-slate-600 text-gray-100">
        <DialogHeader>
          <DialogTitle className="text-gray-100">거래하기</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* 매수/매도 탭 */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={tradeType === "BUY" ? "default" : "outline"}
              onClick={() => setTradeType("BUY")}
              className={
                tradeType === "BUY"
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-slate-700 border-slate-500 text-gray-300 hover:bg-slate-600"
              }
            >
              매수
            </Button>
            <Button
              variant={tradeType === "SELL" ? "default" : "outline"}
              onClick={() => setTradeType("SELL")}
              className={
                tradeType === "SELL"
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-slate-700 border-slate-500 text-gray-300 hover:bg-slate-600"
              }
            >
              매도
            </Button>
          </div>

          {/* 매수 폼 */}
          {tradeType === "BUY" && (
            <>
              <div className="space-y-3">
                <div className="relative">
                  <Label htmlFor="stockCd" className="text-xs text-gray-200">
                    종목 코드 *
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="stockCd"
                      placeholder="종목 코드 또는 이름으로 검색 (예: AAPL, Apple)"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowSearchResults(e.target.value.length > 0);
                      }}
                      onFocus={() =>
                        setShowSearchResults(searchQuery.length > 0)
                      }
                      className="text-sm bg-slate-600 border-slate-500 text-gray-100 pl-10"
                    />
                  </div>

                  {showSearchResults && searchResults.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-slate-600 border border-slate-500 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {searchResults.map((stock) => (
                        <button
                          key={stock.stockCd}
                          type="button"
                          onClick={() => handleSelectStock(stock)}
                          className="w-full px-3 py-2 text-left hover:bg-slate-500 transition-colors border-b border-slate-500 last:border-b-0"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="font-semibold text-sm text-gray-100">
                                  {stock.stockCd}
                                </span>
                                <span className="text-xs text-cyan-400">
                                  {stock.stockNmKo ?? stock.sectorKo}
                                </span>
                              </div>
                              <div className="text-xs text-gray-300">
                                {stock.stockNm}
                              </div>
                            </div>
                            <div className="text-right ml-2">
                              <div className="text-sm text-gray-100 font-medium">
                                {detectCurrency(stock.stockCd) === "KRW"
                                  ? `₩${stock.closePrice.toLocaleString()}`
                                  : `$${stock.closePrice.toFixed(2)}`}
                              </div>
                              <div className="text-xs text-gray-400">
                                {stock.sector}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {showSearchResults &&
                    searchQuery.length > 0 &&
                    searchResults.length === 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-slate-600 border border-slate-500 rounded-md shadow-lg p-3">
                        <p className="text-xs text-gray-300 text-center">
                          검색 결과가 없습니다
                        </p>
                      </div>
                    )}
                </div>

                <div>
                  <Label htmlFor="buyQty" className="text-xs text-gray-200">
                    매수 수량 *
                  </Label>
                  <Input
                    id="buyQty"
                    type="number"
                    placeholder="예: 10"
                    value={buyForm.qty}
                    onChange={(e) =>
                      setBuyForm({ ...buyForm, qty: e.target.value })
                    }
                    className="text-sm bg-slate-600 border-slate-500 text-gray-100"
                  />
                </div>
                <div>
                  <Label htmlFor="buyPrice" className="text-xs text-gray-200">
                    매수 단가 ({buyForm.currency === "KRW" ? "₩" : "$"}) *
                  </Label>
                  <Input
                    id="buyPrice"
                    type="number"
                    step={buyForm.currency === "KRW" ? "1" : "0.01"}
                    placeholder={
                      buyForm.currency === "KRW" ? "예: 75000" : "예: 175.50"
                    }
                    value={buyForm.price}
                    onChange={(e) =>
                      setBuyForm({ ...buyForm, price: e.target.value })
                    }
                    className="text-sm bg-slate-600 border-slate-500 text-gray-100"
                  />
                </div>
                <div>
                  <Label htmlFor="buyDt" className="text-xs text-gray-200">
                    매수 날짜 *
                  </Label>
                  <Input
                    id="buyDt"
                    type="date"
                    value={buyForm.transDt}
                    onChange={(e) =>
                      setBuyForm({ ...buyForm, transDt: e.target.value })
                    }
                    className="text-sm bg-slate-600 border-slate-500 text-gray-100"
                  />
                </div>
              </div>

              <Button
                onClick={handleBuy}
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={
                  !buyForm.stockCd ||
                  !buyForm.qty ||
                  !buyForm.price ||
                  !buyForm.transDt ||
                  submitting
                }
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                매수하기
              </Button>
            </>
          )}

          {/* 매도 폼 */}
          {tradeType === "SELL" && (
            <>
              {positions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-300">
                    매도할 종목이 없습니다.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-gray-200">
                      매도할 종목 *
                    </Label>
                    <Select
                      value={sellForm.stockCd || ""}
                      onValueChange={handleSelectSellStock}
                    >
                      <SelectTrigger className="w-full bg-slate-600 border-slate-500 text-gray-100 text-sm">
                        <SelectValue placeholder="선택하세요" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-600 border-slate-500">
                        {positions.map((pos) => {
                          const info = getStockInfo(pos.stockCd);
                          return (
                            <SelectItem
                              key={pos.itemId}
                              value={pos.stockCd}
                              className="text-gray-100 focus:bg-slate-500"
                            >
                              {pos.stockCd}
                              {info ? ` (${info.nameKr})` : ""} - {pos.holdQty}
                              주
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="sellQty" className="text-xs text-gray-200">
                      매도 수량 *
                    </Label>
                    <Input
                      id="sellQty"
                      type="number"
                      placeholder="전량 매도"
                      value={sellForm.qty}
                      onChange={(e) =>
                        setSellForm({ ...sellForm, qty: e.target.value })
                      }
                      className="text-sm bg-slate-600 border-slate-500 text-gray-100"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="sellPrice"
                      className="text-xs text-gray-200"
                    >
                      매도 단가 ({sellForm.currency === "KRW" ? "₩" : "$"}) *
                    </Label>
                    <Input
                      id="sellPrice"
                      type="number"
                      step={sellForm.currency === "KRW" ? "1" : "0.01"}
                      placeholder={
                        sellForm.currency === "KRW" ? "예: 80000" : "예: 180.00"
                      }
                      value={sellForm.price}
                      onChange={(e) =>
                        setSellForm({ ...sellForm, price: e.target.value })
                      }
                      className="text-sm bg-slate-600 border-slate-500 text-gray-100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sellDt" className="text-xs text-gray-200">
                      매도 날짜 *
                    </Label>
                    <Input
                      id="sellDt"
                      type="date"
                      value={sellForm.transDt}
                      onChange={(e) =>
                        setSellForm({ ...sellForm, transDt: e.target.value })
                      }
                      className="text-sm bg-slate-600 border-slate-500 text-gray-100"
                    />
                  </div>

                  <Button
                    onClick={handleSell}
                    className="w-full bg-red-600 hover:bg-red-700"
                    disabled={
                      !sellForm.stockCd ||
                      !sellForm.qty ||
                      !sellForm.price ||
                      !sellForm.transDt ||
                      submitting
                    }
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    매도하기
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
