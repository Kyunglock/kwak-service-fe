import { useEffect, useState } from "react";
import { Target } from "lucide-react";
import { Card } from "@/app/components/ui/layout/card";
import { Badge } from "@/app/components/ui/feedback/badge";
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
    <Card className="p-4 bg-slate-700 border-slate-600">
      <h3 className="font-semibold text-sm flex items-center gap-2 text-gray-100">
        <Target className="w-4 h-4 text-blue-400" />
        사용자 전체 선호 섹터 분석
      </h3>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i}>
              <div className="h-4 bg-slate-600 rounded mb-1.5 w-3/4" />
              <div className="h-2.5 bg-slate-600 rounded-full" />
            </div>
          ))}
        </div>
      ) : sectors.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-4 gap-2 text-center">
          <Target className="w-10 h-10 text-slate-500" />
          <p className="text-sm text-gray-300 font-medium">선호 섹터 없음</p>
          <p className="text-xs text-gray-400">
            보유 종목이 없거나 데이터를 불러올 수 없습니다.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sectors.map((item, idx) => (
            <div key={item.sector}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-200 font-medium">
                  {item.sectorKo}
                </span>
                <span className="text-xs font-semibold text-gray-100">
                  {item.sectorPct.toFixed(2)}%
                </span>
              </div>
              <div className="w-full bg-slate-600 rounded-full h-2.5">
                <div
                  className="h-2.5 rounded-full transition-all"
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
    </Card>
  );
}
