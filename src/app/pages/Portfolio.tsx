import { ExternalLink, Calendar, Code2, Lightbulb } from "lucide-react";
import { ResumeHeader } from "@/app/pages/components/ResumeHeader";
import { Section } from "@/app/pages/components/Section";

// Import project images
const mainScreen = "/images/39aa4891762330d4e0ace7e8322a2b3b1ec79403.png";
const menuScreen = "/images/ab31dd56c592c4f6bc638959a1235affb4c03b81.png";
const portfolioScreen = "/images/7a4aa1ef7dbb799827854bcdc9a77cba82384b54.png";
const analysisScreen = "/images/a806d615804b9680198ffb8857c031da6f844226.png";
const surveyScreen = "/images/aa6fdbdace06f6f60f609bb997e72114ee5a8337.png";
const statisticsScreen = "/images/c541bf57f26b83f060f707971eb559c61bfb927b.png";
const insightScreen = "/images/783b7657dc1d0f8d8d7b83e96818cc4e5e9df200.png";
const expertScreen = "/images/75524bd7389e11a93bb6f77e170684759c110555.png";

export default function Portfolio() {
  return (
    <>
      {/* Header */}
      <ResumeHeader
        name="곽경록"
        englishName="Kwak Kyung-roak"
        email="kyungroak@gmail.com"
        phone="010-6390-8007"
        birthYear="1993년생"
        summary="MSA·클라우드 운영 경험으로 서비스를 설계합니다."
      />

      {/* Summary */}
      <div className="px-8 py-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
        <p className="text-gray-700 leading-relaxed mb-2">
          개인 프로젝트로 진행한{" "}
          <strong>투자 성향 기반 S&P500 종목 추천 서비스</strong>를 소개합니다.
        </p>
        <a
          href="http://kyungroak.iptime.org"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-green-700 hover:text-green-800 font-semibold text-sm transition-colors"
        >
          <ExternalLink className="size-4" />
          포트폴리오 바로가기: http://kyungroak.iptime.org
        </a>
        <a
          href="https://marsh-bonsai-001.notion.site/32fb856bba6780a0849fe5eff08f4256"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-green-700 hover:text-green-800 font-semibold text-sm transition-colors"
        ></a>
      </div>

      <div className="px-8 py-6">
        {/* Project Overview */}
        <Section
          title="주식 나침반 - S&P 500 종목 기반 포트폴리오 관리"
          icon={<Lightbulb className="size-5" />}
        >
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              프로젝트 개요
            </h3>
            <p className="text-gray-700 leading-relaxed mb-3 text-sm">
              개인 투자자의 성향과 시장 이슈를 결합하여, 미국 주식시장(S&P500)
              내에서 맞춤형 종목을 자동 추천하는 서비스입니다. AI 설문 생성과
              투자 성향 분석을 통해 개인 맞춤형 투자 인사이트를 제공합니다.
            </p>

            <div className="grid md:grid-cols-2 gap-3 mt-4">
              <div className="bg-white rounded-lg p-3 border border-blue-200">
                <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2 text-sm">
                  <Code2 className="size-4 text-blue-600" />
                  기술 스택
                </h4>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                    Spring Boot
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                    Gradle
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                    FastAPI
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                    React
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                    MySQL
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                    Redis
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                    OAuth2
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                    JWT
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                    Swagger UI
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-lg p-3 border border-blue-200">
                <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2 text-sm">
                  <Calendar className="size-4 text-blue-600" />
                  아키텍처 & 인프라
                </h4>
                <div className="space-y-1">
                  <p className="text-gray-700 text-sm">
                    <strong>아키텍처:</strong> 멀티모듈 마이크로서비스
                  </p>
                  <p className="text-gray-700 text-sm">
                    <strong>인증:</strong> OAuth2 소셜 로그인 + JWT 세션관리
                  </p>
                  <p className="text-gray-700 text-sm">
                    <strong>배포:</strong> 홈서버 운영
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Key Features */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3">
              주요 기능 및 차별점
            </h3>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="rounded-lg p-3 border border-green-200">
                <h4 className="font-bold text-green-900 mb-1 text-sm">
                  AI 기반 투자 설문 생성
                </h4>
                <p className="text-xs text-gray-700">
                  시장 요약을 기반으로 사용자의 투자 반응을 측정할 수 있는 AI
                  자동 설문지 생성
                </p>
              </div>

              <div className="rounded-lg p-3 border border-green-200">
                <h4 className="font-bold text-green-900 mb-1 text-sm">
                  투자자 인사이트 제공
                </h4>
                <p className="text-xs text-gray-700">
                  전체 사용자 설문 응답을 통계적으로 집계하여 시각화 대시보드
                  형태로 제공
                </p>
              </div>

              <div className="rounded-lg p-3 border border-green-200">
                <h4 className="font-bold text-green-900 mb-1 text-sm">
                  OAuth2 소셜 로그인
                </h4>
                <p className="text-xs text-gray-700">
                  소셜 계정 연동을 통한 간편 로그인, JWT 토큰 기반 세션 관리로
                  보안성 강화
                </p>
              </div>

              <div className="rounded-lg p-3 border border-teal-200">
                <h4 className="font-bold text-teal-900 mb-1 text-sm">
                  마이크로서비스 아키텍처
                </h4>
                <p className="text-xs text-gray-700">
                  멀티모듈 구조로 설계하여 서비스별 독립 배포 및 확장성 확보,
                  Redis를 활용한 캐싱
                </p>
              </div>

              {/* 전설 투자자 포트폴리오 */}
              <div className="rounded-lg p-3 border border-teal-200">
                <h4 className="font-bold text-teal-900 mb-1 text-sm">
                  전설 투자자 포트폴리오 추적
                </h4>
                <p className="text-xs text-gray-700">
                  SEC 13F 공시 기반으로 워런 버핏 등 유명 투자자의 분기별 보유
                  종목 변화를 시각화
                </p>
              </div>

              {/* 포트폴리오 자산 배분 시각화 */}
              <div className="rounded-lg p-3 border border-green-200">
                <h4 className="font-bold text-green-900 mb-1 text-sm">
                  포트폴리오 자산 배분 시각화
                </h4>
                <p className="text-xs text-gray-700">
                  보유 종목 및 섹터별 비중을 차트로 시각화하고 USD/KRW 멀티 통화
                  기준 손익 현황 제공
                </p>
              </div>
            </div>
          </div>

          {/* Technical Decisions & Challenges */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3">
              기술적 결정과 도전 과정
            </h3>

            {/* MVP 핵심 집중 영역 */}
            <div className="mb-4 bg-blue-50 rounded-xl p-4 border border-blue-200">
              <h4 className="font-bold text-blue-900 mb-2 text-sm">
                MVP 개발 시 집중한 핵심 문제
              </h4>
              <p className="text-xs text-gray-700 leading-relaxed mb-2">
                이 서비스를 기획할 때 핵심으로 생각한 건{" "}
                <strong>설문 기반 투자 성향 분석 파이프라인</strong>이었습니다.
                단순히 주식 정보를 보여주는 앱이 아니라, "시장 이슈 → 개인화
                설문 → 응답 수집 → 통계 집계 → 인사이트 제공"으로 이어지는
                플로우가 이 서비스의 핵심 가치라고 판단해, MVP에서 이 흐름을
                먼저 완성하는 데 집중했습니다.
              </p>
              <ul className="text-xs text-gray-700 space-y-1 list-disc list-inside">
                <li>
                  설문 → 통계 → 인사이트로 이어지는 데이터 흐름을 MVP 범위
                  내에서 완성
                </li>
                <li>
                  포트폴리오 손익 계산은 환율 변동을 반영한 USD/KRW 멀티 통화
                  기준을 초기부터 설계
                </li>
                <li>
                  Spring Boot ↔ FastAPI 서비스 간 내부 API 통신 구조를 초기에
                  확립하여 확장 기반 마련
                </li>
              </ul>
            </div>

            {/* 스택 선택 이유 */}
            <div className="mb-4 bg-purple-50 rounded-xl p-4 border border-purple-200">
              <h4 className="font-bold text-purple-900 mb-2 text-sm">
                익숙하지 않은 스택을 선택한 이유
              </h4>
              <p className="text-xs text-gray-700 leading-relaxed">
                평소 Spring Boot 기반 백엔드 개발에 익숙했지만, 이
                프로젝트에서는 의도적으로 React와 FastAPI를 선택했습니다.
                주가·포트폴리오 손익·설문 통계처럼 동적으로 변하는 데이터를
                다루는 UI를 직접 만들어보고 싶었고, 서버사이드 렌더링으로는
                한계가 있다고 판단해 React를 선택했습니다. FastAPI는 Python의
                데이터 처리 생태계를 활용해보고 싶은 것도 있었고, Spring Boot와
                역할을 분리하는 MSA 구조를 직접 설계해보는 것 자체가
                목표였습니다. 익숙하지 않은 스택을 쓰면서 어려운 점도 있었지만,
                각 기술이 어떤 상황에 적합한지 직접 체감할 수 있었습니다.
              </p>
            </div>

            {/* 기술적 어려움과 해결 */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <h4 className="font-bold text-gray-900 mb-3 text-sm">
                기술적 어려움과 해결 과정
              </h4>
              <div className="space-y-3">
                <div className="border-l-4 border-red-400 pl-3">
                  <p className="text-xs font-bold text-gray-800 mb-0.5">
                    고민: MSA 도메인 경계 설정
                  </p>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    MSA로 구성하기로 했을 때 가장 먼저 막힌 부분은{" "}
                    <strong className="text-gray-800">
                      어떤 기준으로 서비스를 나눠야 하는가
                    </strong>
                    였습니다. 처음엔 기능 단위로 쪼개려 했지만, 너무 잘게 나누면
                    서비스 간 호출이 복잡해지고 오히려 관리가 어려워졌습니다.
                    결국 비즈니스 도메인(공통 모듈 유틸, 포털, 설문조사 서비스,
                    종목 추천 서비스) 기준으로 경계를 정하고, 각 서비스가
                    독립적으로 배포·운영될 수 있도록 설계했습니다.
                  </p>
                </div>
                <div className="border-l-4 border-yellow-400 pl-3">
                  <p className="text-xs font-bold text-gray-800 mb-0.5">
                    고민: RESTful API 설계와 서비스 간 연동
                  </p>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    서비스가 분리되다 보니{" "}
                    <strong className="text-gray-800">
                      API 설계 일관성과 서비스 간 호출 방식
                    </strong>
                    을 어떻게 가져갈지 고민이 많았습니다. 각 서비스의 API 스펙을
                    Swagger UI로 문서화하고, 서비스 간 통신은 내부 REST 호출로
                    명확히 정의해 의존 관계를 단방향으로 유지했습니다. 인증의
                    경우 공통 auth 모듈을 분리하고 Redis 기반 토큰 블랙리스트를
                    도입해 각 서비스에서 중복 없이 처리했습니다.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Screenshots */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 mb-3">화면 구성</h3>

            {/* All screens in 2 columns */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Main Screen */}
              <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-2">
                  <h4 className="text-sm font-bold text-white">로그인 화면</h4>
                </div>
                <div className="p-3">
                  <div className="mb-2 rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={mainScreen}
                      alt="로그인 화면"
                      className="w-full h-auto"
                    />
                  </div>
                  <p className="text-gray-700 text-xs">
                    <strong>주요 기능:</strong> 사용자 인증 및 로그인
                  </p>
                </div>
              </div>

              {/* Menu Screen */}
              <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2">
                  <h4 className="text-sm font-bold text-white">메뉴 화면</h4>
                </div>
                <div className="p-3">
                  <div className="mb-2 rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={menuScreen}
                      alt="메뉴 화면"
                      className="w-full h-auto"
                    />
                  </div>
                  <p className="text-gray-700 text-xs">
                    <strong>주요 기능:</strong> 종목, 분석, 설문, 통계, 인사이트
                    등 주요 기능 접근
                  </p>
                </div>
              </div>

              {/* Portfolio Screen */}
              <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-gradient-to-r from-teal-600 to-cyan-600 px-4 py-2">
                  <h4 className="text-sm font-bold text-white">
                    내 포트폴리오
                  </h4>
                </div>
                <div className="p-3">
                  <div className="mb-2 rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={portfolioScreen}
                      alt="포트폴리오 화면"
                      className="w-full h-auto"
                    />
                  </div>
                  <p className="text-gray-700 text-xs">
                    <strong>주요 기능:</strong> 보유 종목 현황, 총 자산,
                    수익률을 실시간 확인
                  </p>
                </div>
              </div>

              {/* Analysis Screen */}
              <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-gradient-to-r from-green-700 to-emerald-700 px-4 py-2">
                  <h4 className="text-sm font-bold text-white">자산 분석</h4>
                </div>
                <div className="p-3">
                  <div className="mb-2 rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={analysisScreen}
                      alt="자산 분석 화면"
                      className="w-full h-auto"
                    />
                  </div>
                  <p className="text-gray-700 text-xs">
                    <strong>주요 기능:</strong> 총 자산 및 종목별 비중을 차트로
                    시각화
                  </p>
                </div>
              </div>

              {/* Survey Screen */}
              <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-gradient-to-r from-emerald-700 to-green-700 px-4 py-2">
                  <h4 className="text-sm font-bold text-white">
                    투자 설문 - AI 자동 생성
                  </h4>
                </div>
                <div className="p-3">
                  <div className="mb-2 rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={surveyScreen}
                      alt="투자 설문 화면"
                      className="w-full h-auto"
                    />
                  </div>
                  <p className="text-gray-700 text-xs">
                    <strong>주요 기능:</strong> AI를 활용한 시장 동향 기반 투자
                    설문
                  </p>
                </div>
              </div>

              {/* Statistics Screen */}
              <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-gradient-to-r from-teal-700 to-emerald-700 px-4 py-2">
                  <h4 className="text-sm font-bold text-white">설문 통계</h4>
                </div>
                <div className="p-3">
                  <div className="mb-2 rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={statisticsScreen}
                      alt="설문 계 화면"
                      className="w-full h-auto"
                    />
                  </div>
                  <p className="text-gray-700 text-xs">
                    <strong>주요 기능:</strong> 전체 사용자 설문 응답 집계 및
                    투자 트렌드 파악
                  </p>
                </div>
              </div>

              {/* Insight Screen */}
              <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-gradient-to-r from-green-600 to-teal-600 px-4 py-2">
                  <h4 className="text-sm font-bold text-white">
                    투자자 인사이트
                  </h4>
                </div>
                <div className="p-3">
                  <div className="mb-2 rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={insightScreen}
                      alt="투자자 인사이트 화면"
                      className="w-full h-auto"
                    />
                  </div>
                  <p className="text-gray-700 text-xs">
                    <strong>주요 기능:</strong> 투자 성향 분석 및 리스크 허용도
                    시각화
                  </p>
                </div>
              </div>

              {/* Expert Portfolio Screen */}
              <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-gradient-to-r from-emerald-600 to-green-600 px-4 py-2">
                  <h4 className="text-sm font-bold text-white">
                    투자 대가 포트폴리오
                  </h4>
                </div>
                <div className="p-3">
                  <div className="mb-2 rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={expertScreen}
                      alt="투자 대가 포트폴리오 화면"
                      className="w-full h-auto"
                    />
                  </div>
                  <p className="text-gray-700 text-xs">
                    <strong>주요 기능:</strong> 워렌 버핏 등 유명 투자자
                    포트폴리오 확인
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Expected Outcomes */}
          {/* <div className="mt-6 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-5 text-white">
            <h3 className="text-lg font-bold mb-4">프로젝트 기대 효과</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-bold text-sm mb-1">맞춤형 투자 경험</h4>
                <p className="text-green-100 text-xs">
                  개인 투자 성향에 맞는 S&P500 종목 자동 추천으로 투자 의사결정
                  지원
                </p>
              </div>
              <div>
                <h4 className="font-bold text-sm mb-1">시장 이해도 향상</h4>
                <p className="text-green-100 text-xs">
                  매일 아침 시장 요약을 통해 미국 주식시장 동향 파악
                </p>
              </div>
              <div>
                <h4 className="font-bold text-sm mb-1">참여형 투자 문화</h4>
                <p className="text-green-100 text-xs">
                  사용자 설문 통계 공유를 통한 투자자 커뮤니티 형성
                </p>
              </div>
              <div>
                <h4 className="font-bold text-sm mb-1">AI 기술 활용</h4>
                <p className="text-green-100 text-xs">
                  로컬 LLM을 활용한 설문 자동 생성 및 투자 분석 자동화
                </p>
              </div>
            </div>
          </div> */}
        </Section>
      </div>
    </>
  );
}
