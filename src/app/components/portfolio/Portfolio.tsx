import { useState, useEffect, useCallback } from "react";
import { Briefcase, Plus, FolderOpen, Settings } from "lucide-react";
import type {
  PortfolioResponse,
  StockPrice,
  PortfolioItemResponse,
  TransactionResponse,
} from "@/app/types";
import {
  getPortfolioDashboard,
  getPortfolioDetail,
  getPortfoliosByUser,
} from "@/app/services/portfolioService";
import { removeTransaction } from "@/app/services/transactionService";
import {
  getStocksWithPrice,
  type StockWithPrice,
} from "@/app/services/stockService";
import { TradeDialog } from "@/app/components/portfolio/TradeDialog";
import { EditTradeDialog } from "@/app/components/portfolio/EditTradeDialog";
import { ManagePortfolioDialog } from "@/app/components/portfolio/ManagePortfolioDialog";
import { PositionList } from "@/app/components/portfolio/PositionList";
import { TradeHistoryList } from "@/app/components/portfolio/TradeHistoryList";
import { PortfolioAnalysis } from "@/app/components/portfolio/PortfolioAnalysis";
import { CurrencyToggleButton } from "@/app/components/ui/CurrencyToggleButton";
import { MarketBriefingCard } from "@/app/components/market/MarketBriefingCard";

interface PortfolioProps {
  stockPrices?: Record<string, StockPrice>;
}

export function Portfolio({ stockPrices }: PortfolioProps) {
  const [portfolios, setPortfolios] = useState<PortfolioResponse[]>([]);
  const [currentPortfolioId, setCurrentPortfolioId] = useState<number>(0);
  const [positions, setPositions] = useState<PortfolioItemResponse[]>([]);
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [tradeDialogStocks, setTradeDialogStocks] = useState<StockWithPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isManagePortfolioOpen, setIsManagePortfolioOpen] = useState(false);
  const [openTradeAfterPortfolio, setOpenTradeAfterPortfolio] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<TransactionResponse | null>(null);

  // positions에 stock 정보가 embed되어 있으므로 별도 stocks API 불필요
  const stocks: StockWithPrice[] = positions.map((pos) => ({
    stockCd: pos.stockCd,
    stockNm: pos.stockNm ?? pos.stockCd,
    stockNmKo: pos.stockNmKo,
    sector: pos.sector ?? '',
    sectorKo: pos.sectorKo ?? '',
    priceDt: pos.priceDt ?? '',
    openPrice: 0,
    highPrice: 0,
    lowPrice: 0,
    closePrice: pos.closePrice ?? 0,
    volume: 0,
  }));

  // 탭 최초 진입 — 1 call로 포트폴리오 목록 + positions + transactions 수신
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await getPortfolioDashboard();
        const data = res.data.data;
        const list = data.portfolios ?? [];
        setPortfolios(list);
        const defaultId = data.activePortfolioId ?? list[0]?.portfolioId ?? 0;
        setCurrentPortfolioId(defaultId);
        setPositions(data.positions ?? []);
        setTransactions(data.transactions ?? []);
      } catch {
        // apiClient 인터셉터에서 에러 처리됨
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (openTradeAfterPortfolio && currentPortfolioId) {
      setOpenTradeAfterPortfolio(false);
      setIsAddDialogOpen(true);
    }
  }, [openTradeAfterPortfolio, currentPortfolioId]);

  // 포트폴리오 전환 — 1 call로 positions + transactions 동시 수신
  const fetchPortfolioDetail = useCallback(async (portfolioId: number) => {
    if (!portfolioId) return;
    setLoading(true);
    try {
      const res = await getPortfolioDetail(portfolioId);
      const data = res.data.data;
      setPositions(data.positions ?? []);
      setTransactions(data.transactions ?? []);
    } catch {
      // apiClient 인터셉터에서 에러 처리됨
    } finally {
      setLoading(false);
    }
  }, []);

  const handlePortfolioSelect = useCallback((portfolioId: number) => {
    setCurrentPortfolioId(portfolioId);
    fetchPortfolioDetail(portfolioId);
  }, [fetchPortfolioDetail]);

  const handleTradeComplete = useCallback(async () => {
    await fetchPortfolioDetail(currentPortfolioId);
  }, [fetchPortfolioDetail, currentPortfolioId]);

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

  const handleDeleteTransaction = async (tx: TransactionResponse) => {
    if (
      !confirm(
        `${tx.stockCd} ${tx.transType === "BUY" ? "매수" : "매도"} 내역을 삭제할까요?`,
      )
    )
      return;
    try {
      await removeTransaction(tx.transId);
      await fetchPortfolioDetail(currentPortfolioId);
    } catch {
      // apiClient 인터셉터에서 에러 처리됨
    }
  };

  // TradeDialog는 전체 종목 검색이 필요 — 다이얼로그 첫 오픈 시에만 로드
  const handleAddClick = useCallback(() => {
    if (tradeDialogStocks.length === 0) {
      getStocksWithPrice()
        .then((res) => setTradeDialogStocks(res.data.data))
        .catch(() => {});
    }
    if (!currentPortfolioId) {
      setOpenTradeAfterPortfolio(true);
      setIsManagePortfolioOpen(true);
    } else {
      setIsAddDialogOpen(true);
    }
  }, [currentPortfolioId, tradeDialogStocks.length]);

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
    <div className="space-y-5">
      {/* 시황 브리핑 — 자체 로딩/에러 처리, 데이터 없으면 미렌더링 */}
      <MarketBriefingCard />

      {/* 헤더 */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-semibold text-gray-100">내 포트폴리오</h2>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <CurrencyToggleButton />
          <button
            onClick={handleAddClick}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            매수/매도
          </button>
        </div>
      </div>

      {/* 포트폴리오 탭 */}
      <div className="flex items-center gap-2 flex-wrap">
        {portfolios.map((p) => (
          <button
            key={p.portfolioId}
            onClick={() => handlePortfolioSelect(p.portfolioId)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-medium transition-all border ${
              currentPortfolioId === p.portfolioId
                ? "bg-indigo-600/20 border-indigo-500/40 text-indigo-300"
                : "bg-slate-800 border-slate-700 text-gray-400 hover:text-gray-200 hover:border-slate-600"
            }`}
          >
            <FolderOpen className="w-3 h-3" />
            <span>{p.portfolioNm}</span>
          </button>
        ))}
        <button
          onClick={() => setIsManagePortfolioOpen(true)}
          className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-gray-500 hover:text-gray-300 hover:bg-slate-800 transition-colors border border-dashed border-slate-700"
        >
          <Settings className="w-3 h-3" />
          {portfolios.length === 0 ? "포트폴리오 만들기" : "관리"}
        </button>
      </div>

      {/* 다이얼로그들 */}
      <ManagePortfolioDialog
        open={isManagePortfolioOpen}
        onOpenChange={setIsManagePortfolioOpen}
        portfolios={portfolios}
        currentPortfolioId={currentPortfolioId}
        onPortfolioChange={handlePortfolioChange}
        onPortfolioDeleted={handlePortfolioDeleted}
      />
      <TradeDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        currentPortfolioId={currentPortfolioId}
        positions={positions}
        onTradeComplete={handleTradeComplete}
        stocks={tradeDialogStocks}
      />
      <EditTradeDialog
        open={editingTransaction !== null}
        onOpenChange={(open) => {
          if (!open) setEditingTransaction(null);
        }}
        transaction={editingTransaction}
        onEditComplete={handleTradeComplete}
      />

      {/* 보유종목 + 매매내역 2열 그리드 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        <PositionList
          positions={positions}
          loading={loading}
          stockPrices={stockPrices}
          stocks={stocks}
          onAddClick={handleAddClick}
        />
        <TradeHistoryList
          transactions={transactions}
          stocks={stocks}
          onEdit={(tx) => setEditingTransaction(tx)}
          onDelete={handleDeleteTransaction}
          onAddClick={handleAddClick}
        />
      </div>

      {/* 자산 분석 차트 — 데이터를 부모에서 내려줘 중복 API 호출 없음 */}
      <div className="border-t border-slate-700/60 pt-6">
        <PortfolioAnalysis
          stockPrices={stockPrices}
          embedded
          portfolioId={currentPortfolioId}
          positions={positions}
          transactions={transactions}
          stocks={stocks}
          isLoading={loading}
        />
      </div>
    </div>
  );
}
