import type { FeatureItem } from "./FeatureShowcase";
import {
  PortfolioMockup,
  BriefingMockup,
  InsightMockup,
  MbtiMockup,
  FortuneMockup,
  GuruMockup,
} from "./FeatureMockups";

// 실제 앱 메뉴(종목·투자 놀이터·인사이트·투자 대가) 기준으로 구성.
// tag = 해당 기능이 실제로 있는 메뉴, tagClass = 그 메뉴의 아이덴티티 컬러.
export const FEATURES: FeatureItem[] = [
  {
    tag: "종목",
    tagClass: "border-indigo-700/60 bg-indigo-950/60 text-indigo-300",
    title: "포트폴리오 관리",
    description:
      "보유 종목의 수익률과 실시간 시세를 한눈에. 매매 기록부터 배당 현황까지 함께 관리합니다.",
    mockup: <PortfolioMockup />,
    glow: "bg-indigo-600/20",
  },
  {
    tag: "시황 브리핑",
    tagClass: "border-green-800 bg-green-950 text-green-400",
    title: "오늘의 미국 증시, AI 요약으로",
    description:
      "매일 새벽 AI가 미국 증시 핵심 뉴스를 요약합니다. 호재·악재·보합을 컬러로 구분해 접속하자마자 보여드려요.",
    mockup: <BriefingMockup />,
    glow: "bg-emerald-600/20",
  },
  {
    tag: "인사이트",
    tagClass: "border-teal-700/60 bg-teal-950/60 text-teal-300",
    title: "AI 투자 인사이트",
    description:
      "투자자 감성 지수, 섹터 분석, 배당 인사이트까지 — 내 포트폴리오를 AI가 여러 각도에서 분석합니다.",
    mockup: <InsightMockup />,
    glow: "bg-teal-600/20",
  },
  {
    tag: "투자 놀이터",
    tagClass: "border-pink-700/60 bg-pink-950/60 text-pink-300",
    title: "투자 MBTI 알아보기",
    description:
      "44문항 통합 설문으로 성격 MBTI와 투자 성향을 한 번에. 16가지 유형 중 나의 투자 스타일을 찾아보세요.",
    mockup: <MbtiMockup />,
    glow: "bg-pink-600/20",
  },
  {
    tag: "투자 놀이터",
    tagClass: "border-amber-700/60 bg-amber-950/60 text-amber-300",
    title: "오늘의 종목운세",
    description:
      "궁금한 종목의 오늘 기운을 점쳐보세요. 별자리, 숫자 궁합, 로고 색상까지 총동원한 재미용 운세입니다.",
    mockup: <FortuneMockup />,
    glow: "bg-amber-600/20",
  },
  {
    tag: "투자 대가",
    tagClass: "border-orange-700/60 bg-orange-950/60 text-orange-300",
    title: "내 포트폴리오와 맞는 투자 대가는?",
    description:
      "워런 버핏, 조지 소로스 등 전설적 투자자들의 포트폴리오와 내 보유 종목을 비교해보세요.",
    mockup: <GuruMockup />,
    glow: "bg-purple-600/20",
  },
];
