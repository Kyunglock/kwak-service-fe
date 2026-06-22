import { Award, GraduationCap, FileText, Briefcase, Code } from "lucide-react";
import { ResumeHeader } from "@/app/pages/components/ResumeHeader";
import { Section } from "@/app/pages/components/Section";
import { Experience } from "@/app/pages/components/Experience";
export default function Resume() {
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
      <div className="px-8 py-6 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
        <div className="mb-3 inline-block bg-green-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
          백엔드 개발자 지원
        </div>
        <p className="text-gray-700 leading-relaxed">
          공공기관 프로젝트를 전문으로 수행하는 SI/SM 기업에서 8년 6개월간
          근무한 풀스택 개발자입니다. Java/Spring 기반 백엔드부터 Vue 3
          프론트엔드까지 담당하며 요구사항 분석·설계·개발·운영 전 과정에
          참여해왔습니다. JSP 기반 레거시 시스템의 Spring Boot MSA 아키텍처 전환
          프로젝트에 참여하였으며, Oracle·Tibero 등 이기종 DBMS 환경에서의 운영
          및 쿼리 최적화 경험을 보유하고 있습니다. 17개 시도 서버 단독 운영,
          300만 건 콘텐츠 쿼리 최적화 등 기술적 문제를 해결해왔으며, 자동화 검사
          파이프라인 설계·구축, 공통 모듈 개발과 문서화, 신입 개발자 멘토링을
          통해 팀 전체의 개발 효율 향상에 기여해왔습니다.
        </p>
      </div>

      <div className="px-8 py-8">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Career Summary */}
          <Section title="경력 요약" icon={<Briefcase className="size-5" />}>
            <div className="rounded-lg p-6 border border-green-200">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    (주) 퓨전소프트
                  </h3>
                  <p className="text-green-700 font-semibold mt-1">
                    개발팀 / 선임 (팀 내 기술 리드)
                  </p>
                </div>
                <div className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  8년 6개월
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-3">2017.10 - 재직중</p>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>Spring Boot / Vue 3 기반 풀스택 개발</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>공공기관 웹 시스템 SI/SM</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>레거시 시스템 현대화 (JSP → Vue3)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>주니어 개발자 멘토링 (코드 리뷰, 기술 가이드)</span>
                </div>
              </div>
            </div>
          </Section>

          {/* Education */}
          <Section title="학력" icon={<GraduationCap className="size-5" />}>
            <div className="rounded-lg p-6 border border-emerald-200">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                계명대학교
              </h3>
              <p className="text-emerald-700 font-semibold mb-3">
                컴퓨터공학과
              </p>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>재학기간</span>
                  <span className="font-semibold">2012.02 ~ 2018.03</span>
                </div>
                <div className="flex justify-between">
                  <span>졸업</span>
                  <span className="font-semibold">2017.02</span>
                </div>
                <div className="flex justify-between">
                  <span>학점</span>
                  <span className="font-semibold">3.5 / 4.5</span>
                </div>
              </div>
            </div>
          </Section>
        </div>

        {/* Technical Skills */}
        <Section title="보유 기술 스택" icon={<Code className="size-5" />}>
          <div className="grid md:grid-cols-2 gap-4">
            {/* Backend */}
            <div className="rounded-lg p-5 border border-blue-200">
              <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                Backend
              </h4>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-white rounded-full text-sm border border-blue-200 text-gray-700">
                  Java
                </span>
                <span className="px-3 py-1 bg-white rounded-full text-sm border border-blue-200 text-gray-700">
                  Spring Boot
                </span>
                <span className="px-3 py-1 bg-white rounded-full text-sm border border-blue-200 text-gray-700">
                  Spring Framework
                </span>
                <span className="px-3 py-1 bg-white rounded-full text-sm border border-blue-200 text-gray-700">
                  Gradle
                </span>
                <span className="px-3 py-1 bg-white rounded-full text-sm border border-blue-200 text-gray-700">
                  Maven
                </span>
                <span className="px-3 py-1 bg-white rounded-full text-sm border border-blue-200 text-gray-700">
                  Docker
                </span>
                <span className="px-3 py-1 bg-white rounded-full text-sm border border-blue-200 text-gray-700">
                  Lombok
                </span>
                <span className="px-3 py-1 bg-white rounded-full text-sm border border-blue-200 text-gray-700">
                  Redis
                </span>
                <span className="px-3 py-1 bg-white rounded-full text-sm border border-blue-200 text-gray-700">
                  MSA
                </span>
                <span className="px-3 py-1 bg-white rounded-full text-sm border border-blue-200 text-gray-700">
                  Mybatis
                </span>
                <span className="px-3 py-1 bg-white rounded-full text-sm border border-blue-200 text-gray-700">
                  FastAPI
                </span>
              </div>
            </div>

            {/* Frontend */}
            <div className="rounded-lg p-5 border border-purple-200">
              <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                Frontend
              </h4>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-white rounded-full text-sm border border-purple-200 text-gray-700">
                  Vue.js
                </span>
                <span className="px-3 py-1 bg-white rounded-full text-sm border border-purple-200 text-gray-700">
                  React
                </span>
                <span className="px-3 py-1 bg-white rounded-full text-sm border border-purple-200 text-gray-700">
                  JavaScript
                </span>
                <span className="px-3 py-1 bg-white rounded-full text-sm border border-purple-200 text-gray-700">
                  JSP
                </span>
              </div>
            </div>

            {/* Database */}
            <div className="rounded-lg p-5 border border-orange-200">
              <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-orange-600 rounded-full"></span>
                Database
              </h4>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-white rounded-full text-sm border border-orange-200 text-gray-700">
                  MySQL
                </span>
                <span className="px-3 py-1 bg-white rounded-full text-sm border border-orange-200 text-gray-700">
                  Oracle
                </span>
                <span className="px-3 py-1 bg-white rounded-full text-sm border border-orange-200 text-gray-700">
                  Cubrid
                </span>
                <span className="px-3 py-1 bg-white rounded-full text-sm border border-orange-200 text-gray-700">
                  DB2
                </span>
                <span className="px-3 py-1 bg-white rounded-full text-sm border border-orange-200 text-gray-700">
                  Tibero
                </span>
              </div>
            </div>

            {/* DevOps & Tools */}
            <div className="rounded-lg p-5 border border-green-200">
              <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                DevOps & Tools
              </h4>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-white rounded-full text-sm border border-green-200 text-gray-700">
                  Git
                </span>
                <span className="px-3 py-1 bg-white rounded-full text-sm border border-green-200 text-gray-700">
                  Linux
                </span>
                <span className="px-3 py-1 bg-white rounded-full text-sm border border-green-200 text-gray-700">
                  Windows Server
                </span>
                <span className="px-3 py-1 bg-white rounded-full text-sm border border-green-200 text-gray-700">
                  Apache JMeter
                </span>
                <span className="px-3 py-1 bg-white rounded-full text-sm border border-green-200 text-gray-700">
                  Puppeteer
                </span>
              </div>
            </div>
          </div>
        </Section>

        {/* Certification */}
        <Section title="자격증" icon={<Award className="size-5" />}>
          <div className="flex flex-wrap gap-4">
            <div className="bg-amber-50 rounded-lg px-6 py-4 border border-amber-200 flex items-center gap-3">
              <Award className="size-6 text-amber-600" />
              <span className="font-semibold text-gray-900">정보처리기사</span>
            </div>
          </div>
        </Section>
      </div>
    </>
  );
}
