import { useEffect, useState } from "react";
import { UserCircle } from "lucide-react";
import { Card } from "@/app/components/ui/layout/card";
import { Badge } from "@/app/components/ui/feedback/badge";
import { getRiskProfile } from "@/app/services/stockAdvisorService";
import type { RiskProfileItem, InsightResultResponse, ApiResponse } from "@/app/types";

interface Props {
  insightResult: InsightResultResponse | null;
}

export function MyProfileCard({ insightResult }: Props) {
  const [items, setItems]   = useState<RiskProfileItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRiskProfile()
      .then((res) => {
        const data = (res.data as ApiResponse<RiskProfileItem[]>).data;
        setItems(Array.isArray(data) ? data : []);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const lines = insightResult?.content?.split("\n") ?? [];
  const profileType = lines[0] ?? "";
  const profileDescription = lines.slice(1).join(" · ");

  return (
    <Card className="p-4 bg-card border-border">
      <h3 className="font-semibold text-sm mb-3 flex items-center gap-2 text-foreground">
        <UserCircle className="w-4 h-4 text-primary" />
        나의 투자 성향
        {!loading && (
          <Badge
            className={`ml-auto text-foreground text-[10px] ${
              items.length > 0 ? "bg-success/15 text-success" : "bg-muted"
            }`}
          >
            {items.length > 0 ? "설문 완료" : "설문 미완료"}
          </Badge>
        )}
      </h3>

      {/* 투자 성향 요약 */}
      {insightResult ? (
        <div className="flex items-center gap-3 p-3 bg-accent rounded-lg border border-primary/40">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <UserCircle className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <p className="font-bold text-sm text-primary">
              {profileType}
              <span className="ml-1.5 text-[10px] font-normal text-primary">AI 분석</span>
            </p>
            {profileDescription && (
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                {profileDescription}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg border border-border">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
            <UserCircle className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-xs text-muted-foreground">
            결과보기를 눌러 포트폴리오 분석을 실행하면
            <br />나의 투자 성향을 확인할 수 있습니다.
          </p>
        </div>
      )}

      {/* 설문 점수 바 */}
      {loading ? (
        <div className="space-y-2.5 mt-3 animate-pulse">
          <div className="h-4 bg-muted rounded w-full" />
          <div className="h-4 bg-muted rounded w-5/6" />
          <div className="h-4 bg-muted rounded w-4/6" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-4 gap-2 text-center">
          <UserCircle className="w-10 h-10 text-faint-foreground" />
          <p className="text-sm text-muted-foreground font-medium">나의 투자 성향 분석</p>
          <p className="text-xs text-muted-foreground">
            투자 성향 설문을 완료하면
            <br />
            나의 투자 프로필을 확인할 수 있습니다.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5 mt-3">
          {items.map((item) => (
            <div key={item.description}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-muted-foreground">{item.description}</span>
                <span className="text-xs font-semibold text-foreground">{item.score}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-primary transition-all"
                  style={{ width: `${item.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
