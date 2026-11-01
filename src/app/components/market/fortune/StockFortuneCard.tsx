import { useState } from "react";
import { AxiosError } from "axios";
import { getFortune } from "@/app/services/fortuneService";
import type { ApiResponse, FortuneResponse } from "@/app/types";
import { FORTUNE_TONES } from "@/app/theme/featurePalettes";

/**
 * 종목운세 카드 — 티커 입력 → (종목, 오늘)당 1건 전역 공유 운세 표시.
 * 최초 요청은 동기 LLM 생성이라 수십 초 걸릴 수 있어 로딩 상태를 유지한다.
 */
export function StockFortuneCard() {
  const [ticker, setTicker] = useState("");
  const [loading, setLoading] = useState(false);
  const [fortune, setFortune] = useState<FortuneResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    const input = ticker.trim().toUpperCase();
    if (!input || loading) return;
    setLoading(true);
    setError(null);
    setFortune(null);
    getFortune(input)
      .then((res) => {
        setFortune((res.data as ApiResponse<FortuneResponse>).data);
      })
      .catch((err: AxiosError<{ errorCode?: string; message?: string }>) => {
        const code = err.response?.data?.errorCode;
        if (code === "TICKER_NOT_FOUND") {
          setError("지원하지 않는 종목입니다. 티커 또는 정확한 종목명을 확인해주세요. (예: AAPL, 삼성전자)");
        } else {
          setError(
            err.response?.data?.message ??
              "운세를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.",
          );
        }
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className={`rounded-xl border ${FORTUNE_TONES.border} bg-card p-6 shadow-paper`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-2xl">🔮</span>
        <h3 className={`text-xl font-bold ${FORTUNE_TONES.title}`}>종목운세</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-5">
        궁금한 종목의 오늘 기운을 점쳐드립니다. 같은 종목의 운세는 오늘 하루 모두에게 동일합니다.
      </p>

      <div className="flex gap-2 mb-4">
        <input
          value={ticker}
          onChange={(e) => setTicker(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="티커 또는 종목명 (예: AAPL, 삼성전자)"
          disabled={loading}
          className={`min-w-0 flex-1 rounded-lg border border-border bg-card px-3 py-2 text-foreground placeholder-faint-foreground ${FORTUNE_TONES.focus} focus:outline-none disabled:opacity-50`}
        />
        <button
          onClick={handleSubmit}
          disabled={loading || !ticker.trim()}
          className={`shrink-0 whitespace-nowrap rounded-lg ${FORTUNE_TONES.button} px-4 py-2 font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40`}
        >
          운세 보기
        </button>
      </div>

      {loading && (
        <div className={`flex flex-col items-center gap-3 py-10 ${FORTUNE_TONES.title}`}>
          <span className="animate-bounce text-4xl">🔮</span>
          <p className="animate-pulse text-sm">
            수정구슬을 들여다보는 중... 처음 보는 종목은 시간이 조금 걸려요 (최대 2분)
          </p>
        </div>
      )}

      {error && !loading && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      {fortune && !loading && (
        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-bold text-foreground">{fortune.ticker}</span>
            <span className="text-xs text-faint-foreground">{fortune.fortuneDate}</span>
          </div>
          <p className={`whitespace-pre-line rounded-lg border ${FORTUNE_TONES.border} ${FORTUNE_TONES.surface} px-4 py-4 leading-relaxed text-foreground`}>
            {fortune.content}
          </p>
        </div>
      )}

      <p className="mt-5 text-xs text-faint-foreground">
        ⚠️ 재미로 보는 콘텐츠입니다. 투자 판단의 근거가 아닙니다.
      </p>
    </div>
  );
}
