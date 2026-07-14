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
