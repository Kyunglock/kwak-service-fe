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

// 성격 심층 콘텐츠 — deepDive(심층 해설), stress(손실·급락 때 모습), chemistry(함께 투자하면 좋은 유형)
const PERSONALITY_MORE: Record<string, { deepDive: string; stress: string; chemistry: string }> = {
  INTJ: {
    deepDive: "INTJ에게 세상은 개선 가능한 시스템입니다. 돈도 예외가 아니어서, 자산을 하나의 설계 대상으로 보고 입구(수입)와 출구(지출·투자)를 구조화하는 데서 안정감을 얻습니다. 남들이 종목을 이야기할 때 INTJ는 '체계'를 이야기합니다. 한 번 완성한 프레임은 좀처럼 바꾸지 않지만, 스스로 납득할 새 근거가 나타나면 하루아침에 전면 개편하는 결단력도 있습니다.",
    stress: "급락장에서 겉으로는 침착하지만 속으로는 '내 모델이 뭘 놓쳤지?'를 무한 반복합니다. 감정이 아니라 분석 불일치가 스트레스의 원천이라, 원인을 규명하고 나면 오히려 빠르게 안정됩니다. 손실 자체보다 '설명되지 않는 손실'을 못 견디는 유형이에요.",
    chemistry: "ESFP·ENFP처럼 시장의 온도를 몸으로 느끼는 유형과 함께하면 모델 밖 현실(소비 트렌드, 대중 심리)을 보완할 수 있어요. 반대로 같은 NT끼리는 논리 대결로 매매가 늦어질 수 있습니다.",
  },
  INTP: {
    deepDive: "INTP의 투자는 지적 퍼즐 풀이에 가깝습니다. 수익 그 자체보다 '내 가설이 맞았는지'가 더 큰 보상이라, 남들이 지루해하는 산업 보고서나 기술 문서를 파고드는 일이 즐겁습니다. 문제는 완벽한 이해에 도달할 때까지 방아쇠를 못 당긴다는 것 — 시장은 INTP의 분석이 끝나기를 기다려주지 않습니다.",
    stress: "손실이 나면 '어디서 논리가 틀렸는지' 복기에 몰두하느라 대응이 늦어질 수 있습니다. 감정 동요는 적은 편이지만, 원인을 못 찾으면 시장 자체에 흥미를 잃고 계좌를 방치하는 게 진짜 위험이에요.",
    chemistry: "ESTJ·ENTJ처럼 실행이 빠른 유형과 짝을 이루면 '분석은 내가, 방아쇠는 네가' 구도로 최고의 시너지가 납니다. 아이디어를 검증해줄 토론 상대로는 같은 NT가 좋아요.",
  },
  ENTJ: {
    deepDive: "ENTJ에게 자산은 목표 달성의 수단이자 성과표입니다. '10년 안에 얼마'처럼 구체적 목표를 세우고 역산해서 연 수익률과 납입액을 도출하는 식의 접근이 자연스럽습니다. 시장을 이기려는 승부욕이 강해 공부량도 실행력도 상위권이지만, 그 승부욕이 때로 시장 앞에서의 겸손을 잊게 만듭니다.",
    stress: "손실을 '패배'로 받아들여 즉시 만회하려는 충동이 올라옵니다. 이때 베팅을 키우는 것이 ENTJ의 가장 위험한 순간 — 연속 손실 후에는 의도적으로 거래 규모를 줄이는 규칙이 필요합니다.",
    chemistry: "ISFJ·ISTJ처럼 신중하고 꼼꼼한 유형이 곁에 있으면 폭주를 막는 브레이크가 되어줍니다. 속도를 늦춰주는 파트너를 답답해하지 말고 리스크 관리자로 대우하세요.",
  },
  ENTP: {
    deepDive: "ENTP는 시장에서 '남들이 아직 못 본 것'을 찾는 데서 희열을 느낍니다. 새로운 산업, 새로운 자산군, 새로운 전략 — 항상 다음 아이디어가 대기 중이라 포트폴리오가 지루할 틈이 없습니다. 문제는 아이디어의 유통기한이 짧다는 것. 확신에 차 매수한 종목도 더 반짝이는 아이디어가 나타나면 애정이 식습니다.",
    stress: "손실 자체는 '데이터 하나 추가'로 받아들이는 대범함이 있지만, 지루함이 진짜 적입니다. 횡보장에서 자극을 찾아 불필요한 매매를 벌이다 계좌가 녹는 패턴을 조심하세요.",
    chemistry: "ISTJ·ISFJ처럼 원칙을 지키는 유형과 함께하면 아이디어가 시스템 위에서 안전하게 굴러갑니다. 아이디어 검증은 INTJ와, 실행 절제는 SJ 유형과 하는 게 이상적이에요.",
  },
  INFJ: {
    deepDive: "INFJ는 돈에도 의미를 부여하는 유형입니다. '무엇에 투자하는가'가 '얼마를 버는가'만큼 중요해서, 자신의 가치관과 어긋나는 기업은 수익성이 좋아도 마음이 불편합니다. 한번 신뢰한 기업과는 오래 가는 의리형 투자자 — 그 신뢰가 데이터 위에 서 있을 때 가장 강력합니다.",
    stress: "급락장에서 겉으론 조용하지만 내면의 소모가 큽니다. 특히 신념을 갖고 산 종목의 손실은 자기 판단 전체에 대한 회의로 번지기 쉬워요. '기업의 문제'와 '나의 문제'를 분리하는 연습이 필요합니다.",
    chemistry: "ESTP·ISTP처럼 숫자와 타이밍에 밝은 유형이 곁에 있으면 신념에 기술적 근거가 더해집니다. 가치관을 공유하는 NF 유형과는 투자 철학을 다듬는 대화가 잘 통해요.",
  },
  INFP: {
    deepDive: "INFP에게 투자는 자기다움을 지키면서 미래를 준비하는 수단입니다. 경쟁적으로 수익률을 좇기보다 '내 속도로, 내가 공감하는 방식으로'가 중요합니다. 시장의 소음에서 떨어져 있을 때 오히려 성과가 좋은 유형 — 단순하고 자동화된 구조가 INFP의 온화한 꾸준함을 복리로 바꿔줍니다.",
    stress: "손실이 나면 스스로를 탓하는 방향으로 스트레스가 흐릅니다. 계좌를 열어보기 싫어지고, 그렇게 방치가 길어질수록 불안도 커지는 악순환 — '15분만 보고 닫기' 같은 가벼운 점검 의식이 악순환을 끊어줍니다.",
    chemistry: "ESTJ·ENTJ처럼 구조를 잘 짜는 유형에게 시스템 설계를 맡기고 본인은 꾸준함을 담당하면 환상의 조합입니다. 감정을 나눌 수 있는 NF 동료도 투자 지속에 큰 힘이 돼요.",
  },
  ENFJ: {
    deepDive: "ENFJ는 투자마저 '함께'가 어울리는 유형입니다. 좋은 정보를 나누고, 주변의 재무 고민을 함께 풀어주는 과정에서 본인 공부도 깊어집니다. 가족의 미래, 부모님 노후 같은 '누군가를 위한 목적'이 붙을 때 가장 강한 지속력을 발휘합니다. 다만 타인의 확신에 전염되기 쉬운 것이 아킬레스건입니다.",
    stress: "손실이 나면 '나를 믿고 따라온 사람들'에 대한 미안함이 스트레스를 증폭시킵니다. 함께 투자한 상황일수록 냉정한 판단이 어려워져요. 공동 투자에는 처음부터 손절 기준을 문서로 합의해두세요.",
    chemistry: "INTP·INTJ처럼 데이터로 검증하는 유형이 곁에 있으면 '좋은 이야기'와 '좋은 투자'를 구분하는 필터가 생깁니다. 정보력과 분석력의 결합이라 서로에게 최고의 파트너예요.",
  },
  ENFP: {
    deepDive: "ENFP의 투자 여정은 롤러코스터처럼 다이내믹합니다. 어떤 달은 열정적으로 공부하고 어떤 달은 까맣게 잊는 — 그 낙차가 크지만, 특유의 낙관과 회복력 덕분에 실패해도 다시 일어나 시장에 돌아옵니다. 사람과 트렌드에 대한 감각이 뛰어나 '다음에 뜰 것'을 몸으로 먼저 느끼는 유형입니다.",
    stress: "급락장에서 처음엔 낙관('금방 회복하겠지')으로 버티다가, 한계점을 넘으면 갑자기 전량 매도하는 극단 전환이 나옵니다. 감정의 진폭을 시스템(자동 적립, 손실 한도)으로 눌러두는 게 핵심이에요.",
    chemistry: "ISTJ의 꾸준함은 ENFP에게 최고의 안전망입니다. 반짝이는 아이디어는 ENFP가, 그것의 생존 검증은 ISTJ·INTJ가 — 역할을 나누면 서로의 약점이 사라져요.",
  },
  ISTJ: {
    deepDive: "ISTJ는 투자 세계의 모범생입니다. 가계부, 매매 일지, 연간 계획 — 기록과 절차가 자연스럽고, 한 번 세운 원칙은 시장이 흔들려도 지킵니다. 화려한 수익률보다 '예측 가능한 우상향'을 원하며, 실제로 장기 성과는 이런 우직함에서 나옵니다. 다만 세상이 바뀌는 속도보다 원칙이 바뀌는 속도가 느린 게 유일한 약점입니다.",
    stress: "원칙대로 했는데 손실이 나는 상황을 가장 힘들어합니다. '절차가 옳았으면 결과도 옳아야 한다'는 기대가 무너질 때 혼란이 오죠. 원칙은 확률을 높일 뿐 결과를 보장하지 않는다는 걸 받아들이면 한층 단단해집니다.",
    chemistry: "ENFP·ENTP처럼 새 기회를 물어오는 유형과 함께하면 포트폴리오가 낡지 않습니다. 그들의 아이디어를 ISTJ의 검증 절차에 통과시키는 구도가 이상적이에요.",
  },
  ISFJ: {
    deepDive: "ISFJ의 투자는 '지킴'에서 출발합니다. 가족의 생활, 미래의 안정 — 지켜야 할 것이 분명하기에 무리한 베팅과는 거리가 멉니다. 눈에 띄지 않지만 저축률과 지출 관리 같은 기본기가 가장 탄탄한 유형이라, 여기에 최소한의 투자 지식만 더해져도 복리는 조용히 일을 시작합니다.",
    stress: "손실이 나면 '괜히 투자했나' 하는 후회와 자책이 먼저 옵니다. 불안을 혼자 삭이는 편이라 잘못된 상품에 물려도 말을 못 꺼내고 시간이 흐르기 쉬워요. 신뢰할 수 있는 한 사람과 정기적으로 계좌를 공유하는 것만으로 큰 방어막이 됩니다.",
    chemistry: "ENTJ·ESTJ처럼 목표와 구조를 세워주는 유형이 방향을 잡아주면, ISFJ의 성실함이 그 구조를 완성합니다. 서두르게 만드는 사람보다 차근차근 설명해주는 파트너를 곁에 두세요.",
  },
  ESTJ: {
    deepDive: "ESTJ는 자산 관리를 '경영'합니다. 목표, 예산, 점검 주기, 성과 평가 — 회사를 운영하듯 계좌를 운영하며, 이 체계성 덕분에 큰 사고가 드뭅니다. 숫자로 검증된 것만 신뢰하는 실용주의는 유행 테마의 거품을 걸러내는 훌륭한 필터지만, 때로 숫자에 아직 안 잡히는 초기 기회까지 걸러버립니다.",
    stress: "계획이 어긋나는 것 자체가 스트레스입니다. 하락장에서 '규칙을 갈아엎고 싶은 충동'이 올라오는데, 시장이 열려 있는 동안의 규칙 변경은 대부분 후회로 끝납니다. 변경은 주말에, 백테스트와 함께 — 이 한 줄이 ESTJ를 지킵니다.",
    chemistry: "INFP·INTP처럼 다른 각도에서 질문을 던지는 유형이 있으면 시스템의 사각지대가 보입니다. '왜 그 규칙이죠?'라는 물음을 귀찮아하지 말고 스트레스 테스트로 활용하세요.",
  },
  ESFJ: {
    deepDive: "ESFJ는 돈 이야기를 나눌 줄 아는 유형입니다. 재테크 스터디, 가족 재무회의처럼 함께 배우는 자리에서 에너지를 얻고, 실행력도 좋아 배운 것을 바로 옮깁니다. 주변을 잘 챙기는 만큼 '남들 다 하는 것'에 대한 안테나도 민감한데, 이 안테나가 정보 소스이자 동시에 리스크입니다.",
    stress: "손실이 나면 창피함이 먼저 옵니다. '다들 벌었다는데 나만…' 하는 비교가 스트레스의 핵심이라, 손실을 숨기고 혼자 해결하려다 골든타임을 놓치기 쉬워요. 수익률 비교를 끊는 것이 ESFJ 멘탈 관리의 절반입니다.",
    chemistry: "INTJ·ISTP처럼 유행과 거리를 두는 유형의 시선을 정기적으로 빌리세요. '그 상품, 구조 뜯어봤어?'라는 한마디가 수백만 원을 지켜줍니다.",
  },
  ISTP: {
    deepDive: "ISTP는 시장을 기계처럼 다룹니다. 차트, 지표, 자동화 도구 — 손에 잡히는 도구로 시장을 해부하고, 감정 없이 진입과 청산을 반복할 수 있는 드문 재능이 있습니다. 위기 상황에서 오히려 차분해지는 기질은 폭락장에서 진가를 발휘합니다. 다만 흥미가 식으면 그 훌륭한 시스템째로 방치되는 게 문제입니다.",
    stress: "손실에 대한 감정 동요는 적지만, '내 시스템이 고장났다'고 판단되면 흥미를 잃고 떠나버립니다. 시스템 수리 자체를 새 프로젝트로 삼으면 이탈 없이 오래 갈 수 있어요.",
    chemistry: "ENFJ·ESFJ처럼 꾸준히 안부를 묻는 유형이 곁에 있으면 방치 구간이 짧아집니다. 장기 계좌 관리처럼 지루한 부분은 SJ 유형의 도움을 받는 것도 방법이에요.",
  },
  ISFP: {
    deepDive: "ISFP는 숫자보다 감각으로 세상을 읽습니다. 매장의 활기, 제품의 완성도, 브랜드의 결 — 애널리스트 보고서보다 먼저 소비 현장의 변화를 알아채는 눈이 있습니다. 이 감각이 재무 확인 습관과 만나면 생활 속 종목 발굴이라는 강력한 무기가 됩니다. 투자를 스트레스가 아닌 취향의 연장으로 만드는 것이 ISFP의 길입니다.",
    stress: "시장이 험악해지면 아예 쳐다보지 않는 회피가 기본 반응입니다. 문제는 회피 중에도 손실은 자라난다는 것 — 자동 적립과 분기 1회 15분 점검처럼 '안 봐도 굴러가는 구조'가 최고의 처방입니다.",
    chemistry: "ENTJ·ESTJ가 만든 시스템 안에서 ISFP의 감각이 종목 아이디어로 흐르면 이상적입니다. 감각을 존중해주면서 숫자 확인을 도와줄 파트너를 찾으세요.",
  },
  ESTP: {
    deepDive: "ESTP는 시장이라는 링 위의 파이터입니다. 변동성은 위험이 아니라 기회이고, 빠른 판단과 실행은 타고났습니다. 백 번의 시뮬레이션보다 한 번의 실전에서 더 많이 배우는 유형이라 경험 축적 속도가 압도적입니다. 관건은 그 배짱에 규율이라는 고삐를 채울 수 있느냐 — 채우면 프로, 못 채우면 도박꾼이 됩니다.",
    stress: "손실에는 강하지만 '기회를 놓치는 것'에 약합니다. 지루한 횡보장이 ESTP의 진짜 시련 — 없는 기회를 억지로 만들다 계좌가 상합니다. 거래가 없는 날을 '규율 승리의 날'로 기록해보세요.",
    chemistry: "INTJ·ISTJ처럼 큰 그림과 원칙을 챙기는 유형이 뒤에 있으면 단기 매매가 장기 자산으로 연결됩니다. 수익의 일부를 그들이 관리하는 장기 계좌로 흘려보내는 구조를 추천해요.",
  },
  ESFP: {
    deepDive: "ESFP에게 투자는 삶을 더 즐겁게 만드는 도구여야 합니다. 딱딱한 재무 이론보다 '오늘 산 주식이 내일 오르는' 생생한 경험으로 배우고, 그 에너지로 주변까지 투자에 입문시키는 전파력이 있습니다. 즐거움과 규율이 공존하는 구조만 만들면, 특유의 낙관은 장기 투자에서 대단한 자산이 됩니다.",
    stress: "손실을 심각하게 오래 붙들지 않는 대신, '잊기로 결정'하고 방치하는 쪽으로 흐릅니다. 그 사이 소비는 그대로라 자산이 양쪽에서 새는 게 최악의 시나리오 — 선저축 자동이체가 방파제입니다.",
    chemistry: "ISTJ·ISFJ처럼 묵묵히 챙겨주는 유형과 함께하면 즐거움은 유지하면서 구멍이 메워집니다. 반대로 ESTP와 붙으면 서로 부추겨 화끈하게 달리다 같이 다치기 쉬우니 주의하세요.",
  },
};

interface InvestDetail {
  marketCondition: string;
  similarInvestor: string;
}

// 투자 상세 — 앞 3글자(수익/리스크/기간) 기준 8종. 4번째 글자(D/F)는 divNote로 보정.
const INVEST_DETAIL: Record<string, InvestDetail> = {
  GRL: {
    marketCondition: "저금리 유동성 장세와 기술 혁신 사이클 구간에서 폭발적 성과. 금리 인상기에는 성장주 밸류에이션 압박으로 고전.",
    similarInvestor: "캐시 우드(ARK) · 피터 린치(성장주 발굴)",
  },
  GRT: {
    marketCondition: "변동성 높은 시장(VIX 20 이상)과 어닝 시즌·이벤트 구간이 주 무대.",
    similarInvestor: "조지 소로스(반사성) · 폴 튜더 존스(추세추종)",
  },
  GSL: {
    marketCondition: "전반적 우상향 장세와 배당 안정 구간에서 최고 성과. 10년 이상 장기에서 복리 효과 극대화.",
    similarInvestor: "워런 버핏(초기 스타일) · 존 보글(인덱스 장기)",
  },
  GST: {
    marketCondition: "횡보장과 변동성 낮은 환경에서 상대적 강점. 배당·실적 발표 시즌에 기회 극대화.",
    similarInvestor: "제프리 건들락(리스크 대비 수익) · 빌 밀러(이벤트 활용)",
  },
  VRL: {
    marketCondition: "성장주 버블 붕괴 후 가치주 리밸런싱 구간과 금리 상승 환경, 경기 회복 초입에서 두각.",
    similarInvestor: "벤저민 그레이엄 · 세스 클라만",
  },
  VRT: {
    marketCondition: "위기·공황 국면 직후의 V자 반등 구간에서 폭발적 수익.",
    similarInvestor: "존 템플턴(위기 역매수) · 하워드 막스(2단계 사고)",
  },
  VSL: {
    marketCondition: "금리 안정·하향 환경과 경기 확장 국면. 배당 재투자 복리는 10년 이상에서 극대화.",
    similarInvestor: "존 D. 록펠러(배당 인컴) · 켄 피셔(방어적 성장)",
  },
  VST: {
    marketCondition: "고금리 환경(기준금리 4% 이상)에서 단기채 매력 극대화. 극도의 불확실성 구간에서 상대적 강점.",
    similarInvestor: "하워드 막스(리스크 관리 철학)",
  },
};

/** 성격 코드 × 투자 코드 조합에서 뽑는 맞춤 인사이트 (1~3줄) */
function comboInsights(p: string, i: string): string[] {
  const out: string[] = [];
  if (p.includes("J") && i[2] === "L") out.push("계획형(J) 성격과 장기투자(L) 성향이 맞물려, 한번 세운 전략을 오래 끌고 가는 힘이 있어요.");
  if (p.includes("P") && i[2] === "T") out.push("유연한(P) 기질에 단기 매매(T) 성향이 더해져 순발력은 좋지만, 매매 규칙을 문서로 못 박아두는 게 안전해요.");
  if (p.includes("P") && i[2] === "L") out.push("즉흥적(P) 기질인데 투자만큼은 길게 보는 편 — 적립을 자동화하면 최고의 조합이 돼요.");
  if (p.includes("J") && i[2] === "T") out.push("계획형(J)이 단기 매매(T)를 할 땐 진입·청산 규칙을 정교하게 — 절제된 트레이딩이 가능한 조합이에요.");
  if (p.includes("T") && i[1] === "S") out.push("냉철한 사고(T)에 안전 중시(S)까지 — 검증된 기회에만 움직여 큰 실수가 드문 조합이에요.");
  if (p.includes("F") && i[1] === "R") out.push("감정(F)형이 높은 리스크(R)를 안고 가면 급락기에 심리 소모가 커요 — 손실 한도를 미리 정해두세요.");
  if (p.includes("E") && i[3] === "F") out.push("외향(E)형의 집중투자(F)는 주변 이야기에 확신이 증폭되기 쉬워요 — 매수 근거를 스스로 세 줄로 적어보세요.");
  if (p.includes("I") && i[3] === "D") out.push("내향(I)형의 분산(D) 전략은 조용히 오래 가는 힘이 있어요 — 자동화하면 더 단단해져요.");
  return out.slice(0, 3);
}

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
  const pMore = hasPersonality ? PERSONALITY_MORE[pCode] : undefined;

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
              {pMore && (
                <p className="mt-2.5 pl-3 text-[14px] leading-relaxed text-gray-300">{pMore.deepDive}</p>
              )}
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

            {pMore && (
              <div className="rounded-xl border border-slate-600/50 bg-slate-700/40 p-4">
                <SectionHeader emoji="📉" title="손실 앞에서 나는" className={theme.text} />
                <p className="text-[14px] leading-relaxed text-gray-200">{pMore.stress}</p>
              </div>
            )}

            {pMore && (
              <div className="rounded-xl border border-slate-600/50 bg-slate-700/40 p-4">
                <SectionHeader emoji="🤝" title="함께 투자하면 좋은 유형" className={theme.text} />
                <p className="text-[14px] leading-relaxed text-gray-200">{pMore.chemistry}</p>
              </div>
            )}

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

          {/* 투자 상세 (앞 3글자 기준 + 분산/집중 보정) */}
          {INVEST_DETAIL[iCode.slice(0, 3)] && (
            <div className="mt-4 space-y-3 border-t border-slate-600/50 pt-4">
              <div>
                <SectionHeader emoji="🌍" title="유리한 시장 환경" className="text-pink-300" />
                <p className="text-[14px] leading-relaxed text-gray-200">
                  {INVEST_DETAIL[iCode.slice(0, 3)].marketCondition}
                </p>
              </div>
              <div>
                <SectionHeader emoji="🏆" title="닮은 투자 대가" className="text-pink-300" />
                <p className="text-[14px] leading-relaxed text-gray-200">
                  {INVEST_DETAIL[iCode.slice(0, 3)].similarInvestor}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 성격 × 투자 조합 인사이트 */}
        {hasPersonality && comboInsights(pCode, iCode).length > 0 && (
          <div className={`rounded-xl border p-4 border-slate-600/50 bg-gradient-to-br ${theme.hero} to-slate-800/40`}>
            <SectionHeader emoji="🧩" title={`${pCode} × ${iName} 조합`} className={theme.text} />
            <div className="space-y-2">
              {comboInsights(pCode, iCode).map((line, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <span className={`mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full ${theme.bar}`} />
                  <p className="text-[14px] leading-relaxed text-gray-200">{line}</p>
                </div>
              ))}
            </div>
          </div>
        )}

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
