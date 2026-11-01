import { useState, useEffect } from "react";
import {
  Crown,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  BookOpen,
  Quote,
  Loader2,
} from "lucide-react";
import {
  getGuruPortfolios,
  getPrevQuarter,
  type GuruPortfolioResponse,
} from "@/app/services/guruService";
import type { PageResponse } from "@/app/types";

interface InvestorGroup {
  investorNm: string;
  investorKoNm: string;
  investorNickname: string;
  investPhilosophy: string;
  famousQuote: string;
  holdings: GuruPortfolioResponse[];
}

function groupByInvestor(items: GuruPortfolioResponse[]): InvestorGroup[] {
  const map = new Map<string, InvestorGroup>();
  for (const item of items) {
    if (!map.has(item.investorNm)) {
      map.set(item.investorNm, {
        investorNm: item.investorNm,
        investorKoNm: item.investorKoNm ?? item.investorNm,
        investorNickname: item.investorNickname ?? "",
        investPhilosophy: item.investPhilosophy ?? "",
        famousQuote: item.famousQuote ?? "",
        holdings: [],
      });
    }
    map.get(item.investorNm)!.holdings.push(item);
  }
  for (const g of map.values()) {
    g.holdings.sort((a, b) => (a.rankNo ?? 99) - (b.rankNo ?? 99));
  }
  return Array.from(map.values());
}

function formatChange(changePct: number | null | undefined): {
  text: string;
  cls: string;
} {
  if (changePct == null) return { text: "유지", cls: "text-faint-foreground" };
  if (changePct === 0) return { text: "유지", cls: "text-faint-foreground" };
  if (changePct > 0) return { text: `+${changePct}%`, cls: "text-up" };
  return { text: `${changePct}%`, cls: "text-down" };
}

function reportLabel(holdings: GuruPortfolioResponse[]): string {
  for (const h of holdings) {
    if (h.activityYear && h.activityQtr) {
      return `${h.activityYear} Q${h.activityQtr} (13F 기준)`;
    }
  }
  return "";
}

export function GuruPortfolio() {
  const [investors, setInvestors] = useState<InvestorGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getGuruPortfolios(getPrevQuarter())
      .then((res) => {
        const data = res.data?.data;
        const items: GuruPortfolioResponse[] = Array.isArray(data)
          ? data
          : ((data as PageResponse<GuruPortfolioResponse>)?.content ?? []);

        const grouped = groupByInvestor(items);
        setInvestors(grouped);
        if (grouped.length > 0) setExpandedId(grouped[0].investorNm);
      })
      .finally(() => setLoading(false));
  }, []);

  const toggle = (key: string) =>
    setExpandedId((prev) => (prev === key ? null : key));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
        <Loader2 className="w-7 h-7 animate-spin text-primary" />
        <p className="text-sm">데이터를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Crown className="w-6 h-6 text-primary" />
          투자 대가 포트폴리오
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          전설적인 투자자들의 실제 보유 종목
        </p>
      </div>

      {/* 안내 문구 */}
      <div className="rounded-xl border border-border bg-card px-4 py-3 text-xs text-muted-foreground leading-relaxed">
        미국 SEC에 분기별 제출되는{" "}
        <span className="text-foreground font-medium">13F 공시</span>를 기반으로
        구성된 데이터입니다. 실제 포트폴리오와 차이가 있을 수 있습니다.
      </div>

      {/* 투자자 카드 목록 */}
      <div className="space-y-3">
        {investors.length === 0 ? (
          <p className="text-center text-sm text-faint-foreground py-10">
            데이터가 없습니다.
          </p>
        ) : (
          investors.map((inv) => {
            const isOpen = expandedId === inv.investorNm;
            const top = inv.holdings[0];
            const label = reportLabel(inv.holdings);

            return (
              <div
                key={inv.investorNm}
                className="rounded-2xl overflow-hidden border border-border bg-card"
              >
                {/* 카드 헤더 */}
                <button
                  className="w-full px-4 pt-4 pb-3 text-left"
                  onClick={() => toggle(inv.investorNm)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-foreground text-base">
                          {inv.investorKoNm}
                        </span>
                        {inv.investorNickname && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-accent text-primary border border-primary/40">
                            {inv.investorNickname}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {inv.investorNm}
                      </p>

                      {top && (
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-muted-foreground">
                            1위{" "}
                            <span className="text-primary font-medium">
                              {top.ticker}
                            </span>{" "}
                            {top.portfolioPct}%
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="mt-1 flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center bg-muted">
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </button>

                {isOpen && (
                  <>
                    <div className="h-px bg-muted" />

                    {/* 투자 철학 & 명언 */}
                    <div className="px-4 py-3 space-y-3">
                      {inv.investPhilosophy && (
                        <div className="rounded-xl bg-accent border border-primary/40 p-3">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-primary" />
                            <span className="text-xs font-medium text-primary">
                              투자 철학
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {inv.investPhilosophy}
                          </p>
                        </div>
                      )}

                      {inv.famousQuote && (
                        <div className="rounded-xl bg-muted border border-border p-3">
                          <div className="flex items-start gap-2">
                            <Quote className="w-3.5 h-3.5 text-faint-foreground flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-muted-foreground leading-relaxed italic">
                              {inv.famousQuote}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="h-px bg-muted" />

                    {/* 보유 종목 */}
                    <div className="px-4 pt-3 pb-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1.5">
                          <TrendingUp className="w-3.5 h-3.5 text-primary" />
                          <span className="text-xs font-medium text-muted-foreground">
                            주요 보유 종목
                          </span>
                        </div>
                        {label && (
                          <span className="text-[10px] text-faint-foreground">
                            {label}
                          </span>
                        )}
                      </div>

                      <div className="space-y-2.5">
                        {inv.holdings.map((h, i) => {
                          const { text: changeText, cls: changeCls } =
                            formatChange(h.changePct);
                          return (
                            <div key={`${h.ticker}-${i}`}>
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="text-[10px] text-faint-foreground w-3 flex-shrink-0">
                                    {h.rankNo ?? i + 1}
                                  </span>
                                  <span className="text-xs font-bold text-foreground">
                                    {h.ticker}
                                  </span>
                                  <span className="text-[10px] text-muted-foreground truncate">
                                    {h.issuerNm}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <span
                                    className={`text-[10px] font-medium ${changeCls}`}
                                  >
                                    {changeText}
                                  </span>
                                  <span className="text-xs font-semibold text-foreground w-10 text-right">
                                    {h.portfolioPct}%
                                  </span>
                                </div>
                              </div>
                              <div className="h-1 rounded-full bg-muted overflow-hidden ml-5">
                                <div
                                  className="h-full rounded-full bg-primary/50 transition-all duration-700"
                                  style={{
                                    width: `${((h.portfolioPct ?? 0) / (inv.holdings[0]?.portfolioPct || 1)) * 100}%`,
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 하단 안내 */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <p className="text-xs text-faint-foreground leading-relaxed text-center">
          대가들의 포트폴리오를 참고하되, 본인의 투자 목적과 리스크 허용 범위에
          맞게 조정하세요.
        </p>
      </div>
    </div>
  );
}
