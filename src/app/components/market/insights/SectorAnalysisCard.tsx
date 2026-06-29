import { useEffect, useState } from "react";
import { Target } from "lucide-react";
import { Card } from "@/app/components/ui/layout/card";
import { getPreferredSectors } from "@/app/services/stockAdvisorService";
import type { PreferredSectorItem } from "@/app/types";

const SECTOR_COLORS = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#f97316",
  "#84cc16",
  "#ec4899",
  "#14b8a6",
];

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
    <Card className="p-0 gap-0 bg-slate-700 border-slate-600 overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-teal-400/90 to-cyan-400/60" />
      <div className="p-4">
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2 text-gray-100">
          <Target className="w-4 h-4 text-teal-400" />
          선호 섹터 분석
        </h3>

        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <div className="h-3.5 bg-slate-600 rounded mb-1.5" style={{ width: `${60 + i * 10}%` }} />
                <div className="h-2 bg-slate-600/70 rounded-full" />
              </div>
            ))}
          </div>
        ) : sectors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 gap-2 text-center">
            <Target className="w-8 h-8 text-slate-500" />
            <p className="text-sm text-gray-400">선호 섹터 데이터 없음</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sectors.map((item, idx) => (
              <div key={item.sector}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-200 font-medium">
                    {item.sectorKo}
                  </span>
                  <span className="text-xs font-semibold text-gray-100 tabular-nums">
                    {item.sectorPct.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-slate-600/60 rounded-full h-2">
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
