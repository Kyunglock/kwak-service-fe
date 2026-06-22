import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, DollarSign, Newspaper } from "lucide-react";
import { Card } from "@/app/components/ui/layout/card";
import { Badge } from "@/app/components/ui/feedback/badge";
import type { NewsItem } from "@/app/types";

export function MarketNews() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 모의 데이터 생성 (실제로는 ChatGPT API 호출)
  useEffect(() => {
    setTimeout(() => {
      const mockNews: NewsItem[] = [
        {
          id: "1",
          title: "테슬라 실적 발표로 전기차 업종 급등",
          summary: "테슬라가 예상을 뛰어넘는 분기 실적을 발표하며 전기차 관련 종목들이 일제히 상승세를 보였습니다. 리비안, 루시드 모터스도 동반 상승.",
          sector: "전기차/에너지",
          impact: "positive",
          timestamp: "2026-01-11 07:30",
        },
        {
          id: "2",
          title: "CPI 발표로 기술주 하락",
          summary: "예상보다 높은 소비자물가지수(CPI) 발표로 연준의 금리 인하 기대감이 약화되며 기술주가 전반적으로 하락했습니다. 나스닥 지수 1.2% 하락.",
          sector: "기술주",
          impact: "negative",
          timestamp: "2026-01-11 06:45",
        },
        {
          id: "3",
          title: "헬스케어 섹터 안정적 상승",
          summary: "경기 방어주인 헬스케어 섹터가 시장 불확실성 속에서 강세를 보였습니다. 존슨앤존슨, 화이자 등 배당주 중심으로 자금 유입.",
          sector: "헬스케어",
          impact: "positive",
          timestamp: "2026-01-11 05:20",
        },
        {
          id: "4",
          title: "인플레이션 완화 조짐 포착",
          summary: "최근 3개월간 에너지 가격 하락과 공급망 정상화로 인플레이션 압력이 완화되고 있다는 신호가 나타났습니다. 투자자들은 이를 매수 기회로 해석.",
          sector: "매크로",
          impact: "positive",
          timestamp: "2026-01-11 04:15",
        },
      ];
      setNews(mockNews);
      setLoading(false);
    }, 800);
  }, []);

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case "positive":
        return <TrendingUp className="w-5 h-5 text-green-400" />;
      case "negative":
        return <TrendingDown className="w-5 h-5 text-red-400" />;
      default:
        return <DollarSign className="w-5 h-5 text-gray-400" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "positive":
        return "bg-green-950 text-green-400 border-green-800";
      case "negative":
        return "bg-red-950 text-red-400 border-red-800";
      default:
        return "bg-slate-700 text-gray-300 border-slate-600";
    }
  };

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Newspaper className="w-6 h-6 text-blue-400" />
          <h2 className="text-xl font-semibold text-gray-100">미국 시장 동향</h2>
        </div>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4 animate-pulse bg-slate-700 border-slate-600">
            <div className="h-4 bg-slate-600 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-slate-600 rounded w-full mb-1"></div>
            <div className="h-3 bg-slate-600 rounded w-5/6"></div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Newspaper className="w-6 h-6 text-blue-400" />
          <h2 className="text-xl font-semibold text-gray-100">미국 시장 동향</h2>
        </div>
        <Badge variant="outline" className="text-xs border-slate-600 text-gray-300">
          한국 시간 새벽 업데이트
        </Badge>
      </div>

      <div className="bg-blue-950 border border-blue-800 rounded-lg p-3 text-sm text-blue-300">
        <p className="font-medium mb-1">💡 AI가 분석한 오늘의 시장</p>
        <p className="text-xs">
          미국 장 마감 후 주요 뉴스와 업종별 변동을 자동으로 요약했습니다.
        </p>
      </div>

      <div className="space-y-3">
        {news.map((item) => (
          <Card
            key={item.id}
            className={`p-4 border-l-4 bg-slate-700 border-slate-600 ${
              item.impact === "positive"
                ? "border-l-green-500"
                : item.impact === "negative"
                ? "border-l-red-500"
                : "border-l-gray-500"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-1">{getImpactIcon(item.impact)}</div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-sm leading-tight text-gray-100">
                    {item.title}
                  </h3>
                </div>
                <p className="text-xs text-gray-300 mb-3 leading-relaxed">
                  {item.summary}
                </p>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className={`text-xs ${getImpactColor(item.impact)}`}>
                    {item.sector}
                  </Badge>
                  <span className="text-xs text-gray-400">{item.timestamp}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}