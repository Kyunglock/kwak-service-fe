import { useState, useEffect, useCallback } from "react";
import { Briefcase, Plus } from "lucide-react";
import type {
  PortfolioResponse,
  StockPrice,
  PortfolioItemResponse,
  TransactionResponse,
} from "@/app/types";
import { getPortfolioItems } from "@/app/services/portfolioItemService";
import { getPortfoliosByUser } from "@/app/services/portfolioService";
import {
  getTransactionsByPortfolio,
  removeTransaction,
} from "@/app/services/transactionService";
import {
  getStocksWithPrice,
  type StockWithPrice,
} from "@/app/services/stockService";
import { TradeDialog } from "@/app/components/portfolio/TradeDialog";
import { EditTradeDialog } from "@/app/components/portfolio/EditTradeDialog";
import { ManagePortfolioDialog } from "@/app/components/portfolio/ManagePortfolioDialog";
import { PositionList } from "@/app/components/portfolio/PositionList";
import { TradeHistoryList } from "@/app/components/portfolio/TradeHistoryList";
import { CurrencyToggleButton } from "@/app/components/ui/CurrencyToggleButton";

interface PortfolioProps {
  stockPrices?: Record<string, StockPrice>;
}

export function Portfolio({ stockPrices }: PortfolioProps) {
  const [portfolios, setPortfolios] = useState<PortfolioResponse[]>([]);
  const [currentPortfolioId, setCurrentPortfolioId] = useState<number>(0);
  const [positions, setPositions] = useState<PortfolioItemResponse[]>([]);
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [stocks, setStocks] = useState<StockWithPrice[]>([]);
  const [loading, setLoading] = useState(false);
  const [stocksLoading, setStocksLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isManagePortfolioOpen, setIsManagePortfolioOpen] = useState(false);
  const [openTradeAfterPortfolio, setOpenTradeAfterPortfolio] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<TransactionResponse | null>(null);

  useEffect(() => {
    getStocksWithPrice()
      .then((res) => setStocks(res.data.data))
      .catch(() => {})
      .finally(() => setStocksLoading(false));
  }, []);

  // API에서 포트폴리오 로드
  const fetchPortfolios = useCallback(async () => {
    try {
      const response = await getPortfoliosByUser();
      const list = response.data.data ?? [];
      setPortfolios(list);
      if (list.length > 0) {
        setCurrentPortfolioId((prev) => prev || list[0].portfolioId);
      }
    } catch {
      // apiClient 인터셉터에서 에러 처리됨
    }
  }, []);

  useEffect(() => {
    fetchPortfolios();
  }, [fetchPortfolios]);

  // 포트폴리오 생성 후 거래 다이얼로그 자동 오픈
  useEffect(() => {
    if (openTradeAfterPortfolio && currentPortfolioId) {
      setOpenTradeAfterPortfolio(false);
      setIsAddDialogOpen(true);
    }
  }, [openTradeAfterPortfolio, currentPortfolioId]);

  // API에서 포트폴리오 종목 로드
  const fetchPositions = useCallback(async () => {
    if (!currentPortfolioId) return;
    setLoading(true);
    try {
      const response = await getPortfolioItems(currentPortfolioId);
      setPositions(response.data.data ?? []);
    } catch {
      // apiClient 인터셉터에서 에러 처리됨
    } finally {
      setLoading(false);
    }
  }, [currentPortfolioId]);

  // API에서 거래 이력 로드
  const fetchTransactions = useCallback(async () => {
    if (!currentPortfolioId) return;
    try {
      const response = await getTransactionsByPortfolio(currentPortfolioId);
      setTransactions(response.data.data ?? []);
    } catch {
      // apiClient 인터셉터에서 에러 처리됨
    }
  }, [currentPortfolioId]);

  useEffect(() => {
    fetchPositions();
    fetchTransactions();
  }, [fetchPositions, fetchTransactions]);

  // 거래 완료 후: 보유종목 + 거래내역 모두 리프레시
  const handleTradeComplete = useCallback(async () => {
    await Promise.all([fetchPositions(), fetchTransactions()]);
  }, [fetchPositions, fetchTransactions]);

  // 거래 내역 삭제
  const handleDeleteTransaction = async (tx: TransactionResponse) => {
    if (
      !confirm(
        `${tx.stockCd} ${tx.transType === "BUY" ? "매수" : "매도"} 내역을 삭제할까요?`,
      )
    )
      return;
    try {
      await removeTransaction(tx.transId);
      await Promise.all([fetchPositions(), fetchTransactions()]);
    } catch {
      // apiClient 인터셉터에서 에러 처리됨
    }
  };

  // 거래 추가 버튼: 포트폴리오 없으면 포트폴리오 먼저 생성
  const handleAddClick = useCallback(() => {
    if (!currentPortfolioId) {
      setOpenTradeAfterPortfolio(true);
      setIsManagePortfolioOpen(true);
    } else {
      setIsAddDialogOpen(true);
    }
  }, [currentPortfolioId]);

  const handlePortfolioChange = useCallback(async () => {
    await fetchPortfolios();
  }, [fetchPortfolios]);

  const handlePortfolioDeleted = useCallback(
    (deletedId: number) => {
      setPortfolios((prev) => prev.filter((p) => p.portfolioId !== deletedId));
      if (currentPortfolioId === deletedId) {
        setCurrentPortfolioId(0);
      }
    },
    [currentPortfolioId],
  );

  return (
    <div className="p-2 space-y-2 pb-20">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-semibold text-gray-100">
            내 포트폴리오
          </h2>
        </div>
        <CurrencyToggleButton />
      </div>

      {/* 포트폴리오 관리 다이얼로그 */}
      <ManagePortfolioDialog
        open={isManagePortfolioOpen}
        onOpenChange={setIsManagePortfolioOpen}
        portfolios={portfolios}
        currentPortfolioId={currentPortfolioId}
        onPortfolioChange={handlePortfolioChange}
        onPortfolioDeleted={handlePortfolioDeleted}
      />

      {/* 매수/매도 다이얼로그 */}
      <TradeDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        currentPortfolioId={currentPortfolioId}
        positions={positions}
        onTradeComplete={handleTradeComplete}
        stocks={stocks} // 추가
      />

      {/* 거래 내역 수정 다이얼로그 */}
      <EditTradeDialog
        open={editingTransaction !== null}
        onOpenChange={(open) => {
          if (!open) setEditingTransaction(null);
        }}
        transaction={editingTransaction}
        onEditComplete={handleTradeComplete}
      />

      {/* 보유 종목 목록 */}
      <PositionList
        positions={positions}
        loading={loading || stocksLoading}
        stockPrices={stockPrices}
        stocks={stocks}
        onAddClick={handleAddClick}
      />

      {/* 매매 내역 */}
      <TradeHistoryList
        transactions={transactions}
        stocks={stocks}
        onEdit={(tx) => setEditingTransaction(tx)}
        onDelete={handleDeleteTransaction}
        onAddClick={handleAddClick}
      />

      {/* 플로팅 액션 버튼 */}
      <button
        onClick={handleAddClick}
        className="fixed bottom-20 right-4 w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center z-40"
        aria-label="매수/매도하기"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}
