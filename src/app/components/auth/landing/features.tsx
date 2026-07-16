import { Newspaper, Brain, Clover, MessageCircle, LineChart, Target } from "lucide-react";
import type { FeatureItem } from "./FeatureShowcase";
import {
  BriefingMockup,
  MbtiMockup,
  FortuneMockup,
  InsightMockup,
  PortfolioMockup,
  RecommendMockup,
} from "./FeatureMockups";

export const FEATURES: FeatureItem[] = [
  {
    icon: <Newspaper className="h-6 w-6 text-blue-400" />,
    iconBg: "bg-blue-900/50",
    title: "AI 시황 브리핑",
    description:
      "매일 새벽 AI가 미국 시장 핵심 뉴스를 분석해 그날의 시장 분위기를 감성 컬러로 한눈에 전달합니다.",
    mockup: <BriefingMockup />,
  },
  {
    icon: <Brain className="h-6 w-6 text-purple-400" />,
    iconBg: "bg-purple-900/50",
    title: "투자 MBTI",
    description:
      "성격 20문항 + 투자 20문항으로 나의 투자 유형을 16가지 유형 중에서 찾아드립니다.",
    mockup: <MbtiMockup />,
  },
  {
    icon: <Clover className="h-6 w-6 text-emerald-400" />,
    iconBg: "bg-emerald-900/50",
    title: "종목운세",
    description:
      "매일 바뀌는 오늘의 행운지수와 함께 관심 종목의 운세를 가볍게 확인해보세요.",
    mockup: <FortuneMockup />,
  },
  {
    icon: <MessageCircle className="h-6 w-6 text-sky-400" />,
    iconBg: "bg-sky-900/50",
    title: "AI 투자 인사이트",
    description:
      "내 포트폴리오를 분석해 배당, 매매 습관 등 맞춤 인사이트를 대화하듯 전달합니다.",
    mockup: <InsightMockup />,
  },
  {
    icon: <LineChart className="h-6 w-6 text-green-400" />,
    iconBg: "bg-green-900/50",
    title: "포트폴리오 관리",
    description:
      "보유 종목의 수익률을 한눈에 파악하고 최적의 포트폴리오를 구성하세요.",
    mockup: <PortfolioMockup />,
  },
  {
    icon: <Target className="h-6 w-6 text-amber-400" />,
    iconBg: "bg-amber-900/50",
    title: "맞춤 종목 추천",
    description:
      "나의 투자 성향에 맞는 S&P 500 우량주를 AI가 선별해드립니다.",
    mockup: <RecommendMockup />,
  },
];
