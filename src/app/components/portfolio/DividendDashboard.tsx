import { useState, useEffect, useCallback } from "react";
import { DollarSign, TrendingUp, ChevronRight, CalendarDays, Clock, Banknote } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card } from "@/app/components/ui/layout/card";
import { getPortfoliosByUser } from "@/app/services/portfolioService";
import { getPortfolioItems } from "@/app/services/portfolioItemService";
import { getRecentDividendHistoryBatch } from "@/app/services/marketDividendService";
import type { PortfolioItemResponse, DividendHistoryRecord } from "@/app/types";
import { useCurrency, EXCHANGE_RATE } from "@/app/contexts/CurrencyContext";
import { CurrencyToggleButton } from "@/app/components/ui/CurrencyToggleButton";

const RADIAN = Math.PI / 180;
const COLORS = ["#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#ef4444", "#06b6d4", "#f97316", "#a78bfa", "#34d399"];

interface StockDividendInfo {
  stockCd: string;
  holdQty: number;
  currency: string;
  annualDividendPerShare: number;
  annualDividend: number;
  quarterlyDividend: number;
  nextExDate: string | null;
  nextPaymentDate: string | null;
}

interface ChartItem {
  name: string;
  value: number;
  rawValue: number;
}

interface NextDividendInfo {
  stockCd: string;
  nextExDate: string;
  nextPaymentDate: string | null;
  amount: number;
  currency: string;
}

function predictNextExDate(records: DividendHistoryRecord[]): string | null {
  if (records.length === 0) return null;
  const sorted = [...records].sort((a, b) => new Date(b.exDate).getTime() - new Date(a.exDate).getTime());
  const lastDate = new Date(sorted[0].exDate);
  let avgIntervalDays = 91;
  if (sorted.length >= 2) {
    const intervals: number[] = [];
    for (let i = 0; i < sorted.length - 1; i++) {
      const diff = new Date(sorted[i].exDate).getTime() - new Date(sorted[i + 1].exDate).getTime();
      intervals.push(diff / (1000 * 60 * 60 * 24));
    }
    avgIntervalDays = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  }
  const next = new Date(lastDate.getTime() + avgIntervalDays * 24 * 60 * 60 * 1000);
  return next.toISOString().split("T")[0];
}

function predictNextPaymentDate(records: DividendHistoryRecord[], nextExDate: string | null): string | null {
  if (!nextExDate) return null;
  const recordsWithPayment = records.filter((r) => r.paymentDt);
  if (recordsWithPayment.length > 0) {
    const gaps = recordsWithPayment.map((r) => {
      const exTs = new Date(r.exDate).getTime();
      const payTs = new Date(r.paymentDt!).getTime();
      return (payTs - exTs) / (1000 * 60 * 60 * 24);
    });
    const avgGap = Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length);
    const next = new Date(new Date(nextExDate).getTime() + avgGap * 24 * 60 * 60 * 1000);
    return next.toISOString().split("T")[0];
  }
  // paymentDt 데이터 없으면 30일 후 추정
  const next = new Date(new Date(nextExDate).getTime() + 30 * 24 * 60 * 60 * 1000);
  return next.toISOString().split("T")[0];
}

function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function DDayBadge({ dateStr }: { dateStr: string }) {
  const diff = daysUntil(dateStr);
  if (diff === 0)
    return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-bold bg-red-500 text-white">D-Day</span>;
  if (diff > 0)
    return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-bold bg-blue-600 text-white">D-{diff}</span>;
  return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-slate-600 text-gray-300">D+{Math.abs(diff)}</span>;
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

export function DividendDashboard() {
  const { currency, convert } = useCurrency();
  const [portfolioId, setPortfolioId] = useState<number>(0);
  const [stockDividends, setStockDividends] = useState<StockDividendInfo[]>([]);
  const [nextDividendInfo, setNextDividendInfo] = useState<NextDividendInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchPortfolio = useCallback(async () => {
    try {
      const res = await getPortfoliosByUser();
      const list = res.data.data ?? [];
      if (list.length > 0) setPortfolioId((prev) => prev || list[0].portfolioId);
    } catch {}
  }, []);

  useEffect(() => { fetchPortfolio(); }, [fetchPortfolio]);

  const fetchDividends = useCallback(async () => {
    if (!portfolioId) return;
    setLoading(true);
    try {
      const itemsRes = await getPortfolioItems(portfolioId);
      const positions: PortfolioItemResponse[] = itemsRes.data.data ?? [];
      if (positions.length === 0) {
        setStockDividends([]);
        setNextDividendInfo(null);
        return;
      }
      const stockCds = positions.map((p) => p.stockCd);
      const batchRes = await getRecentDividendHistoryBatch(stockCds, 4);
      const batchMap: Record<string, DividendHistoryRecord[]> = batchRes.data.data ?? {};

      const results: StockDividendInfo[] = positions.map((pos) => {
        const records: DividendHistoryRecord[] = batchMap[pos.stockCd] ?? [];
        const annualDividendPerShare = records.reduce((sum, r) => sum + Number(r.dividend), 0);
        const quarterlyPerShare = records.length > 0 ? annualDividendPerShare / records.length : 0;
        const nextExDate = predictNextExDate(records);
        return {
          stockCd: pos.stockCd,
          holdQty: pos.holdQty,
          currency: pos.currency,
          annualDividendPerShare,
          annualDividend: annualDividendPerShare * pos.holdQty,
          quarterlyDividend: quarterlyPerShare * pos.holdQty,
          nextExDate,
          nextPaymentDate: predictNextPaymentDate(records, nextExDate),
        };
      });
      setStockDividends(results);

      const today = new Date();
      const upcoming = results
        .filter((d) => d.annualDividend > 0 && d.nextExDate && new Date(d.nextExDate) >= today)
        .sort((a, b) => new Date(a.nextExDate!).getTime() - new Date(b.nextExDate!).getTime());
      if (upcoming.length > 0) {
        const first = upcoming[0];
        setNextDividendInfo({
          stockCd: first.stockCd,
          nextExDate: first.nextExDate!,
          nextPaymentDate: first.nextPaymentDate,
          amount: first.quarterlyDividend,
          currency: first.currency,
        });
      } else {
        setNextDividendInfo(null);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, [portfolioId]);

  useEffect(() => { fetchDividends(); }, [fetchDividends]);

  function fmtAmount(amount: number, stockCurrency = "USD"): string {
    const converted = convert(amount, stockCurrency);
    if (currency === "KRW") return `₩${Math.round(converted).toLocaleString("ko-KR")}`;
    return `$${converted.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  function fmtDate(dateStr: string): string {
    const d = new Date(dateStr);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
  }

  const dividendStocks = stockDividends
    .filter((d) => d.annualDividend > 0)
    .sort((a, b) =>
      convert(b.annualDividend, b.currency === "KRW" ? "KRW" : "USD") -
      convert(a.annualDividend, a.currency === "KRW" ? "KRW" : "USD")
    );
  const noDividendStocks = stockDividends.filter((d) => d.annualDividend === 0);

  const totalAnnual = dividendStocks.reduce(
    (sum, d) => sum + convert(d.annualDividend, d.currency === "KRW" ? "KRW" : "USD"),
    0
  );
  const monthlyEst = totalAnnual / 12;

  const chartData: ChartItem[] = dividendStocks.map((d) => {
    const converted = convert(d.annualDividend, d.currency === "KRW" ? "KRW" : "USD");
    return { name: d.stockCd, value: converted, rawValue: converted };
  });

  // 배당락일 기준 오름차순 정렬 (가장 가까운 일정부터)
  const scheduleItems = stockDividends
    .filter((d) => d.nextExDate !== null)
    .sort((a, b) => new Date(a.nextExDate!).getTime() - new Date(b.nextExDate!).getTime());

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: ChartItem }[] }) => {
    if (!active || !payload?.length) return null;
    const item = payload[0].payload;
    const pct = totalAnnual > 0 ? (item.rawValue / totalAnnual) * 100 : 0;
    return (
      <div className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 shadow-xl text-xs">
        <div className="font-semibold text-gray-100">{item.name}</div>
        <div className="text-green-300">{fmtAmount(item.rawValue, currency === "KRW" ? "KRW" : "USD")}/년</div>
        <div className="text-gray-400">{pct.toFixed(1)}%</div>
      </div>
    );
  };

  return (
    <div className="px-4 pb-20 space-y-4">
      <div className="flex items-center justify-between pt-2 pb-1">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-400" />
          <h3 className="text-base font-semibold text-gray-100">예상 배당금</h3>
        </div>
        <CurrencyToggleButton />
      </div>

      {loading ? (
        <Card className="p-6 text-center bg-slate-700 border-slate-600">
          <div className="w-7 h-7 border-2 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-300">데이터를 불러오는 중...</p>
        </Card>
      ) : stockDividends.length === 0 ? (
        <Card className="p-6 text-center bg-slate-700 border-slate-600">
          <DollarSign className="w-10 h-10 text-gray-500 mx-auto mb-2" />
          <p className="text-sm text-gray-300">포트폴리오에 종목을 추가하면</p>
          <p className="text-sm text-gray-300">예상 배당금을 확인할 수 있습니다.</p>
        </Card>
      ) : (
        <>
          {/* 요약 카드 */}
          <Card className="p-4 text-white border-0 shadow-lg bg-gradient-to-br from-green-600 to-emerald-700">
            <p className="text-sm opacity-90 mb-1">예상 연간 배당금 ({currency})</p>
            <p className="text-2xl font-bold mb-2">{fmtAmount(totalAnnual, currency === "KRW" ? "KRW" : "USD")}</p>
            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/20">
              <div>
                <p className="text-xs opacity-75">월간 예상</p>
                <p className="text-sm font-semibold">{fmtAmount(monthlyEst, currency === "KRW" ? "KRW" : "USD")}</p>
              </div>
              <div>
                <p className="text-xs opacity-75">배당 종목 수</p>
                <p className="text-sm font-semibold">{dividendStocks.length}종목</p>
              </div>
            </div>
            {nextDividendInfo && (
              <div className="mt-3 pt-3 border-t border-white/20">
                <p className="text-xs opacity-75 mb-1.5">가장 가까운 배당 예정 — {nextDividendInfo.stockCd}</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="flex items-center gap-1 mb-0.5">
                      <CalendarDays className="w-3 h-3 opacity-60" />
                      <p className="text-xs opacity-60">배당락일</p>
                    </div>
                    <p className="text-sm font-semibold">{fmtDate(nextDividendInfo.nextExDate)}</p>
                  </div>
                  {nextDividendInfo.nextPaymentDate && (
                    <div>
                      <div className="flex items-center gap-1 mb-0.5">
                        <Banknote className="w-3 h-3 opacity-60" />
                        <p className="text-xs opacity-60">지급일</p>
                      </div>
                      <p className="text-sm font-semibold">{fmtDate(nextDividendInfo.nextPaymentDate)}</p>
                    </div>
                  )}
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs opacity-60">예상 수령액</span>
                  <span className="text-sm font-semibold text-yellow-300">
                    {fmtAmount(nextDividendInfo.amount, nextDividendInfo.currency === "KRW" ? "KRW" : "USD")}
                  </span>
                </div>
              </div>
            )}
            {currency === "KRW" && (
              <p className="text-xs opacity-60 mt-2">환율 {EXCHANGE_RATE.toLocaleString()}원 기준 환산</p>
            )}
          </Card>

          {/* 다음 배당 일정 — 전체 종목 */}
          {scheduleItems.length > 0 && (
            <Card className="bg-slate-700 border-slate-600 overflow-hidden">
              <div className="p-3 border-b border-slate-600">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <h4 className="text-sm font-semibold text-gray-100">다음 배당 일정</h4>
                  <span className="text-xs text-gray-400 ml-auto">{scheduleItems.length}종목</span>
                </div>
              </div>
              <div className="divide-y divide-slate-600/60">
                {scheduleItems.map((d) => {
                  const isFuture = daysUntil(d.nextExDate!) >= 0;
                  return (
                    <div key={d.stockCd} className="px-4 py-3">
                      {/* 종목 헤더 */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                            isFuture ? "bg-blue-600/30" : "bg-slate-600/50"
                          }`}>
                            <span className={`text-xs font-bold ${
                              isFuture ? "text-blue-400" : "text-gray-400"
                            }`}>{d.stockCd.slice(0, 2)}</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-100">{d.stockCd}</span>
                          {isFuture
                            ? <span className="text-xs px-1.5 py-0.5 rounded-full bg-blue-600/30 text-blue-300">배당 예정</span>
                            : <span className="text-xs px-1.5 py-0.5 rounded-full bg-slate-600 text-gray-400">지남</span>
                          }
                        </div>
                        {d.quarterlyDividend > 0 && (
                          <span className="text-sm font-bold text-green-400">
                            {fmtAmount(d.quarterlyDividend, d.currency === "KRW" ? "KRW" : "USD")}
                          </span>
                        )}
                      </div>
                      {/* 날짜 정보 2줄 */}
                      <div className="grid grid-cols-2 gap-2 ml-9">
                        <div className="bg-slate-800/60 rounded-lg px-2.5 py-1.5">
                          <div className="flex items-center gap-1 mb-0.5">
                            <CalendarDays className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-400">배당락일</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-gray-200">{fmtDate(d.nextExDate!)}</span>
                            <DDayBadge dateStr={d.nextExDate!} />
                          </div>
                        </div>
                        <div className="bg-slate-800/60 rounded-lg px-2.5 py-1.5">
                          <div className="flex items-center gap-1 mb-0.5">
                            <Banknote className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-400">지급일 (추정)</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {d.nextPaymentDate
                              ? <>
                                  <span className="text-xs font-semibold text-gray-200">{fmtDate(d.nextPaymentDate)}</span>
                                  <DDayBadge dateStr={d.nextPaymentDate} />
                                </>
                              : <span className="text-xs text-gray-500">데이터 없음</span>
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="px-4 py-2 border-t border-slate-600/60 bg-slate-800/30">
                <p className="text-xs text-gray-500">배당락일 기준 오름차순 · 지급일은 평균 간격 기준 추정값입니다</p>
              </div>
            </Card>
          )}

          {/* 종목별 배당금 비중 도넛 차트 */}
          {chartData.length > 0 && (
            <Card className="p-4 bg-slate-700 border-slate-600 shadow-lg">
              <h4 className="text-sm font-semibold text-gray-100 mb-1">종목별 배당금 비중</h4>
              <div className="relative h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={renderLabel}
                      labelLine={false}
                      strokeWidth={0}
                    >
                      {chartData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xs text-gray-400">배당</span>
                  <span className="text-sm font-bold text-gray-100">{chartData.length}개</span>
                </div>
              </div>
              <div className="space-y-2.5 mt-4">
                {dividendStocks.map((d, index) => {
                  const converted = convert(d.annualDividend, d.currency === "KRW" ? "KRW" : "USD");
                  const pct = totalAnnual > 0 ? (converted / totalAnnual) * 100 : 0;
                  return (
                    <div key={d.stockCd}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                          <span className="text-xs text-gray-300">{d.stockCd}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-green-400">
                            {fmtAmount(d.annualDividend, d.currency === "KRW" ? "KRW" : "USD")}/년
                          </span>
                          <span className="text-xs text-gray-400 w-10 text-right">{pct.toFixed(1)}%</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-600 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, backgroundColor: COLORS[index % COLORS.length] }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* 종목별 상세 */}
          {dividendStocks.length > 0 && (
            <Card className="bg-slate-700 border-slate-600 overflow-hidden">
              <div className="p-3 border-b border-slate-600">
                <h4 className="text-sm font-semibold text-gray-100">종목별 연간 배당금</h4>
              </div>
              <div className="divide-y divide-slate-600">
                {dividendStocks.map((d) => {
                  const isOpen = expanded === d.stockCd;
                  return (
                    <div key={d.stockCd}>
                      <button
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-600/50 transition-colors"
                        onClick={() => setExpanded(isOpen ? null : d.stockCd)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-green-600/30 flex items-center justify-center">
                            <span className="text-xs font-bold text-green-400">{d.stockCd.slice(0, 2)}</span>
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-semibold text-gray-100">{d.stockCd}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <p className="text-xs text-gray-400">{d.holdQty.toLocaleString()}주</p>
                              {d.nextExDate && (
                                <>
                                  <span className="text-gray-600">·</span>
                                  <div className="flex items-center gap-1">
                                    <CalendarDays className="w-3 h-3 text-gray-500" />
                                    <span className="text-xs text-gray-400">락 {fmtDate(d.nextExDate)}</span>
                                    <DDayBadge dateStr={d.nextExDate} />
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <p className="text-sm font-bold text-green-400">
                              {fmtAmount(d.annualDividend, d.currency === "KRW" ? "KRW" : "USD")}
                            </p>
                            <p className="text-xs text-gray-400">/년</p>
                          </div>
                          <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-90" : ""}`} />
                        </div>
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-3 bg-slate-800/50">
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="bg-slate-700 rounded-lg p-2">
                              <p className="text-gray-400">보유수량</p>
                              <p className="text-gray-100 font-semibold mt-0.5">{d.holdQty.toLocaleString()} 주</p>
                            </div>
                            <div className="bg-slate-700 rounded-lg p-2">
                              <p className="text-gray-400">주당 연간 배당금</p>
                              <p className="text-gray-100 font-semibold mt-0.5">${d.annualDividendPerShare.toFixed(4)}</p>
                            </div>
                            <div className="bg-slate-700 rounded-lg p-2">
                              <p className="text-gray-400">월간 예상</p>
                              <p className="text-green-400 font-semibold mt-0.5">
                                {fmtAmount(d.annualDividend / 12, d.currency === "KRW" ? "KRW" : "USD")}
                              </p>
                            </div>
                            <div className="bg-slate-700 rounded-lg p-2">
                              <p className="text-gray-400">분기 예상</p>
                              <p className="text-green-400 font-semibold mt-0.5">
                                {fmtAmount(d.quarterlyDividend, d.currency === "KRW" ? "KRW" : "USD")}
                              </p>
                            </div>
                          </div>
                          {(d.nextExDate || d.nextPaymentDate) && (
                            <div className="mt-2 grid grid-cols-2 gap-2">
                              {d.nextExDate && (
                                <div className="bg-slate-700 rounded-lg p-2">
                                  <div className="flex items-center gap-1 mb-1">
                                    <CalendarDays className="w-3.5 h-3.5 text-blue-400" />
                                    <span className="text-xs text-gray-400">다음 배당락일 (추정)</span>
                                  </div>
                                  <p className="text-sm font-semibold text-gray-100">{fmtDate(d.nextExDate)}</p>
                                  <div className="mt-1"><DDayBadge dateStr={d.nextExDate} /></div>
                                </div>
                              )}
                              {d.nextPaymentDate && (
                                <div className="bg-slate-700 rounded-lg p-2">
                                  <div className="flex items-center gap-1 mb-1">
                                    <Banknote className="w-3.5 h-3.5 text-green-400" />
                                    <span className="text-xs text-gray-400">다음 지급일 (추정)</span>
                                  </div>
                                  <p className="text-sm font-semibold text-gray-100">{fmtDate(d.nextPaymentDate)}</p>
                                  <div className="mt-1"><DDayBadge dateStr={d.nextPaymentDate} /></div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {noDividendStocks.length > 0 && (
            <Card className="p-3 bg-slate-700 border-slate-600">
              <p className="text-xs text-gray-400 mb-2">배당 데이터 없는 종목</p>
              <div className="flex flex-wrap gap-2">
                {noDividendStocks.map((d) => (
                  <span key={d.stockCd} className="text-xs px-2 py-1 bg-slate-600 text-gray-300 rounded-full">
                    {d.stockCd}
                  </span>
                ))}
              </div>
            </Card>
          )}

          <Card className="p-3 bg-slate-700/50 border-slate-600">
            <div className="flex items-start gap-2">
              <TrendingUp className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-gray-400 leading-relaxed">
                최근 4분기 배당락일 데이터 기준 연간 예상치입니다.
                실제 배당 주기나 금액은 종목 정책에 따라 달라질 수 있습니다.
              </p>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
