import { useEffect, useState } from "react";
import { Target } from "lucide-react";
import { Card } from "@/app/components/ui/layout/card";
import { getPreferredSectors } from "@/app/services/stockAdvisorService";
import type { PreferredSectorItem } from "@/app/types";
import { CHART_COLORS_10 } from "@/app/theme/tokens";

const SECTOR_COLORS = CHART_COLORS_10;

export function SectorAnalysisCard() {
  const [sectors, setSectors] = useState<PreferredSectorItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPreferredSectors()
      .then((res) => {
        const data = res.data.data;
        setSectors(Array.isArray(data) ? data : []);
      })
      .catch(() => setSectors([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card className="p-0 gap-0 bg-card border-border overflow-hidden">
      <div className="h-1 bg-accent" />
      <div className="p-4">
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2 text-foreground">
          <Target className="w-4 h-4 text-primary" />
          선호 섹터 분석
        </h3>

        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <div className="h-3.5 bg-muted rounded mb-1.5" style={{ width: `${60 + i * 10}%` }} />
                <div className="h-2 bg-muted rounded-full" />
              </div>
            ))}
          </div>
        ) : sectors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 gap-2 text-center">
            <Target className="w-8 h-8 text-faint-foreground" />
            <p className="text-sm text-muted-foreground">선호 섹터 데이터 없음</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sectors.map((item, idx) => (
              <div key={item.sector}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-foreground font-medium">
                    {item.sectorKo}
                  </span>
                  <span className="text-xs font-semibold text-foreground tabular-nums">
                    {item.sectorPct.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(item.sectorPct, 100)}%`,
                      backgroundColor: SECTOR_COLORS[idx % SECTOR_COLORS.length],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
