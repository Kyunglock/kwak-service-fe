import { Crown } from "lucide-react";
import { Card } from "@/app/components/ui/layout/card";
import type { PortfolioItemResponse, GuruPortfolioResponse } from "@/app/types";

interface LegendInvestor {
  id: string;
  nameKo: string;
  name: string;
  style: string;
  philosophy: string;
  quote: string;
  holdings: { symbol: string; weight: number }[];
}

interface LegendMatch extends LegendInvestor {
  score: number;
  matchedHoldings: string[];
}

function buildLegendInvestors(
  guruPortfolios: GuruPortfolioResponse[],
): LegendInvestor[] {
  if (guruPortfolios.length === 0) return [];

  const investorMap = new Map<
    string,
    LegendInvestor & { holdings: { symbol: string; weight: number }[] }
  >();

  guruPortfolios.forEach((p) => {
    if (!p.ticker) return;
    if (!investorMap.has(p.investorNm)) {
      investorMap.set(p.investorNm, {
        id: p.investorNm.toLowerCase().replace(/\s+/g, "_"),
        nameKo: p.investorKoNm ?? p.investorNm,
        name: p.investorNm,
        style: p.investorNickname ?? "",
        philosophy: p.investPhilosophy ?? "",
        quote: p.famousQuote ?? "",
        holdings: [],
      });
    }
    investorMap.get(p.investorNm)!.holdings.push({
      symbol: p.ticker,
      weight: p.portfolioPct ?? 0,
    });
  });

  return Array.from(investorMap.values());
}

function calcLegendMatch(
  portfolioItems: PortfolioItemResponse[],
  guruPortfolios: GuruPortfolioResponse[],
): LegendMatch[] {
  if (portfolioItems.length === 0) return [];
  const investors = buildLegendInvestors(guruPortfolios);
  const userSymbols = new Set(
    portfolioItems.map((p) => p.stockCd.toUpperCase()),
  );

  return investors
    .map((inv) => {
      const totalWeight = inv.holdings.reduce((s, h) => s + h.weight, 0);
      let matchedWeight = 0;
      const matchedSet = new Set<string>();

      inv.holdings.forEach((h) => {
        if (userSymbols.has(h.symbol.toUpperCase())) {
          matchedWeight += h.weight;
          matchedSet.add(h.symbol.toUpperCase());
        }
      });

      const matchedHoldings = Array.from(matchedSet);

      return {
        ...inv,
        score: Math.round((matchedWeight / totalWeight) * 100),
        matchedHoldings,
      };
    })
    .filter((inv) => inv.score > 0)
    .sort((a, b) => b.score - a.score);
}

interface Props {
  portfolioItems: PortfolioItemResponse[];
  guruPortfolios: GuruPortfolioResponse[];
}

export function GuruMatchCard({ portfolioItems, guruPortfolios }: Props) {
  const legendMatches = calcLegendMatch(portfolioItems, guruPortfolios);
  const hasPortfolio = portfolioItems.length > 0;

  return (
    <Card className="p-0 gap-0 bg-card border-border overflow-hidden">
      <div className="h-1 bg-accent" />
      <div className="p-4">
      <h3 className="font-semibold text-sm mb-1 flex items-center gap-2 text-foreground">
        <Crown className="w-4 h-4 text-primary" />
        투자 대가 포트폴리오 일치도
      </h3>

      <p className="text-xs text-faint-foreground mb-3">
        내 포트폴리오와 가장 비슷한 투자 대가를 분석합니다
      </p>

      {!hasPortfolio ? (
        <div className="rounded-xl bg-muted border border-border p-5 text-center">
          <Crown className="w-8 h-8 text-faint-foreground mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">
            포트폴리오에 종목을 추가하면
            <br />
            투자 대가와의 일치도를 확인할 수 있습니다
          </p>
        </div>
      ) : legendMatches.length === 0 ? (
        <div className="rounded-xl bg-muted border border-border p-5 text-center">
          <Crown className="w-8 h-8 text-faint-foreground mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">
            보유 종목과 일치하는 투자 대가가 없습니다
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {legendMatches.slice(0, 5).map((inv, idx) => {
            const isTop = idx === 0;
            return (
              <div
                key={inv.id}
                className={`rounded-xl p-3 border ${isTop ? "bg-accent border-primary/40" : "bg-muted border-border"}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {isTop && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-accent text-primary border border-primary/40">
                        최고 일치
                      </span>
                    )}
                    <span
                      className={`text-sm font-bold ${isTop ? "text-foreground" : "text-foreground"}`}
                    >
                      {inv.nameKo}
                    </span>
                    <span className="text-[10px] text-faint-foreground">
                      {inv.style}
                    </span>
                  </div>
                  <span
                    className={`text-sm font-bold ${inv.score >= 30 ? "text-primary" : "text-muted-foreground"}`}
                  >
                    {inv.score}%
                  </span>
                </div>

                <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${isTop ? "bg-primary" : "bg-muted"}`}
                    style={{ width: `${inv.score}%` }}
                  />
                </div>

                {inv.matchedHoldings.length > 0 ? (
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-[10px] text-faint-foreground">
                      공통 보유:
                    </span>
                    {inv.matchedHoldings.map((sym) => (
                      <span
                        key={sym}
                        className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${isTop ? "bg-accent text-primary" : "bg-muted text-muted-foreground"}`}
                      >
                        {sym}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-faint-foreground">
                    공통 보유 종목 없음
                  </p>
                )}

                {isTop && (inv.philosophy || inv.quote) && (
                  <div className="mt-3 space-y-2 border-t border-primary/40 pt-3">
                    {inv.philosophy && (
                      <div>
                        <p className="text-[10px] font-semibold text-primary mb-0.5">
                          투자 철학
                        </p>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          {inv.philosophy}
                        </p>
                      </div>
                    )}
                    {inv.quote && (
                      <div className="bg-accent rounded-lg px-3 py-2">
                        <p className="text-[11px] text-primary leading-relaxed italic">
                          "{inv.quote}"
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      </div>
    </Card>
  );
}
