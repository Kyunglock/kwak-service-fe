import { Fingerprint, RefreshCcw, RefreshCw, Sparkles } from "lucide-react";
import { Card } from "@/app/components/ui/layout/card";
import { Button } from "@/app/components/ui/form/button";
import type { InsightResultResponse } from "@/app/types";

interface Props {
  insightResult: InsightResultResponse | null;
  onRetakeSurvey?: () => void;
  onBuild?: () => void;
  building?: boolean;
}

/** 원점수(25~100) → 강도 %(0~100). 50%가 판정 경계(원점수 62.5). */
const strength = (raw: number) => Math.min(100, Math.max(0, ((raw - 25) / 75) * 100));

// 성격 MBTI 4그룹 컬러 (NT 보라 / NF 초록 / SJ 파랑 / SP 앰버)
function personalityTheme(code: string) {
  const nt = { hero: "from-purple-500/25 via-purple-700/10", text: "text-purple-300", bar: "bg-purple-500", ring: "ring-purple-400/30" };
  const nf = { hero: "from-emerald-500/25 via-emerald-700/10", text: "text-emerald-300", bar: "bg-emerald-500", ring: "ring-emerald-400/30" };
  const sj = { hero: "from-blue-500/25 via-blue-700/10", text: "text-blue-300", bar: "bg-blue-500", ring: "ring-blue-400/30" };
  const sp = { hero: "from-amber-500/25 via-amber-700/10", text: "text-amber-300", bar: "bg-amber-500", ring: "ring-amber-400/30" };
  if (code.includes("N")) return code.includes("T") ? nt : nf;
  return code.includes("J") ? sj : sp;
}

interface Gauge {
  left: string;
  right: string;
  score: number;      // 강도 % (앞 글자 방향)
  leftActive: boolean;
}

function GaugeRow({ g, barClass, textClass }: { g: Gauge; barClass: string; textClass: string }) {
  // 왼쪽 글자(E/G 등) 성향이 강할수록 표시점이 왼쪽으로 — pos 0%=왼쪽 극단, 50%=경계, 100%=오른쪽 극단
  const pos = 100 - g.score;
  const fillLeft = Math.min(50, pos);
  const fillWidth = Math.abs(pos - 50);
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-[13px]">
        <span className={g.leftActive ? `font-bold ${textClass}` : "text-gray-500"}>{g.left}</span>
        <span className={!g.leftActive ? `font-bold ${textClass}` : "text-gray-500"}>{g.right}</span>
      </div>
      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-slate-700/70">
        <div
          className={`absolute inset-y-0 rounded-full ${barClass} opacity-90 transition-all duration-700`}
          style={{ left: `${fillLeft}%`, width: `${fillWidth}%` }}
        />
        <div className="absolute left-1/2 top-0 h-full w-px bg-white/25" />
        <div
          className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-slate-800 bg-white shadow-md transition-all duration-700"
          style={{ left: `${pos}%` }}
        />
      </div>
    </div>
  );
}

interface PersonalityDetail {
  summary: string;      // 성격 전반 2~3문장
  traits: string[];     // 특징 3
  investStyle: string;  // 투자에서의 모습
  strengths: string[];  // 투자 관점 강점 3
  cautions: string[];   // 주의할 점 3
  tips: string[];       // 실전 팁 3
}

const PERSONALITY_DETAIL: Record<string, PersonalityDetail> = {
  INTJ: {
    summary: "독립적인 전략가로, 큰 그림을 그린 뒤 치밀한 계획으로 실행합니다. 남의 말보다 스스로의 분석을 신뢰하며 장기 목표를 향해 꾸준히 나아갑니다.",
    traits: ["장기 비전과 시나리오 설계에 능함", "군중 심리에 휩쓸리지 않는 독립적 판단", "비효율을 참지 못하고 시스템화를 선호"],
    investStyle: "투자에서도 자신만의 프레임워크를 만들어 움직입니다. 스스로 분석해 확신이 서면 시장 분위기와 반대여도 밀고 나가는 편입니다.",
    strengths: ["철저한 사전 분석으로 충동 매매가 적음", "장기 시나리오 기반의 일관된 포지션 유지", "약세장에서도 원칙을 지키는 멘탈"],
    cautions: ["자기 분석 과신 — 반대 근거를 늦게 인정", "확신 종목에 비중이 쏠리기 쉬움", "단기 유동성 이벤트를 과소평가"],
    tips: ["분기마다 '내 논리가 틀렸다면?' 반대 시나리오를 문서로 남겨보세요", "확신 종목도 최대 비중 상한을 정해두세요", "시장 심리 지표(공포탐욕 등)를 보조 지표로 곁에 두세요"],
  },
  INTP: {
    summary: "논리적인 사색가로, 원리를 파고들어 이해해야 직성이 풀립니다. 아이디어 탐구 자체를 즐기며 새로운 관점을 발견하는 데 강합니다.",
    traits: ["개념·원리 분석에 몰입", "지적 호기심이 넓고 깊음", "결론보다 '왜'가 중요한 탐구형"],
    investStyle: "기업의 비즈니스 모델과 산업 구조를 깊게 파는 리서치형 투자자입니다. 다만 분석이 길어져 매수 타이밍을 놓치는 일이 잦습니다.",
    strengths: ["산업·기술 이해가 깊어 성장 스토리 판별에 강함", "유행보다 구조적 변화에 주목", "복잡한 재무제표도 즐겁게 해부"],
    cautions: ["분석 마비 — 결론 없이 리서치만 반복", "실행·리밸런싱을 미루는 경향", "포트폴리오 관리 등 '지루한 일'에 소홀"],
    tips: ["리서치에 기한을 정하고 기한이 오면 소액이라도 실행하세요", "정기 리밸런싱을 캘린더에 자동화하세요", "분석 노트를 매수 근거 기록으로 남겨 복기에 쓰세요"],
  },
  ENTJ: {
    summary: "대담한 통솔자로, 목표를 세우면 자원을 총동원해 달성합니다. 결단이 빠르고 성과 지향적이며 비효율을 정리하는 데 탁월합니다.",
    traits: ["빠른 의사결정과 강한 실행력", "목표·성과 중심 사고", "통제감을 중시하고 주도권을 쥐려 함"],
    investStyle: "투자를 '목표 수익률 달성 프로젝트'처럼 운영합니다. 판단이 서면 과감하게 진입하고, 안 되는 포지션은 미련 없이 정리합니다.",
    strengths: ["손절·익절 결단이 빨라 손실 관리에 강함", "명확한 목표 수익률과 계획 수립", "정보를 빠르게 종합해 기회 선점"],
    cautions: ["과신으로 베팅 규모가 커지기 쉬움", "단기 성과 압박으로 잦은 매매 유혹", "시장은 통제할 수 없다는 사실을 잊기 쉬움"],
    tips: ["한 번에 태우는 금액의 상한을 미리 정하세요", "월 단위 성과가 아닌 연 단위 목표로 평가 주기를 늘리세요", "'아무것도 안 하는 것'도 유효한 전략임을 기억하세요"],
  },
  ENTP: {
    summary: "뜨거운 논쟁을 즐기는 변론가로, 새로운 아이디어와 가능성에 끊임없이 끌립니다. 고정관념을 뒤집는 발상과 빠른 두뇌 회전이 무기입니다.",
    traits: ["새로운 기회 포착이 빠름", "토론과 반박을 통해 생각을 다듬음", "루틴보다 변화와 자극을 선호"],
    investStyle: "신사업·신기술 테마를 남보다 먼저 발견하는 눈이 있습니다. 다만 아이디어가 많아 포트폴리오가 산만해지고 회전율이 높아지기 쉽습니다.",
    strengths: ["혁신 테마 조기 발굴", "반대 논리를 검토하는 유연한 사고", "시장 변화에 빠르게 적응"],
    cautions: ["테마를 옮겨 다니며 잦은 매매", "싫증 — 장기 보유 중 흥미를 잃고 이탈", "아이디어 수만큼 종목 수가 불어남"],
    tips: ["신규 아이디어는 '관찰 리스트'에 2주 묵힌 뒤 진입하세요", "핵심(코어) 포트폴리오와 실험(위성) 계좌를 분리하세요", "보유 종목 수 상한을 정해두세요"],
  },
  INFJ: {
    summary: "선의의 옹호자로, 깊은 통찰과 신념을 갖고 조용히 세상을 바꾸려 합니다. 사람과 가치에 대한 직관이 뛰어나며 자신만의 기준이 뚜렷합니다.",
    traits: ["장기적 의미와 가치를 중시", "직관적 통찰이 깊음", "신념이 서면 흔들리지 않음"],
    investStyle: "공감하는 기업·산업(친환경, 헬스케어 등)에 장기 투자하는 가치 정렬형입니다. 신념이 강해 손실 중에도 오래 버티는 편입니다.",
    strengths: ["철학이 있는 장기 보유로 복리 효과", "단기 소음에 흔들리지 않음", "기업의 정성적 가치 판별에 강함"],
    cautions: ["신념 종목의 악화 신호를 외면하기 쉬움", "'좋은 회사'와 '좋은 주식'을 혼동", "손절을 신념의 포기로 느껴 미룸"],
    tips: ["신념 종목일수록 숫자 기반 점검 기준을 함께 두세요", "가치 정렬 종목도 밸류에이션을 확인하고 사세요", "포트폴리오의 일부는 신념과 무관한 인덱스로 채우세요"],
  },
  INFP: {
    summary: "열정적인 중재자로, 자신의 가치관에 따라 조용하지만 단단하게 움직입니다. 이상을 향한 진정성과 풍부한 내면 세계가 강점입니다.",
    traits: ["가치와 의미 중심의 선택", "내면의 기준이 뚜렷함", "압박 상황에서 스트레스에 민감"],
    investStyle: "돈보다 '의미 있는 곳에 돈을 두는 것'이 중요한 투자자입니다. 시장 급변 시 심리적 동요가 커서 검증된 단순한 전략이 잘 맞습니다.",
    strengths: ["유행 추종이 적고 자기 페이스 유지", "적립식 등 꾸준한 습관형 전략에 강함", "공감 가는 산업의 스토리를 깊게 이해"],
    cautions: ["급락장에서 심리적 충격이 큼", "손실 종목을 감정적으로 붙들기 쉬움", "숫자 점검을 미루는 경향"],
    tips: ["변동성이 낮은 인덱스 적립식을 기본기로 삼으세요", "계좌 확인 주기를 정해 과도한 시세 확인을 줄이세요", "매수 전 '이 돈이 절반이 되어도 괜찮은가'를 자문하세요"],
  },
  ENFJ: {
    summary: "정의로운 사회운동가로, 사람들을 이끌고 성장시키는 데서 보람을 느낍니다. 공동체 의식이 강하고 타인의 반응에 민감합니다.",
    traits: ["관계와 조화를 중시", "타인의 의견에 귀 기울임", "책임감이 강하고 계획적"],
    investStyle: "주변과 정보를 나누며 투자하는 소셜형입니다. 다만 지인 추천이나 커뮤니티 분위기에 영향을 받아 판단이 흔들릴 수 있습니다.",
    strengths: ["정보 수집 네트워크가 넓음", "계획적인 자금 관리", "가족·미래를 위한 목적 자금 설계에 강함"],
    cautions: ["지인 추천 종목에 검증 없이 진입", "커뮤니티 심리에 동조 매매", "거절 못해 유행 상품에 가입"],
    tips: ["추천받은 종목도 스스로 세 가지 근거를 적은 뒤 사세요", "투자 결정은 커뮤니티를 닫고 혼자 내리세요", "목적별(교육·노후) 계좌를 분리해 운용하세요"],
  },
  ENFP: {
    summary: "재기발랄한 활동가로, 열정과 호기심이 넘치고 가능성을 보는 눈이 밝습니다. 사람과 아이디어 모두에서 에너지를 얻습니다.",
    traits: ["열정적이고 낙관적", "새로움에 대한 강한 호기심", "즉흥적이며 규칙에 얽매이기 싫어함"],
    investStyle: "화제가 되는 테마에 설레며 뛰어드는 모험형입니다. 상승장에서 대담하지만, 계획 없는 진입으로 고점 매수가 잦을 수 있습니다.",
    strengths: ["트렌드 감지가 빠름", "낙관성 덕분에 하락 후 회복장을 잘 탐", "새 자산군(리츠, 해외 등)에 열린 태도"],
    cautions: ["FOMO 고점 추격 매수", "즉흥 매매로 원칙 부재", "손실을 낙관으로 덮고 물타기"],
    tips: ["매수 전 24시간 대기 규칙을 두세요", "'재미 계좌'는 전체 자산의 10% 이내로 제한하세요", "자동 적립식으로 기본기를 깔고 그 위에서 노세요"],
  },
  ISTJ: {
    summary: "청렴결백한 논리주의자로, 사실과 경험을 바탕으로 착실하게 책임을 완수합니다. 검증된 방식과 질서를 신뢰합니다.",
    traits: ["꼼꼼하고 체계적인 실행", "검증된 방법 선호", "약속과 원칙을 끝까지 지킴"],
    investStyle: "우량주·인덱스 중심의 교과서적 투자자입니다. 원칙을 세우면 오래 지키지만, 새로운 기회에는 보수적이라 성장 테마를 놓치기도 합니다.",
    strengths: ["원칙 매매의 일관성 — 감정 개입이 적음", "기록·정리가 훌륭해 복기에 강함", "적립식·배당 전략을 꾸준히 유지"],
    cautions: ["변화 회피로 포트폴리오가 낡을 수 있음", "새 자산군 검토 자체를 미룸", "명확한 답이 없는 상황에서 결정 지연"],
    tips: ["연 1회 '새 자산군 검토의 날'을 정해 강제로 살펴보세요", "전체의 10~15%는 성장 자산에 배정해 보세요", "기존 원칙도 3년마다 유효성을 재검증하세요"],
  },
  ISFJ: {
    summary: "용감한 수호자로, 소중한 사람과 일상을 지키는 데 헌신합니다. 세심하고 성실하며 안정된 환경에서 힘을 발휘합니다.",
    traits: ["세심한 관찰과 배려", "안정과 지속성을 중시", "위험 신호에 민감"],
    investStyle: "가족과 미래를 지키는 안전 자산 중심의 수비형 투자자입니다. 원금 보전을 중시해 예금·배당주 위주로 운용하는 경향이 있습니다.",
    strengths: ["무리한 베팅이 없어 큰 손실을 피함", "꾸준한 저축·적립 습관", "지출·자금 관리가 안정적"],
    cautions: ["과도한 안전 추구로 인플레이션에 잠식", "투자 공부를 '위험한 일'로 미루는 경향", "주변의 불안 조성에 쉽게 위축"],
    tips: ["물가상승률+α를 최소 목표 수익률로 삼으세요", "원금 보장 상품과 인덱스를 7:3부터 시작해 보세요", "뉴스 헤드라인보다 보유 자산의 실적을 보세요"],
  },
  ESTJ: {
    summary: "엄격한 관리자로, 체계와 규율로 일과 자산을 운영합니다. 현실 감각이 뛰어나고 결과로 말하는 실용주의자입니다.",
    traits: ["체계적인 관리와 통제", "현실적·실용적 판단", "명확한 기준과 절차 선호"],
    investStyle: "목표·규칙·점검 주기가 명확한 시스템 투자자입니다. 계획대로 굴러가는 것을 좋아해 정량 기준(PER, 배당률 등) 매매에 강합니다.",
    strengths: ["규칙 기반 매매로 일관성 높음", "정기 점검·리밸런싱을 거르지 않음", "수수료·세금까지 챙기는 꼼꼼함"],
    cautions: ["정량 지표 밖의 질적 변화(경영진, 기술)를 놓침", "시장이 규칙대로 안 움직이면 스트레스", "하락장에서 규칙 자체를 의심하며 갈아엎기"],
    tips: ["정량 기준에 '스토리 점검' 항목을 하나 추가하세요", "규칙 변경은 시장 밖(주말)에 결정하세요", "백테스트 없는 규칙 교체는 금지 규칙으로 두세요"],
  },
  ESFJ: {
    summary: "사교적인 외교관으로, 주변을 챙기고 조화를 이루는 데 탁월합니다. 관계 속에서 에너지를 얻고 인정받을 때 힘이 납니다.",
    traits: ["관계 중심적이고 협조적", "성실하고 책임감 강함", "주변 평판과 반응에 민감"],
    investStyle: "주변 사람들과 함께 배우고 투자하는 유형입니다. 모임·유튜브 등에서 얻은 정보 실행력은 좋으나 출처 검증이 약할 수 있습니다.",
    strengths: ["좋은 정보 채널을 빠르게 확보", "성실한 납입과 관리", "가계 재무를 균형 있게 챙김"],
    cautions: ["'다들 산다더라' 동조 매수", "인기 상품(공모주, 테마 ETF) 쏠림", "손실을 주변에 숨기며 대응이 늦어짐"],
    tips: ["정보의 출처가 '누구'가 아니라 '무엇'인지 확인하세요", "유행 상품은 전체 자산의 10% 이내로 제한하세요", "투자 현황을 배우자·가족과 정기 공유해 객관화하세요"],
  },
  ISTP: {
    summary: "만능 재주꾼으로, 도구와 시스템을 다루는 감각이 탁월하고 위기에 침착합니다. 말보다 행동, 이론보다 실전을 선호합니다.",
    traits: ["문제 해결형 실용주의", "위기 상황에서 냉정함", "간섭받지 않는 자율성 선호"],
    investStyle: "차트·데이터 도구를 능숙하게 다루는 기술적 트레이더 기질입니다. 급락 같은 혼란 속에서 오히려 침착하게 기회를 잡습니다.",
    strengths: ["패닉장에서 냉정한 진입·청산", "매매 도구·자동화 활용 능력", "손절에 감정이 섞이지 않음"],
    cautions: ["단타 위주로 장기 복리를 놓침", "관심이 식으면 계좌를 방치", "과도한 레버리지 실험"],
    tips: ["트레이딩 계좌와 장기 계좌를 분리하고 장기 쪽을 자동화하세요", "레버리지는 소액 실험 계좌로 한정하세요", "월 1회 '방치 점검일'을 자동 알림으로 두세요"],
  },
  ISFP: {
    summary: "호기심 많은 예술가로, 자신의 감각과 현재의 만족을 소중히 여깁니다. 온화하지만 자기 취향과 자유에 대한 고집이 있습니다.",
    traits: ["감각적이고 현재 지향적", "경쟁보다 자기 만족 중시", "스트레스 상황을 회피하는 경향"],
    investStyle: "관심 가는 브랜드·제품의 회사에 투자하는 감각형입니다. 복잡한 분석보다 직관에 의존하고, 시장이 험할 땐 아예 쳐다보지 않습니다.",
    strengths: ["소비자 감각으로 생활 속 종목 발굴", "욕심이 과하지 않아 무리한 베팅이 적음", "장기 방치가 오히려 장기 보유가 되기도"],
    cautions: ["'느낌'만으로 매수해 근거가 빈약", "하락장 회피로 손실 방치", "재무 점검 루틴 부재"],
    tips: ["좋아하는 브랜드라도 매출 성장률 하나는 확인하세요", "자동 적립식으로 '신경 안 써도 되는 구조'를 만드세요", "분기 1회, 15분 점검 루틴만 유지하세요"],
  },
  ESTP: {
    summary: "모험을 즐기는 사업가로, 순간 판단력과 배짱이 뛰어난 행동파입니다. 이론보다 몸으로 부딪히며 배우고 스릴을 즐깁니다.",
    traits: ["순발력과 현장 감각", "리스크를 즐기는 배짱", "지루함을 못 견딤"],
    investStyle: "변동성 자체를 기회로 보는 타고난 트레이더입니다. 수익도 손실도 빠른 스타일이라 리스크 관리 규칙이 성패를 가릅니다.",
    strengths: ["빠른 손절로 큰 손실 회피 가능", "변동성 장세에서 수익 기회 극대화", "실전 경험 축적 속도가 빠름"],
    cautions: ["과잉 매매로 수수료·세금 누적", "연승 후 베팅 규모 폭증", "지루한 장에서 무리한 진입"],
    tips: ["일일 최대 손실 한도를 정하고 도달 시 그날은 종료하세요", "연승 중일수록 베팅 규모를 '고정'하세요", "수익의 일정 비율을 장기 계좌로 강제 이체하세요"],
  },
  ESFP: {
    summary: "자유로운 영혼의 연예인으로, 지금 이 순간을 즐기며 주변에 활력을 줍니다. 낙천적이고 사교적이며 새로운 경험에 열려 있습니다.",
    traits: ["긍정적이고 사교적", "현재의 즐거움 중시", "즉흥적 소비·결정 경향"],
    investStyle: "투자도 즐거워야 하는 유형입니다. 화제성 있는 종목으로 시작하는 경우가 많고, 수익이 나면 쉽게 소비로 이어집니다.",
    strengths: ["시장 참여 자체에 대한 거부감이 없음", "낙관성으로 하락 후에도 재도전", "화제 테마의 초기 흐름에 밝음"],
    cautions: ["수익 실현금을 재투자 대신 소비", "계획 없는 즉흥 매매", "손실을 잊기로 '결정'하고 방치"],
    tips: ["수익의 50%는 자동으로 재투자되게 설정하세요", "선저축·후소비 자동이체를 급여일에 걸어두세요", "'재미 종목'은 소액 별도 계좌에서만 다루세요"],
  },
};

function SectionHeader({ emoji, title, className = "" }: { emoji: string; title: string; className?: string }) {
  return (
    <p className={`mb-2.5 flex items-center gap-1.5 text-[14px] font-bold ${className}`}>
      <span className="text-[15px]">{emoji}</span>
      {title}
    </p>
  );
}

export function StockMbtiCard({ insightResult, onRetakeSurvey, building }: Props) {
  // onBuild prop은 호출부 호환을 위해 Props에 유지 (재생성은 대시보드의 generateMbtiNow가 수행)
  const isBuilding = building ?? false;

  const lines = insightResult?.content?.split("\n") ?? [];
  const isSurveyMissing = !lines[0] || lines[0] === "설문 미완료";
  const isLegacy = !isSurveyMissing && lines[0] !== "V2";

  // V2 파싱
  const pCode = lines[1] ?? "NONE";
  const pAlias = lines[2] ?? "-";
  const iCode = lines[3] ?? "";
  const iName = lines[4] ?? "";
  const iDesc = lines[5] ?? "";
  const [ei, sn, tf, jp] = (lines[6] ?? "0:0:0:0").split(":").map(Number);
  const [profit, risk, longT, div] = (lines[7] ?? "0:0:0:0").split(":").map(Number);

  const hasPersonality = pCode !== "NONE" && pCode.length === 4;
  const theme = hasPersonality ? personalityTheme(pCode) : personalityTheme("SJ");
  const pDetail = hasPersonality ? PERSONALITY_DETAIL[pCode] : undefined;

  const personalityGauges: Gauge[] = [
    { left: "E 외향", right: "I 내향", score: strength(ei), leftActive: pCode[0] === "E" },
    { left: "S 감각", right: "N 직관", score: strength(sn), leftActive: pCode[1] === "S" },
    { left: "T 사고", right: "F 감정", score: strength(tf), leftActive: pCode[2] === "T" },
    { left: "J 판단", right: "P 인식", score: strength(jp), leftActive: pCode[3] === "J" },
  ];
  const investGauges: Gauge[] = [
    { left: "G 수익추구", right: "V 안정추구", score: strength(profit), leftActive: iCode[0] === "G" },
    { left: "R 리스크 감내", right: "S 안전 중시", score: strength(risk), leftActive: iCode[1] === "R" },
    { left: "L 장기투자", right: "T 단기트레이딩", score: strength(longT), leftActive: iCode[2] === "L" },
    { left: "D 분산투자", right: "F 집중투자", score: strength(div), leftActive: iCode[3] === "D" },
  ];

  /* ---------- 설문 미완료 ---------- */
  if (isSurveyMissing) {
    return (
      <Card className="p-6 gap-0 border-slate-700/60 bg-slate-800/80 shadow-xl">
        <div className="mb-6 flex items-center gap-2">
          <Fingerprint className="h-4 w-4 text-pink-400" />
          <h3 className="text-base font-semibold text-gray-100">나의 MBTI</h3>
        </div>
        <div className="flex flex-col items-center justify-center gap-3 py-6 text-center">
          <div className="relative">
            <div className={`absolute inset-0 rounded-full bg-pink-500/30 blur-xl ${isBuilding ? "animate-pulse" : ""}`} />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-pink-500/30 bg-gradient-to-br from-pink-500/20 to-rose-600/10 text-4xl">
              🧬
            </div>
          </div>
          {isBuilding ? (
            <>
              <p className="flex items-center gap-2 text-base font-semibold text-gray-100">
                <RefreshCw className="h-3.5 w-3.5 animate-spin" /> MBTI 분석 중...
              </p>
              <p className="text-base leading-relaxed text-gray-400">설문 응답을 분석하고 있어요.<br />잠시만 기다려 주세요.</p>
            </>
          ) : (
            <>
              <p className="text-base font-semibold text-gray-100">아직 나의 유형을 몰라요</p>
              <p className="text-base leading-relaxed text-gray-400">
                통합 설문(44문항)을 완료하면
                <br />
                일반 MBTI와 투자 MBTI를 함께 알려드려요.
              </p>
              {onRetakeSurvey && (
                <Button variant="outline" size="sm" onClick={onRetakeSurvey}
                        className="mt-2 gap-1.5 border-pink-500/50 text-base text-pink-300 hover:bg-pink-900/30">
                  <RefreshCcw className="h-3.5 w-3.5" /> 설문 하러 가기
                </Button>
              )}
            </>
          )}
        </div>
      </Card>
    );
  }

  /* ---------- 구포맷 결과 — 새 문항 반영 전 ---------- */
  if (isLegacy) {
    return (
      <Card className="p-6 gap-0 border-slate-700/60 bg-slate-800/80 shadow-xl">
        <div className="mb-4 flex items-center gap-2">
          <Fingerprint className="h-4 w-4 text-pink-400" />
          <h3 className="text-base font-semibold text-gray-100">나의 MBTI</h3>
        </div>
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <span className="text-4xl">✨</span>
          <p className="text-base font-semibold text-gray-100">검사가 새로워졌어요</p>
          <p className="text-base leading-relaxed text-gray-400">
            성격 MBTI 문항이 추가되어 44문항 통합 검사가 됐어요.
            <br />
            다시 검사하면 일반 MBTI와 투자 MBTI를 함께 볼 수 있어요.
          </p>
          {onRetakeSurvey && (
            <Button variant="outline" size="sm" onClick={onRetakeSurvey}
                    className="mt-2 gap-1.5 border-pink-500/50 text-base text-pink-300 hover:bg-pink-900/30">
              <RefreshCcw className="h-3.5 w-3.5" /> 새 검사 하러 가기
            </Button>
          )}
        </div>
      </Card>
    );
  }

  /* ---------- V2 결과 ---------- */
  return (
    <Card className="p-0 gap-0 overflow-hidden border-slate-700/60 bg-slate-800/80 shadow-xl">
      {/* HERO — 일반 MBTI (주) */}
      <div className={`relative overflow-hidden bg-gradient-to-br ${theme.hero} to-slate-800/70`}>
        <div className="relative p-5">
          <div className="mb-4 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold tracking-wide text-gray-200/90">
              <Fingerprint className="h-3.5 w-3.5 text-pink-300" /> 나의 MBTI
            </span>
            {isBuilding && (
              <span className="inline-flex items-center gap-1.5 text-[13px] text-gray-300">
                <RefreshCw className="h-3 w-3 animate-spin" /> 갱신 중
              </span>
            )}
          </div>
          {hasPersonality ? (
            <div className="flex items-center gap-4">
              <div className={`flex h-[84px] w-[112px] flex-shrink-0 items-center justify-center rounded-2xl ${theme.bar} shadow-xl ring-4 ${theme.ring}`}>
                <span className="text-[34px] font-black tracking-[0.08em] text-white drop-shadow-sm">{pCode}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-2xl font-extrabold leading-tight ${theme.text}`}>{pAlias}</p>
                <p className="mt-1.5 text-base text-gray-300/85">나의 성격 유형이에요. 아래에서 투자 성향과 함께 확인해 보세요.</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 rounded-xl border border-pink-500/30 bg-pink-500/10 p-4">
              <span className="text-3xl">✨</span>
              <div className="min-w-0 flex-1">
                <p className="text-base font-semibold text-gray-100">성격 MBTI 문항이 새로 추가됐어요</p>
                <p className="mt-0.5 text-[14px] text-gray-300/85">다시 검사하면 일반 MBTI까지 함께 볼 수 있어요.</p>
              </div>
              {onRetakeSurvey && (
                <Button variant="outline" size="sm" onClick={onRetakeSurvey}
                        className="flex-shrink-0 gap-1.5 border-pink-500/50 text-pink-300 hover:bg-pink-900/30">
                  <RefreshCcw className="h-3.5 w-3.5" /> 재검사
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-5 p-5">
        {/* 성격 게이지 */}
        {hasPersonality && (
          <div className="space-y-3.5">
            {personalityGauges.map((g, i) => (
              <GaugeRow key={i} g={g} barClass={theme.bar} textClass={theme.text} />
            ))}
          </div>
        )}

        {/* 성격 상세 — 주 콘텐츠 */}
        {pDetail && (
          <>
            <div className="relative rounded-xl border border-slate-600/50 bg-slate-700/40 p-4">
              <div className={`absolute bottom-4 left-0 top-4 w-1 rounded-full ${theme.bar}`} />
              <p className="pl-3 text-[14px] leading-relaxed text-gray-200">{pDetail.summary}</p>
            </div>

            <div className="rounded-xl border border-slate-600/50 bg-slate-700/40 p-4">
              <SectionHeader emoji="💡" title="이런 사람이에요" className={theme.text} />
              <div className="space-y-2">
                {pDetail.traits.map((t, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className={`mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full ${theme.bar}`} />
                    <span className="text-[14px] leading-relaxed text-gray-200">{t}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-600/50 bg-slate-700/40 p-4">
              <SectionHeader emoji="📈" title="투자할 때 이런 모습" className={theme.text} />
              <p className="text-[14px] leading-relaxed text-gray-200">{pDetail.investStyle}</p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-emerald-700/30 bg-emerald-900/20 p-4">
                <SectionHeader emoji="✅" title="강점" className="text-emerald-400" />
                <div className="space-y-1.5">
                  {pDetail.strengths.map((s, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="mt-0.5 flex-shrink-0 text-[13px] font-bold text-emerald-500">+</span>
                      <p className="text-[14px] leading-relaxed text-gray-200">{s}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-red-700/30 bg-red-900/20 p-4">
                <SectionHeader emoji="⚠️" title="주의할 점" className="text-red-400" />
                <div className="space-y-1.5">
                  {pDetail.cautions.map((c, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="mt-0.5 flex-shrink-0 text-[13px] font-bold text-red-500">-</span>
                      <p className="text-[14px] leading-relaxed text-gray-200">{c}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-yellow-700/30 bg-yellow-900/20 p-4">
              <SectionHeader emoji="🔑" title="실전 팁" className="text-yellow-400" />
              <div className="space-y-2">
                {pDetail.tips.map((t, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-yellow-500/20 text-[12px] font-bold text-yellow-400">
                      {i + 1}
                    </span>
                    <p className="text-[14px] leading-relaxed text-gray-200">{t}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* 투자 MBTI — 보조 섹션 */}
        <div className="rounded-xl border border-slate-600/50 bg-slate-700/40 p-4">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-pink-300" />
            <p className="text-[14px] font-bold text-gray-100">나의 투자 MBTI</p>
            <span className="ml-auto rounded-md bg-slate-600/70 px-2 py-0.5 font-mono text-[13px] font-bold tracking-widest text-gray-100">
              {iCode}
            </span>
          </div>
          <p className="text-lg font-extrabold text-pink-300">{iName}</p>
          <p className="mt-1 text-[14px] leading-relaxed text-gray-300">{iDesc}</p>
          <div className="mt-4 space-y-3.5">
            {investGauges.map((g, i) => (
              <GaugeRow key={i} g={g} barClass="bg-pink-500" textClass="text-pink-300" />
            ))}
          </div>
        </div>

        {/* footer */}
        <div className="flex items-center justify-between border-t border-slate-700/60 pt-3">
          <p className="text-[12px] text-gray-500">설문 점수 기반 · 게이지 50%가 성향 경계</p>
          {onRetakeSurvey && (
            <Button variant="ghost" size="sm" onClick={onRetakeSurvey}
                    className="h-7 gap-1 px-2 text-[13px] text-pink-300 hover:bg-pink-900/30 hover:text-pink-200">
              <RefreshCcw className="h-3 w-3" /> 다시 검사하기
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
