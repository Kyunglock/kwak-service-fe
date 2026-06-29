import { useState } from "react";
import { Fingerprint, RefreshCcw, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import { Card } from "@/app/components/ui/layout/card";
import { Button } from "@/app/components/ui/form/button";
import { requestInsightBuild } from "@/app/services/insightService";
import type { InsightResultResponse } from "@/app/types";

interface Props {
  insightResult: InsightResultResponse | null;
  onRetakeSurvey?: () => void;
  onBuildComplete?: (all: InsightResultResponse[]) => void;
}

const MBTI_THEME: Record<string, { bg: string; border: string; text: string; bar: string; glow: string }> = {
  GRL: { bg: "bg-emerald-900/40", border: "border-emerald-600/50", text: "text-emerald-300", bar: "bg-emerald-500", glow: "shadow-emerald-500/20" },
  GRT: { bg: "bg-red-900/40",     border: "border-red-600/50",     text: "text-red-300",     bar: "bg-red-500",     glow: "shadow-red-500/20"     },
  GSL: { bg: "bg-teal-900/40",    border: "border-teal-600/50",    text: "text-teal-300",    bar: "bg-teal-500",    glow: "shadow-teal-500/20"    },
  GST: { bg: "bg-blue-900/40",    border: "border-blue-600/50",    text: "text-blue-300",    bar: "bg-blue-500",    glow: "shadow-blue-500/20"    },
  VRL: { bg: "bg-purple-900/40",  border: "border-purple-600/50",  text: "text-purple-300",  bar: "bg-purple-500",  glow: "shadow-purple-500/20"  },
  VRT: { bg: "bg-orange-900/40",  border: "border-orange-600/50",  text: "text-orange-300",  bar: "bg-orange-500",  glow: "shadow-orange-500/20"  },
  VSL: { bg: "bg-indigo-900/40",  border: "border-indigo-600/50",  text: "text-indigo-300",  bar: "bg-indigo-500",  glow: "shadow-indigo-500/20"  },
  VST: { bg: "bg-slate-700/60",   border: "border-slate-500/50",   text: "text-slate-300",   bar: "bg-slate-400",   glow: "shadow-slate-400/20"  },
};

const MBTI_EMOJI: Record<string, string> = {
  GRL: "🚀", GRT: "⚡", GSL: "🌱", GST: "💼",
  VRL: "🔭", VRT: "🎲", VSL: "🛡️", VST: "🏦",
};

interface MbtiDetail {
  fullDescription: string;
  personality: string[];
  investmentStyle: string;
  strengths: string[];
  weaknesses: string[];
  marketCondition: string;
  portfolioExample: string;
  similarInvestor: string;
  tips: string[];
}

const MBTI_DETAIL: Record<string, MbtiDetail> = {
  GRL: {
    fullDescription:
      "GRL 유형은 '성장 선구자'입니다. 현재의 손실보다 미래의 가능성에 베팅하는 낙관적 투자자로, 시장이 흔들려도 10년 후를 바라보며 묵묵히 보유합니다. 남들이 고평가라며 외면하는 기업을 믿고 사는 것이 이 유형의 핵심 강점입니다. 단기 변동성에 흔들리지 않는 강한 신념이 장기 복리 수익으로 이어집니다.",
    personality: [
      "미래지향적·낙관적 — 5년, 10년 뒤 세상을 그리며 투자 결정",
      "고통 감내력 강함 — 50% 폭락에도 보유 포지션 유지 가능",
      "새로운 트렌드에 민감 — AI, 바이오, 우주항공 등 혁신 산업을 먼저 포착",
    ],
    investmentStyle:
      "나스닥 고성장주와 혁신 테마 ETF 중심. PER이 100배를 넘어도 연 매출 성장률 30% 이상이면 투자 대상. 목표 주가까지 분할 매수 후 장기 보유.",
    strengths: [
      "복리 효과 극대화 — 10년 이상 보유 시 지수 대비 초과 수익 가능",
      "혁신 기업 조기 발굴로 텐배거 기회 포착",
      "시장 변동성에 흔들리지 않아 잦은 매매 비용 절감",
      "성장 테마 집중으로 강세장 구간 수익률 폭발적 증가",
    ],
    weaknesses: [
      "고평가 버블 구간에서 물타기 반복해 손실 누적 위험",
      "포트폴리오 집중도 높아 급락 시 심리적 충격 과대",
      "현금 비중 부족으로 위기 시 기회 매수 여력 소진",
      "FOMO 심리로 고점 추격 매수 빈발",
    ],
    marketCondition:
      "저금리 유동성 장세, 기술 혁신 사이클 구간에서 폭발적 성과. 금리 인상기나 경기침체 초입에는 성장주 밸류에이션 압박으로 고전.",
    portfolioExample:
      "QQQ 35% / 성장주 테마 ETF 25% / 개별 성장주 30% / 현금 10%",
    similarInvestor:
      "캐시 우드(ARK Innovation) · 피터 린치(성장주 발굴 철학)",
    tips: [
      "성장주 비중이 70%를 넘으면 방어주 또는 채권 ETF로 쿠션 확보",
      "개별 종목은 최대 15% 이내로 집중 리스크 제한",
      "분기마다 매출·영업이익 성장률 재확인해 성장 스토리 유효성 점검",
      "고금리 환경 진입 시 포트폴리오 듀레이션 단축 고려",
    ],
  },
  GRT: {
    fullDescription:
      "GRT 유형은 '공격적 트레이더'입니다. 단기 가격 변동에서 기회를 찾고 빠른 의사결정으로 수익을 챙기는 행동파 투자자입니다. 실적 발표, 이벤트, 모멘텀 등 촉매가 있는 구간에서 강점을 발휘하며, 손절 원칙이 명확해 큰 손실을 방지합니다. 시장의 흐름을 읽는 감각이 뛰어나고 빠른 실행력이 경쟁 우위입니다.",
    personality: [
      "행동 지향적 — 분석보다 실행을 중시, 적절한 순간 즉각 진입",
      "감정 관리 능숙 — 손절을 '실패'가 아닌 '리스크 관리'로 인식",
      "정보 처리 속도 빠름 — 뉴스·공시·수급 데이터 실시간 모니터링",
    ],
    investmentStyle:
      "1~4주 보유의 스윙 트레이딩. 실적 서프라이즈, 섹터 모멘텀, 주가 패턴 돌파 구간 집중 공략. 매수 시 즉시 손절가 설정.",
    strengths: [
      "명확한 손절 원칙으로 대형 손실 방지",
      "시장 변동성이 높을수록 수익 기회 증가",
      "포트폴리오 회전율 관리로 자금 효율성 극대화",
      "실적·이벤트 기반 전략으로 방향성 있는 매매 가능",
    ],
    weaknesses: [
      "잦은 거래로 수수료·세금 비용 누적",
      "감정적 매매 시 원칙 이탈로 손실 연속 발생",
      "과도한 레버리지 사용 유혹에 취약",
      "단기 성과 집착으로 중장기 우량주 보유 기회 놓침",
    ],
    marketCondition:
      "변동성 높은 시장(VIX 20 이상)에서 강점 발휘. 실적 시즌(어닝 시즌), 금리 결정일, 지정학적 이벤트 구간이 주 무대.",
    portfolioExample:
      "모멘텀 개별주 60% / 섹터 ETF 20% / 현금 20% (진입 대기 자금)",
    similarInvestor:
      "조지 소로스(반사성 이론) · 폴 튜더 존스(추세추종)",
    tips: [
      "종목당 손절가는 매수가 기준 -7~10%로 미리 설정",
      "월 최대 손실 한도(전체 자산 5%)를 정해두고 한도 도달 시 거래 중단",
      "이익 실현 목표는 손절 폭의 최소 2배(2R) 이상으로 설정",
      "연속 3회 손절 시 전략 점검 기간 도입해 감정 리셋",
    ],
  },
  GSL: {
    fullDescription:
      "GSL 유형은 '안정 성장가'입니다. 우량 기업의 꾸준한 성장을 믿고 장기 적립식으로 자산을 쌓아가는 투자자입니다. 배당과 주가 상승 두 마리 토끼를 동시에 잡으며, 복리의 마법을 최대한 활용합니다. 급등주 유혹에 흔들리지 않고 검증된 기업에만 투자하는 신중함이 핵심 장점입니다.",
    personality: [
      "체계적·계획적 — 정기 적립 계획을 수립하고 시장 상황과 무관하게 실행",
      "인내심 강함 — 단기 주가 움직임에 무감각, 장기 내재가치에 집중",
      "안정 지향 — 급락장에서도 패닉 셀 없이 오히려 매수 기회로 인식",
    ],
    investmentStyle:
      "S&P500 우량 배당 성장주·ETF 월 정기 매수(DCA). 배당 재투자 자동화로 복리 가속. 포트폴리오 리밸런싱 연 1~2회.",
    strengths: [
      "달러 비용 평균화(DCA)로 고점 매수 리스크 분산",
      "배당 재투자 복리 효과로 10년 이상 시 지수 추종 대비 초과 수익",
      "낮은 회전율로 세금·수수료 비용 최소화",
      "우량주 집중으로 기업 파산 리스크 원천 차단",
    ],
    weaknesses: [
      "시장 급락 초입 대응 느려 단기 손실 누적",
      "너무 많은 종목 편입으로 포트폴리오 관리 복잡",
      "배당 성향 집착으로 높은 성장주 편입 늦어짐",
      "안전 편향으로 강세장 상승분 일부 미반영",
    ],
    marketCondition:
      "전반적 우상향 장세와 배당 지급 안정 구간에서 최고 성과. 10년 이상 장기 강세장에서 복리 효과 극대화.",
    portfolioExample:
      "VTI·SPY 40% / 배당 성장주 ETF(DGRO·VIG) 30% / 개별 우량주 20% / 채권 ETF 10%",
    similarInvestor:
      "워런 버핏(초기 스타일) · 존 보글(인덱스 장기 보유)",
    tips: [
      "배당 수익률보다 배당 성장률(5년 평균)을 우선 확인",
      "리밸런싱 시 세금 효율 고려해 연말 손실 종목 청산 병행",
      "ETF와 개별주 비율을 7:3으로 유지해 집중 리스크 제한",
      "금리 상승기에는 채권 비중 축소하고 고배당 리츠 비중 점검",
    ],
  },
  GST: {
    fullDescription:
      "GST 유형은 '신중한 단기투자자'입니다. 리스크를 철저히 통제하면서 단기 수익을 추구하는 계산적인 투자자입니다. 진입과 청산 시점을 사전에 정해두고 원칙을 지키는 것이 강점이며, 이벤트 기반 전략을 통해 낮은 리스크로 안정적인 수익을 쌓아갑니다.",
    personality: [
      "데이터 중심 — 감이 아닌 수치와 근거로 매매 결정",
      "원칙 준수 — 사전에 설정한 진입·청산 조건을 반드시 지킴",
      "보수적 포지션 관리 — 단일 종목 최대 비중을 낮게 유지",
    ],
    investmentStyle:
      "배당 기준일 전후 전략, 실적 발표 이벤트 드리븐, 섹터 ETF 단기 회전. 레버리지 없이 현물 위주 운용.",
    strengths: [
      "철저한 원칙 매매로 감정적 판단 배제",
      "보수적 포지션으로 급락 시 충격 최소화",
      "이벤트 기반 전략으로 방향성 있는 수익 창출",
      "낮은 변동성 환경에서도 꾸준한 수익 축적 가능",
    ],
    weaknesses: [
      "지나친 신중함으로 고수익 기회 놓침",
      "기회비용 높아 강세장에서 시장 대비 성과 하회",
      "이벤트 예측 실패 시 전략 전체가 흔들림",
      "낮은 포지션 비중으로 절대 수익 규모 제한",
    ],
    marketCondition:
      "횡보장 및 변동성 낮은 환경에서 상대적 강점. 배당 시즌, 실적 발표 집중 시기에 수익 기회 극대화.",
    portfolioExample:
      "배당주·우량주 50% / 단기 국채 ETF 25% / 현금 25%",
    similarInvestor:
      "제프리 건들락(리스크 대비 수익 중시) · 빌 밀러(이벤트 활용)",
    tips: [
      "이벤트 매매 전 기업 실적 예상치 vs 실제치 Gap 분석 필수",
      "배당 기준일 매매 시 배당락 폭 vs 단기 거래 비용 손익분기 계산",
      "현금 25% 이상 유지해 급락 시 바겐세일 대응 여력 확보",
      "반기마다 전략별 승률·수익비(R-multiple) 추적 기록",
    ],
  },
  VRL: {
    fullDescription:
      "VRL 유형은 '가치 탐험가'입니다. 시장이 외면한 저평가 기업 속에서 숨겨진 보석을 찾아내는 탐구형 투자자입니다. 군중과 다른 방향을 가더라도 스스로의 분석을 믿으며, 3~5년 이상의 긴 시간 동안 가치가 시세에 반영될 때까지 인내합니다. 바닥 근처에서 사서 적정 가치 수준에서 파는 것이 핵심 전략입니다.",
    personality: [
      "독립적 사고 — 군중 심리와 반대 방향에서도 자신의 분석을 신뢰",
      "꼼꼼한 분석 — 재무제표, 사업 모델, 경쟁 우위를 깊이 파고듦",
      "인내심 탁월 — '싸게 사서 제 값 받을 때까지' 기다리는 뚝심",
    ],
    investmentStyle:
      "PER 10 이하·PBR 1 이하 저평가 기업 발굴 후 3~5년 장기 보유. 분기 실적과 내재가치 변화를 정기 점검하며 추가 매수 또는 청산 결정.",
    strengths: [
      "안전마진 확보로 하락 리스크 구조적 제한",
      "장기 보유 시 시장 복귀 이후 대폭 초과 수익 가능",
      "저평가 구간 매수로 하방 경직성 확보",
      "군중이 외면할 때 진입해 경쟁 없는 좋은 가격 확보",
    ],
    weaknesses: [
      "가치 함정(Value Trap) — 싼 데는 이유가 있는 기업에 장기 매몰",
      "회복 시점 불확실성 — 저평가 해소에 예상보다 오랜 시간 소요",
      "성장주 랠리 구간에서 시장 대비 성과 크게 뒤처짐",
      "정보 비대칭으로 내부 문제 조기 감지 어려움",
    ],
    marketCondition:
      "성장주 버블 붕괴 후 가치주 리밸런싱 구간, 금리 상승 환경에서 두드러진 성과. 경기 회복 초입에서 선행 매수 효과 극대화.",
    portfolioExample:
      "가치주 ETF(VTV·IVE) 40% / 개별 저평가주 35% / 현금 15% / 배당주 10%",
    similarInvestor:
      "워런 버핏 · 벤저민 그레이엄(가치투자 창시자) · 세스 클라만",
    tips: [
      "저PER·저PBR 외에 ROE 10% 이상, 부채비율 100% 이하 필터 추가",
      "'왜 싼가'를 반드시 규명 — 일시적 악재 vs 구조적 쇠퇴 구분",
      "초기 매수 후 추가 하락 시 분할 매수로 평단 관리 (최대 3회)",
      "목표 주가 도달 시 감정 없이 청산 — 욕심으로 장기 보유하다 기회 소실 방지",
    ],
  },
  VRT: {
    fullDescription:
      "VRT 유형은 '역발상 투자자'입니다. 시장의 공포가 극에 달할 때 오히려 용기를 내어 매수하는 대담한 투자자입니다. 단기적으로 과매도된 우량주를 싸게 사서 단기 반등을 포착하는 것이 주 전략이며, 위기 속에서 기회를 보는 냉철한 시각이 핵심 역량입니다.",
    personality: [
      "군중 심리 역이용 — 모두가 팔 때 사고, 모두가 살 때 조심하는 역발상 기질",
      "위기 내성 강함 — 하락 뉴스에도 패닉 없이 펀더멘털 중심으로 판단",
      "단기 반등 포착 — 기술적 과매도 신호와 심리 지표 활용에 능숙",
    ],
    investmentStyle:
      "52주 신저가·공포 지수(VIX) 급등 구간 역매수. RSI 30 이하 구간 진입, 단기 반등 후 50~RSI 50 부근에서 청산. 보유 기간 2~8주.",
    strengths: [
      "극도의 공포 구간에서 최저가 근처 매수 가능",
      "단기 반등 포착으로 짧은 기간에 높은 수익률 실현",
      "낮은 매수 단가로 손익비(R/R) 구조적으로 유리",
      "위기·급락 이벤트를 수익 기회로 전환하는 독특한 장점",
    ],
    weaknesses: [
      "하락하는 칼날 잡기 — 반등 전 추가 하락으로 미실현 손실 확대",
      "기업 펀더멘털 악화 vs 일시 과매도 구분 실패 시 가치 함정 진입",
      "타이밍 오판으로 장기 보유 전환, 단기 전략 원칙 붕괴",
      "역발상 집착으로 상승 추세 종목 진입 기회 놓침",
    ],
    marketCondition:
      "위기·공황 국면(COVID 폭락, 금리충격 등 외생 충격 이후)에서 폭발적 수익. 시장이 빠르게 회복하는 V자 반등 국면에서 최고 성과.",
    portfolioExample:
      "위기 과매도 섹터 개별주 40% / 역발상 ETF 25% / 현금 35% (공격적 진입 대기)",
    similarInvestor:
      "마이클 버리(빅쇼트) · 존 템플턴(위기 역매수) · 하워드 막스(2단계 사고)",
    tips: [
      "진입 전 '왜 빠졌는가' 원인 분석 — 일시 패닉이면 매수, 구조 변화면 회피",
      "분할 매수 3단계 적용: 1차(30%) → 추가 하락 확인 후 2차(40%) → 반등 시그널 후 3차(30%)",
      "단기 반등 목표가를 사전 설정하고 도달 즉시 청산 원칙 준수",
      "현금 비중 30% 이상 항상 유지 — 공황은 예고 없이 온다",
    ],
  },
  VSL: {
    fullDescription:
      "VSL 유형은 '방어적 장기투자자'입니다. 자산 보전과 꾸준한 현금흐름을 최우선으로 삼는 안정 지향형 투자자입니다. 배당금이 월세처럼 들어오는 인컴 포트폴리오를 구축하는 것이 목표이며, 10년·20년을 바라보는 긴 호흡으로 자산을 키워갑니다. 밤에 발 뻗고 잘 수 있는 포트폴리오가 이 유형의 이상입니다.",
    personality: [
      "안정 최우선 — 수익률보다 자산 보전을 절대 우선시",
      "현금흐름 중시 — 시세 차익보다 배당·이자 수입으로 생활비 충당 목표",
      "분산 투자 철학 — 단일 종목·섹터 집중 위험을 원천 차단",
    ],
    investmentStyle:
      "배당귀족주(25년 연속 배당 증가 기업)·리츠·인프라 장기 보유. 배당 자동 재투자로 주식 수 누적. 연 1회 포트폴리오 리밸런싱.",
    strengths: [
      "배당 재투자 복리로 시간이 갈수록 가속되는 수익 성장",
      "하락장에서 배당 수익이 쿠션 역할, 심리적 안정 유지",
      "분산 투자로 개별 종목 리스크 원천 차단",
      "장기 우량주 보유로 기업 파산 위험 극히 낮음",
    ],
    weaknesses: [
      "인플레이션 시 실질 배당 수익률 감소",
      "고배당 집착으로 성장성 높은 종목 편입 기회 포기",
      "방어적 편향이 강세장 상승분 미반영으로 기회비용 발생",
      "금리 상승기 리츠·고배당주 주가 하락 충격 취약",
    ],
    marketCondition:
      "금리 안정·하향 환경, 경기 확장 국면에서 최고 성과. 배당 재투자 복리 효과는 10년 이상 장기에서 극대화.",
    portfolioExample:
      "배당귀족 ETF(NOBL·SDY) 40% / 리츠 ETF(VNQ) 20% / 장기채 ETF 25% / 개별 배당주 15%",
    similarInvestor:
      "존 D. 록펠러(배당 인컴) · 켄 피셔(방어적 성장) · 조나단 클레멘츠",
    tips: [
      "배당 수익률 5% 이상 고배당주는 배당 지속 가능성(FCF 커버리지) 반드시 확인",
      "리츠 편입 시 부채비율·FFO 성장률 체크 — 고금리에 취약한 종목 사전 필터링",
      "인플레이션 헤지로 TIPS ETF나 원자재 ETF 5~10% 편입 고려",
      "연 배당 총액으로 생활비 일부를 충당할 수 있는 시점을 목표 마일스톤으로 설정",
    ],
  },
  VST: {
    fullDescription:
      "VST 유형은 '보수적 단기투자자'입니다. 원금 보전을 절대 원칙으로 삼고 안전자산 중심으로 운용하는 극도로 신중한 투자자입니다. 시장 변동성을 최대한 피하며, 수익보다 손실 회피를 우선시합니다. 이 유형에게 투자란 '저축의 연장선'에 가깝고, 작더라도 확실한 수익을 선호합니다.",
    personality: [
      "손실 혐오 극대 — 손실의 심리적 고통이 이익의 기쁨보다 훨씬 크게 느껴짐",
      "안전자산 친화 — MMF, 단기채, 예금 등 원금 보장형 선호",
      "단기 사이클 운용 — 길게 묶어두는 것에 불안감, 유동성 최우선",
    ],
    investmentStyle:
      "MMF, 단기채(만기 1년 이내), 초우량 배당주(시가총액 1조 이상) 위주. 금리 환경에 따라 단기채↔MMF 비중 조절.",
    strengths: [
      "원금 보전 확률 극대화로 자산 하방 견고",
      "유동성 확보로 긴급 자금 수요 언제든 대응 가능",
      "고금리 환경에서 단기채 수익률이 주식 수익률을 상회하는 구간 존재",
      "심리적 안정 — 포트폴리오 변동성 낮아 일상생활 집중 가능",
    ],
    weaknesses: [
      "기회비용 막대 — 강세장에서 주식 대비 수익률 대폭 하회",
      "인플레이션에 실질 자산 가치 지속 잠식",
      "지나친 보수성으로 장기 자산 축적 속도 매우 느림",
      "안전자산만으로는 은퇴 자금 목표 달성 어려움",
    ],
    marketCondition:
      "고금리 환경(기준금리 4% 이상)에서 단기채 수익률 매력 극대화. 주식 시장 극도 불확실성 구간에서 상대적 강점.",
    portfolioExample:
      "MMF·CMA 35% / 단기채 ETF(SHY·SGOV) 35% / 초우량 배당주 20% / 금 ETF 10%",
    similarInvestor:
      "하워드 막스(리스크 관리 중시 철학) · 개인 자산관리사(보존 중심)",
    tips: [
      "단기채 만기 사다리(1개월·3개월·6개월·1년) 구성으로 금리 변화에 유연 대응",
      "장기 목표(노후 자금 등) 위해 소액이라도 인덱스 ETF 10~15% 편입 시작 권장",
      "인플레이션율 + 1% 이상 수익률 목표를 최소 기준으로 설정",
      "비상 자금 6개월치 별도 보관 후 나머지 자산 리스크 허용 범위 재점검",
    ],
  },
};

export function StockMbtiCard({ insightResult, onRetakeSurvey }: Props) {
  const [showDetail, setShowDetail] = useState(false);
  const [building, setBuilding] = useState(false);

  const lines = insightResult?.content?.split("\n") ?? [];
  const code  = lines[0] ?? "";
  const name  = lines[1] ?? "";
  const desc  = lines[2] ?? "";
  const [profitScore, riskScore, longScore] = (lines[3] ?? "0:0:0").split(":").map(Number);

  const isSurveyMissing = code === "설문 미완료" || !code;
  const theme  = MBTI_THEME[code]  ?? MBTI_THEME.VST;
  const emoji  = MBTI_EMOJI[code]  ?? "📊";
  const detail = MBTI_DETAIL[code];

  const dims = [
    { left: "G 수익추구",    right: "V 안정추구",       score: profitScore, leftActive: code[0] === "G" },
    { left: "R 리스크 감내", right: "S 안전 중시",      score: riskScore,   leftActive: code[1] === "R" },
    { left: "L 장기투자",    right: "T 단기트레이딩",   score: longScore,   leftActive: code[2] === "L" },
  ];

  const handleBuildContext = async () => {
    setBuilding(true);
    try {
      await requestInsightBuild();
    } catch {
      // 에러는 apiClient 인터셉터에서 처리
    } finally {
      setBuilding(false);
    }
  };

  return (
    <Card className="p-0 gap-0 bg-slate-700 border-slate-600 overflow-hidden">
      <div className={`h-1 ${theme.bar} opacity-70`} />
      <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm flex items-center gap-2 text-gray-100">
          <Fingerprint className="w-4 h-4 text-pink-400" />
          투자 MBTI
        </h3>
        <button
          onClick={handleBuildContext}
          disabled={building}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-500 text-white transition-colors flex-shrink-0"
        >
          <RefreshCw className={`w-3 h-3 ${building ? "animate-spin" : ""}`} />
          {building ? "분석 중..." : "결과보기"}
        </button>
      </div>

      {isSurveyMissing ? (
        <div className="flex flex-col items-center justify-center py-5 gap-2 text-center">
          <span className="text-3xl">🧬</span>
          <p className="text-sm text-gray-300 font-medium">투자 MBTI 분석 전</p>
          <p className="text-xs text-gray-400">
            설문을 완료하고 결과보기를 누르면
            <br />
            나의 투자 MBTI를 확인할 수 있습니다.
          </p>
          {onRetakeSurvey && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetakeSurvey}
              className="mt-2 text-xs border-pink-500/50 text-pink-300 hover:bg-pink-900/30 gap-1.5"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              설문 하러 가기
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {/* 코드 배지 + 유형명 */}
          <div className={`flex items-center gap-3 p-3 rounded-xl border ${theme.bg} ${theme.border}`}>
            <div className={`w-16 h-16 rounded-xl ${theme.bar} flex flex-col items-center justify-center flex-shrink-0 shadow-lg ${theme.glow}`}>
              <span className="text-white font-black text-xl tracking-widest">{code}</span>
              <span className="text-white/70 text-[9px] mt-0.5">투자유형</span>
            </div>
            <div className="min-w-0">
              <p className={`font-bold text-base leading-tight ${theme.text}`}>
                {emoji} {name}
              </p>
              <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">{desc}</p>
            </div>
          </div>

          {/* 종합 설명 */}
          {detail && (
            <div className={`rounded-lg border p-3 ${theme.bg} ${theme.border}`}>
              <p className="text-[11px] text-gray-300 leading-relaxed">{detail.fullDescription}</p>
            </div>
          )}

          {/* 차원 진행 바 */}
          <div className="space-y-2.5">
            {dims.map((d, i) => (
              <div key={i}>
                <div className="flex justify-between text-[10px] mb-1">
                  <span className={d.leftActive ? `font-bold ${theme.text}` : "text-gray-500"}>{d.left}</span>
                  <span className={!d.leftActive ? `font-bold ${theme.text}` : "text-gray-500"}>{d.right}</span>
                </div>
                <div className="relative w-full h-2 bg-slate-600 rounded-full overflow-hidden">
                  <div
                    className={`absolute top-0 left-0 h-2 rounded-full ${theme.bar} opacity-80 transition-all duration-500`}
                    style={{ width: `${d.score ?? 0}%` }}
                  />
                  <div className="absolute top-0 left-1/2 w-px h-2 bg-white/20" />
                </div>
              </div>
            ))}
          </div>

          {/* 성격 특성 */}
          {detail && (
            <div className={`rounded-lg border p-3 space-y-1.5 ${theme.bg} ${theme.border}`}>
              <p className={`text-[11px] font-semibold mb-2 ${theme.text}`}>💡 성격 특성</p>
              {detail.personality.map((c, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className={`mt-0.5 text-[10px] font-bold flex-shrink-0 ${theme.text}`}>·</span>
                  <span className="text-[11px] text-gray-300 leading-relaxed">{c}</span>
                </div>
              ))}
            </div>
          )}

          {/* 투자 스타일 */}
          {detail && (
            <div className="rounded-lg bg-slate-600/50 border border-slate-500/50 p-3">
              <p className={`text-[11px] font-semibold mb-1.5 ${theme.text}`}>📈 투자 스타일</p>
              <p className="text-[11px] text-gray-300 leading-relaxed">{detail.investmentStyle}</p>
            </div>
          )}

          {/* 상세 펼치기 */}
          {detail && (
            <>
              <button
                onClick={() => setShowDetail((v) => !v)}
                className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-medium border transition-colors ${theme.bg} ${theme.border} ${theme.text}`}
              >
                {showDetail ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                {showDetail ? "접기" : "강점·약점·시장 환경·포트폴리오 예시 더 보기"}
              </button>

              {showDetail && (
                <div className="space-y-3">
                  {/* 강점 */}
                  <div className="rounded-lg bg-emerald-900/20 border border-emerald-700/30 p-3">
                    <p className="text-[11px] font-semibold text-emerald-400 mb-2">✅ 강점</p>
                    {detail.strengths.map((s, i) => (
                      <div key={i} className="flex items-start gap-2 mb-1">
                        <span className="text-[10px] text-emerald-500 flex-shrink-0 mt-0.5">+</span>
                        <p className="text-[11px] text-gray-300 leading-relaxed">{s}</p>
                      </div>
                    ))}
                  </div>

                  {/* 주의 */}
                  <div className="rounded-lg bg-red-900/20 border border-red-700/30 p-3">
                    <p className="text-[11px] font-semibold text-red-400 mb-2">⚠️ 주의할 점</p>
                    {detail.weaknesses.map((w, i) => (
                      <div key={i} className="flex items-start gap-2 mb-1">
                        <span className="text-[10px] text-red-500 flex-shrink-0 mt-0.5">-</span>
                        <p className="text-[11px] text-gray-300 leading-relaxed">{w}</p>
                      </div>
                    ))}
                  </div>

                  {/* 유리한 시장 환경 */}
                  <div className="rounded-lg bg-slate-600/50 border border-slate-500/50 p-3">
                    <p className={`text-[11px] font-semibold mb-1.5 ${theme.text}`}>🌍 유리한 시장 환경</p>
                    <p className="text-[11px] text-gray-300 leading-relaxed">{detail.marketCondition}</p>
                  </div>

                  {/* 포트폴리오 예시 */}
                  <div className={`rounded-lg border p-3 ${theme.bg} ${theme.border}`}>
                    <p className={`text-[11px] font-semibold mb-1.5 ${theme.text}`}>📊 포트폴리오 구성 예시</p>
                    <p className="text-[11px] text-gray-300 leading-relaxed font-mono">{detail.portfolioExample}</p>
                  </div>

                  {/* 실전 팁 */}
                  <div className="rounded-lg bg-yellow-900/20 border border-yellow-700/30 p-3">
                    <p className="text-[11px] font-semibold text-yellow-400 mb-2">🔑 실전 팁</p>
                    {detail.tips.map((t, i) => (
                      <div key={i} className="flex items-start gap-2 mb-1.5">
                        <span className="text-[10px] text-yellow-500 flex-shrink-0 mt-0.5">{i + 1}.</span>
                        <p className="text-[11px] text-gray-300 leading-relaxed">{t}</p>
                      </div>
                    ))}
                  </div>

                  {/* 닮은 투자자 */}
                  <div className={`rounded-lg border p-3 ${theme.bg} ${theme.border}`}>
                    <p className={`text-[11px] font-semibold mb-1 ${theme.text}`}>🏆 닮은 투자 대가</p>
                    <p className="text-[11px] text-gray-300">{detail.similarInvestor}</p>
                  </div>
                </div>
              )}
            </>
          )}

          <div className="flex items-center justify-between pt-1">
            <p className="text-[10px] text-gray-500">AI 분석 · 설문 점수 기반</p>
            {onRetakeSurvey && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRetakeSurvey}
                className="h-7 text-[11px] text-pink-300 hover:text-pink-200 hover:bg-pink-900/30 gap-1 px-2"
              >
                <RefreshCcw className="w-3 h-3" />
                다시 설문하기
              </Button>
            )}
          </div>
        </div>
      )}
      </div>
    </Card>
  );
}
