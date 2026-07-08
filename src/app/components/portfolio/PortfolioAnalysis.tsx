import { useState, useEffect, useCallback, useMemo } from "react";
import { Card } from "@/app/components/ui/layout/card";
import { TrendingUp, TrendingDown, PieChart as PieChartIcon, BarChart3 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import type { StockPrice, PortfolioItemResponse, TransactionResponse, DividendHistoryRecord } from "@/app/types";
import { getPortfoliosByUser } from "@/app/services/portfolioService";
import { getPortfolioItems } from "@/app/services/portfolioItemService";
import { getTransactionsByPortfolio } from "@/app/services/transactionService";
import { getStocksWithPrice, type StockWithPrice } from "@/app/services/stockService";
import { getDividendsByPortfolio } from "@/app/services/dividendService";
import { predictNextExDate, predictNextPaymentDate } from "@/app/utils/dividend";
import { useCurrency, EXCHANGE_RATE } from "@/app/contexts/CurrencyContext";
import { CurrencyToggleButton } from "@/app/components/ui/CurrencyToggleButton";

type TrendPeriod = 'week' | 'month' | 'year';

function getPeriodKey(date: Date, period: TrendPeriod): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  if (period === 'year') return String(y);
  if (period === 'month') return `${y}-${m}`;
  const dow = date.getDay();
  const monday = new Date(date);
  monday.setDate(date.getDate() - (dow === 0 ? 6 : dow - 1));
  const wy = monday.getFullYear();
  const wm = String(monday.getMonth() + 1).padStart(2, '0');
  const wd = String(monday.getDate()).padStart(2, '0');
  return `${wy}${wm}${wd}`;
}

function formatPeriodLabel(key: string, period: TrendPeriod): string {
  if (period === 'year') return `${key}년`;
  if (period === 'month') return `${key.slice(2, 4)}.${key.slice(5)}`;
  return `${parseInt(key.slice(4, 6))}/${parseInt(key.slice(6, 8))}`;
}

function getAllPeriodsInRange(startDate: Date, endDate: Date, period: TrendPeriod): string[] {
  const keys: string[] = [];
  if (period === 'year') {
    for (let y = startDate.getFullYear(); y <= endDate.getFullYear(); y++) {
      keys.push(String(y));
    }
  } else if (period === 'month') {
    const cur = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const end = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
    while (cur <= end) {
      keys.push(`${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}`);
      cur.setMonth(cur.getMonth() + 1);
    }
  } else {
    const dow = startDate.getDay();
    const cur = new Date(startDate);
    cur.setDate(cur.getDate() - (dow === 0 ? 6 : dow - 1));
    const endDow = endDate.getDay();
    const endMonday = new Date(endDate);
    endMonday.setDate(endMonday.getDate() - (endDow === 0 ? 6 : endDow - 1));
    while (cur <= endMonday) {
      const y = cur.getFullYear();
      const m = String(cur.getMonth() + 1).padStart(2, '0');
      const d = String(cur.getDate()).padStart(2, '0');
      keys.push(`${y}${m}${d}`);
      cur.setDate(cur.getDate() + 7);
    }
  }
  return keys;
}

const RADIAN = Math.PI / 180;

interface ChartItem {
  name: string;
  value: number;
  rawValue: number;
  currency: string;
  nextExDate?: string | null;      // 예상 배당락일 (배당 섹션 전용)
  nextPaymentDate?: string | null; // 예상 지급일 (배당 섹션 전용)
}

const renderLabel = ({
  cx, cy, midAngle, innerRadius, outerRadius, name, percent,
}: {
  cx: number; cy: number; midAngle: number; innerRadius: number; outerRadius: number; name: string; percent: number;
}) => {
  if (percent < 0.05) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700}>
      <tspan x={x} dy="-0.6em">{name}</tspan>
      <tspan x={x} dy="1.3em">{(percent * 100).toFixed(0)}%</tspan>
    </text>
  );
};

const CustomTooltip = ({ active, payload, formatFn }: { active?: boolean; payload?: { payload: ChartItem }[]; formatFn: (v: number, c: string) => string }) => {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 shadow-xl text-xs">
      <div className="font-semibold text-gray-100">{item.name}</div>
      <div className="text-purple-300">{formatFn(item.rawValue, item.currency)}</div>
    </div>
  );
};

const COLORS = ["#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#ef4444", "#06b6d4", "#f97316", "#a78bfa", "#34d399"];

// 컴포넌트 외부 정의 — 렌더링마다 새 타입이 생성되지 않아 Recharts 재애니메이션 방지
const DonutChart = ({
  data,
  centerLabel,
  formatFn,
}: {
  data: ChartItem[];
  centerLabel: string;
  formatFn: (v: number) => string;
}) => (
  <div className="relative h-72">
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={45}
          outerRadius={115}
          paddingAngle={2}
          dataKey="value"
          label={renderLabel}
          labelLine={false}
          strokeWidth={0}
          isAnimationActive={false}
        >
          {data.map((_entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip formatFn={(v) => formatFn(v)} />} />
      </PieChart>
    </ResponsiveContainer>
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
      <span className="text-xs text-gray-400">{centerLabel}</span>
      <span className="text-sm font-bold text-gray-100">{data.length}개</span>
    </div>
  </div>
);

const ChartLegend = ({
  data,
  formatFn,
}: {
  data: ChartItem[];
  formatFn: (v: number) => string;
}) => {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div className="space-y-2.5 mt-4">
      {data.map((item, index) => {
        const pct = total > 0 ? (item.value / total) * 100 : 0;
        return (
          <div key={item.name}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-xs text-gray-300">{item.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-100">{formatFn(item.rawValue)}</span>
                <span className="text-xs text-gray-400 w-10 text-right">{pct.toFixed(1)}%</span>
              </div>
            </div>
            <div className="w-full bg-slate-600 rounded-full h-1.5">
              <div
                className="h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, backgroundColor: COLORS[index % COLORS.length] }}
              />
            </div>
            {item.nextExDate && (
              <p className="text-[11px] text-gray-500 mt-1 ml-4">
                배당락 {item.nextExDate} · 지급 {item.nextPaymentDate ?? "미정"}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};

interface PortfolioAnalysisProps {
  stockPrices?: Record<string, StockPrice>;
  embedded?: boolean;
  portfolioId?: number;
  // 임베딩 시 부모에서 데이터를 받아 중복 API 호출 제거
  positions?: PortfolioItemResponse[];
  transactions?: TransactionResponse[];
  stocks?: StockWithPrice[];
  isLoading?: boolean;
}

export function PortfolioAnalysis({
  stockPrices,
  embedded = false,
  portfolioId: portfolioIdProp,
  positions: positionsProp,
  transactions: transactionsProp,
  stocks: stocksProp,
  isLoading: isLoadingProp,
}: PortfolioAnalysisProps) {
  const { currency, convert } = useCurrency();
  const [trendPeriod, setTrendPeriod] = useState<TrendPeriod>('month');
  const [dividendMap, setDividendMap] = useState<Record<string, DividendHistoryRecord[]>>({});

  // 독립 탭 모드일 때만 내부 상태/API 사용
  const [currentPortfolioId, setCurrentPortfolioId] = useState<number>(0);
  const [positionsInternal, setPositionsInternal] = useState<PortfolioItemResponse[]>([]);
  const [transactionsInternal, setTransactionsInternal] = useState<TransactionResponse[]>([]);
  const [stocksInternal, setStocksInternal] = useState<StockWithPrice[]>([]);
  const [loadingInternal, setLoadingInternal] = useState(false);
  const [stocksLoadingInternal, setStocksLoadingInternal] = useState(true);

  const isControlled = positionsProp !== undefined;

  // props가 있으면 그대로 사용, 없으면 내부 상태 사용
  const positions = isControlled ? positionsProp : positionsInternal;
  const transactions = isControlled ? (transactionsProp ?? []) : transactionsInternal;
  const stocks = isControlled ? (stocksProp ?? []) : stocksInternal;
  const loading = isControlled ? (isLoadingProp ?? false) : (loadingInternal || stocksLoadingInternal);

  // 배당 데이터 fetch (portfolioId가 결정되거나 보유 종목 구성이 바뀌면 실행)
  const activePortfolioId = isControlled ? (portfolioIdProp ?? 0) : currentPortfolioId;
  // 보유 종목코드 집합 — 매수로 새 종목이 추가되면 배당 데이터도 다시 불러온다
  const holdingsKey = useMemo(
    () => [...new Set(positions.map((p) => p.stockCd))].sort().join(","),
    [positions],
  );
  useEffect(() => {
    if (!activePortfolioId) return;
    getDividendsByPortfolio(activePortfolioId)
      .then((res) => setDividendMap(res.data.data ?? {}))
      .catch(() => setDividendMap({}));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePortfolioId, holdingsKey]);

  const fetchPortfolios = useCallback(async () => {
    if (isControlled) return;
    try {
      const response = await getPortfoliosByUser();
      const list = response.data.data ?? [];
      if (list.length > 0) {
        setCurrentPortfolioId((prev) => prev || list[0].portfolioId);
      }
    } catch {
      // apiClient 인터셉터에서 에러 처리됨
    }
  }, [isControlled]);

  useEffect(() => {
    if (isControlled) return;
    fetchPortfolios();
    getStocksWithPrice()
      .then((res) => setStocksInternal(res.data.data))
      .catch(() => {})
      .finally(() => setStocksLoadingInternal(false));
  }, [isControlled, fetchPortfolios]);

  const fetchPositions = useCallback(async () => {
    if (isControlled || !currentPortfolioId) return;
    setLoadingInternal(true);
    try {
      const response = await getPortfolioItems(currentPortfolioId);
      setPositionsInternal(response.data.data ?? []);
    } catch {
      // apiClient 인터셉터에서 에러 처리됨
    } finally {
      setLoadingInternal(false);
    }
  }, [isControlled, currentPortfolioId]);

  const fetchTransactions = useCallback(async () => {
    if (isControlled || !currentPortfolioId) return;
    try {
      const response = await getTransactionsByPortfolio(currentPortfolioId);
      setTransactionsInternal(response.data.data ?? []);
    } catch {}
  }, [isControlled, currentPortfolioId]);

  useEffect(() => {
    fetchPositions();
    fetchTransactions();
  }, [fetchPositions, fetchTransactions]);

  // 실시간(SSE) 시세 → 포지션 embed 종가 → stocks 목록 종가 순으로 fallback
  const getCurrentPrice = (pos: PortfolioItemResponse): number | null => {
    const live = stockPrices?.[pos.stockCd];
    if (live) return live.currentPrice;
    if (pos.closePrice != null) return pos.closePrice;
    const stock = stocks.find((s) => s.stockCd === pos.stockCd);
    return stock?.closePrice || null;
  };

  function getDisplayName(pos: PortfolioItemResponse): string {
    const stock = stocks.find((s) => s.stockCd === pos.stockCd);
    if (pos.currency === "KRW") return stock?.stockNmKo || stock?.stockNm || pos.stockCd;
    return pos.stockCd;
  }

  const fmtConverted = useCallback((amount: number): string => {
    if (currency === "KRW") {
      return `₩${Math.round(amount).toLocaleString("ko-KR")}`;
    }
    return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }, [currency]);

  const trendData = useMemo(() => {
    if (!transactions.length) return [];
    const sorted = [...transactions].sort(
      (a, b) => new Date(a.transDt).getTime() - new Date(b.transDt).getTime()
    );
    const periodMap = new Map<string, number>();
    sorted.forEach((tx) => {
      const key = getPeriodKey(new Date(tx.transDt), trendPeriod);
      const amount = convert(tx.amount, tx.currency);
      periodMap.set(key, (periodMap.get(key) ?? 0) + (tx.transType === 'BUY' ? amount : -amount));
    });

    const allKeys = getAllPeriodsInRange(new Date(sorted[0].transDt), new Date(), trendPeriod);
    const limit = trendPeriod === 'week' ? 26 : trendPeriod === 'month' ? 24 : Infinity;
    const displayKeys = allKeys.slice(-limit);

    // 표시 범위 이전 누적값 선계산
    let cumulative = 0;
    for (const key of allKeys) {
      if (key >= displayKeys[0]) break;
      cumulative += periodMap.get(key) ?? 0;
    }

    return displayKeys.map((key) => {
      cumulative = Math.max(0, cumulative + (periodMap.get(key) ?? 0));
      return { label: formatPeriodLabel(key, trendPeriod), value: cumulative };
    });
  }, [transactions, trendPeriod, convert]);

  const totalInvestment = positions.reduce((sum, p) => sum + convert(p.buyAmount, p.currency), 0);
  const totalCurrent = positions.reduce((sum, p) => {
    const price = getCurrentPrice(p);
    const val = price ? price * p.holdQty : p.buyAmount;
    return sum + convert(val, p.currency);
  }, 0);
  const totalProfit = totalCurrent - totalInvestment;
  const totalProfitPct = totalInvestment > 0 ? (totalProfit / totalInvestment) * 100 : 0;

  const usdCount = positions.filter((p) => p.currency !== "KRW").length;
  const krwCount = positions.filter((p) => p.currency === "KRW").length;

  const stockAllocation = useMemo<ChartItem[]>(() => positions.map((pos) => {
    const price = getCurrentPrice(pos);
    const rawValue = price ? price * pos.holdQty : pos.buyAmount;
    const convertedValue = convert(rawValue, pos.currency);
    return { name: getDisplayName(pos), value: convertedValue, rawValue: convertedValue, currency };
  }).sort((a, b) => b.value - a.value), [positions, stocks, stockPrices, convert, currency]);

  const dividendAllocation = useMemo<ChartItem[]>(() => {
    return positions
      .map((pos) => {
        const records = dividendMap[pos.stockCd] ?? [];
        const annualPerShare = records.reduce((sum, r) => sum + Number(r.dividend), 0);
        const annualDividend = annualPerShare * pos.holdQty;
        return { pos, annualDividend };
      })
      .filter((x) => x.annualDividend > 0)
      .map(({ pos, annualDividend }) => {
        const converted = convert(annualDividend, pos.currency);
        const records = dividendMap[pos.stockCd] ?? [];
        const nextExDate = predictNextExDate(records);
        const nextPaymentDate = predictNextPaymentDate(records, nextExDate);
        return { name: getDisplayName(pos), value: converted, rawValue: converted, currency, nextExDate, nextPaymentDate };
      })
      .sort((a, b) => b.value - a.value);
  }, [dividendMap, positions, convert, currency]);

  const sectorAllocation = useMemo<ChartItem[]>(() => {
    const map: Record<string, ChartItem> = {};
    positions.forEach((pos) => {
      const stockInfo = stocks.find((s) => s.stockCd === pos.stockCd);
      const sector = (pos.sectorKo ?? stockInfo?.sectorKo) ?? "기타";
      const price = getCurrentPrice(pos);
      const rawValue = price ? price * pos.holdQty : pos.buyAmount;
      const convertedValue = convert(rawValue, pos.currency);
      if (map[sector]) {
        map[sector].value += convertedValue;
        map[sector].rawValue += convertedValue;
      } else {
        map[sector] = { name: sector, value: convertedValue, rawValue: convertedValue, currency };
      }
    });
    return Object.values(map).sort((a, b) => b.value - a.value);
  }, [positions, stocks, stockPrices, convert, currency]);

  const hasBothCurrencies = usdCount > 0 && krwCount > 0;
  const exchangeNote = hasBothCurrencies ? `(환율 ${EXCHANGE_RATE.toLocaleString()}원 기준 환산)` : "";


  return (
    <div className="space-y-6">
      {/* 페이지 헤더 — 독립 탭일 때만 표시 */}
      {!embedded && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-purple-400" />
              자산 분석
            </h2>
            <p className="text-sm text-gray-400 mt-1">포트폴리오 비중 및 수익 추이</p>
          </div>
          <CurrencyToggleButton />
        </div>
      )}

      {loading ? (
        !embedded ? (
          <Card className="p-12 text-center bg-slate-800 border-slate-700">
            <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-400">데이터를 불러오는 중...</p>
          </Card>
        ) : null
      ) : positions.length === 0 ? (
        !embedded ? (
          <Card className="p-12 text-center bg-slate-800 border-slate-700">
            <BarChart3 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-400">포트폴리오에 종목을 추가하면 자산 분석 데이터를 확인할 수 있습니다.</p>
          </Card>
        ) : null
      ) : (
        <>
          {/* 총자산 요약 카드 — 독립 탭일 때만 표시 */}
          {!embedded && <Card className="p-5 text-white border-0 shadow-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm opacity-80 mb-1">총 자산 ({currency === "USD" ? "USD" : "KRW"})</p>
                <p className="text-3xl font-bold tracking-tight">{fmtConverted(totalCurrent)}</p>
                <div className={`flex items-center gap-1 mt-2 text-sm ${totalProfit >= 0 ? "text-green-300" : "text-red-300"}`}>
                  {totalProfit >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span className="font-semibold">{fmtConverted(Math.abs(totalProfit))}</span>
                  <span className="opacity-80">({totalProfitPct >= 0 ? "+" : ""}{totalProfitPct.toFixed(2)}%)</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5 text-xs opacity-75">
                <p>총 투자금: {fmtConverted(totalInvestment)}</p>
                <div className="flex gap-1.5">
                  {usdCount > 0 && <span className="bg-white/20 px-2 py-0.5 rounded-full">미국 {usdCount}종목</span>}
                  {krwCount > 0 && <span className="bg-white/20 px-2 py-0.5 rounded-full">한국 {krwCount}종목</span>}
                </div>
                {hasBothCurrencies && <p className="text-right">{exchangeNote}</p>}
              </div>
            </div>
          </Card>}

          {/* 파이차트 그리드 — 3개 */}
          {(stockAllocation.length > 0 || sectorAllocation.length > 0) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {stockAllocation.length > 0 && (
                <Card className="p-5 bg-slate-800 border-slate-700 shadow-lg">
                  <h3 className="font-semibold text-sm mb-3 flex items-center gap-2 text-gray-100">
                    <PieChartIcon className="w-4 h-4 text-blue-400" />
                    종목별 비중
                    {hasBothCurrencies && <span className="text-xs text-gray-500 font-normal ml-1">{exchangeNote}</span>}
                  </h3>
                  <DonutChart data={stockAllocation} centerLabel="종목" formatFn={fmtConverted} />
                  <ChartLegend data={stockAllocation} formatFn={fmtConverted} />
                </Card>
              )}

              {sectorAllocation.length > 0 && (
                <Card className="p-5 bg-slate-800 border-slate-700 shadow-lg">
                  <h3 className="font-semibold text-sm mb-3 flex items-center gap-2 text-gray-100">
                    <PieChartIcon className="w-4 h-4 text-purple-400" />
                    섹터별 비중
                    {hasBothCurrencies && <span className="text-xs text-gray-500 font-normal ml-1">{exchangeNote}</span>}
                  </h3>
                  <DonutChart data={sectorAllocation} centerLabel="섹터" formatFn={fmtConverted} />
                  <ChartLegend data={sectorAllocation} formatFn={fmtConverted} />
                </Card>
              )}

              <Card className="p-5 bg-slate-800 border-slate-700 shadow-lg">
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2 text-gray-100">
                  <PieChartIcon className="w-4 h-4 text-green-400" />
                  배당금 비중
                  {hasBothCurrencies && <span className="text-xs text-gray-500 font-normal ml-1">{exchangeNote}</span>}
                </h3>
                {dividendAllocation.length > 0 ? (
                  <>
                    <DonutChart data={dividendAllocation} centerLabel="연배당" formatFn={fmtConverted} />
                    <ChartLegend data={dividendAllocation} formatFn={fmtConverted} />
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-72 text-center">
                    <PieChartIcon className="w-10 h-10 text-gray-600 mb-3" />
                    <p className="text-xs text-gray-500">배당 데이터가 없습니다</p>
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* 자산 추이 차트 (풀 너비) */}
          <Card className="p-5 bg-slate-800 border-slate-700 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm flex items-center gap-2 text-gray-100">
                <TrendingUp className="w-4 h-4 text-green-400" />
                자산 추이
              </h3>
              <div className="flex gap-1">
                {(['week', 'month', 'year'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setTrendPeriod(p)}
                    className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
                      trendPeriod === p
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-700 text-gray-400 hover:bg-slate-600'
                    }`}
                  >
                    {p === 'week' ? '주별' : p === 'month' ? '월별' : '연별'}
                  </button>
                ))}
              </div>
            </div>
            {trendData.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">거래 내역이 없습니다.</p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={trendData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                    <defs>
                      <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis
                      dataKey="label"
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      interval={Math.max(0, Math.floor(trendData.length / 6) - 1)}
                    />
                    <YAxis
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      width={56}
                      tickFormatter={(v: number) =>
                        currency === 'KRW'
                          ? `₩${(v / 1_000_000).toFixed(0)}M`
                          : `$${(v / 1_000).toFixed(0)}K`
                      }
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                      labelStyle={{ color: '#e2e8f0', fontSize: 12 }}
                      formatter={(value: number) => [fmtConverted(value), '누적 투자금']}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#6366f1"
                      strokeWidth={2.5}
                      fill="url(#trendGradient)"
                      dot={{ r: 3, fill: '#6366f1', strokeWidth: 0 }}
                      activeDot={{ r: 5, fill: '#818cf8' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
                <p className="text-[10px] text-gray-600 text-right mt-2">
                  * 매수/매도 기준 누적 투자금액
                  {hasBothCurrencies && ` ${exchangeNote}`}
                </p>
              </>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
