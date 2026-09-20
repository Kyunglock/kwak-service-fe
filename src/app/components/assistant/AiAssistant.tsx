import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowUp,
  ImagePlus,
  Loader2,
  Sparkles,
  TriangleAlert,
  X,
} from "lucide-react";
import type {
  PortfolioResponse,
  TradeConfirmResponse,
  TradeDraftResponse,
} from "@/app/types";
import { getPortfoliosByUser } from "@/app/services/portfolioService";
import {
  captureTradeImage,
  captureTradeText,
} from "@/app/services/tradeCaptureService";
import { TradeDraftCard } from "./TradeDraftCard";

/** 서버 상한(4MB)과 맞춘다 — 올리기 전에 걸러 왕복을 줄인다. */
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
];

const EXAMPLES = [
  "어제 애플 10주를 230달러에 샀어",
  "삼성전자 5주 71,000원에 매도했어",
  "엔비디아 2주 매수, 단가는 180.5",
];

type Message =
  | { id: string; role: "user"; text: string; imageUrl?: string }
  | { id: string; role: "assistant"; kind: "text"; text: string; tone?: "error" }
  | {
      id: string;
      role: "assistant";
      kind: "draft";
      text: string;
      draft: TradeDraftResponse;
    };

let messageSeq = 0;
const nextId = () => `m${++messageSeq}`;

export function AiAssistant() {
  const [portfolios, setPortfolios] = useState<PortfolioResponse[]>([]);
  const [portfolioId, setPortfolioId] = useState<number>(0);
  const [portfolioLoaded, setPortfolioLoaded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  // 미리보기용 objectURL 은 컴포넌트가 사라질 때 함께 해제한다
  const objectUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    getPortfoliosByUser()
      .then((res) => {
        const list: PortfolioResponse[] = res.data.data ?? [];
        setPortfolios(list);
        setPortfolioId(list[0]?.portfolioId ?? 0);
      })
      .catch(() => {
        // apiClient 인터셉터에서 처리됨
      })
      .finally(() => setPortfolioLoaded(true));
  }, []);

  useEffect(() => {
    const urls = objectUrlsRef.current;
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, pending]);

  const push = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setInputError(null);
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setInputError("png, jpg, webp, gif 이미지만 올릴 수 있어요.");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setInputError("이미지는 4MB 이하만 올릴 수 있어요.");
      e.target.value = "";
      return;
    }
    const url = URL.createObjectURL(file);
    objectUrlsRef.current.push(url);
    setImageFile(file);
    setImagePreview(url);
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const send = async (overrideText?: string) => {
    if (pending) return;
    const text = (overrideText ?? input).trim();
    const file = imageFile;
    if (!text && !file) return;

    if (!portfolioId) {
      push({
        id: nextId(),
        role: "assistant",
        kind: "text",
        text: "기록을 담을 포트폴리오를 준비하지 못했어요. 화면을 새로고침한 뒤 다시 시도해 주세요.",
        tone: "error",
      });
      return;
    }

    push({
      id: nextId(),
      role: "user",
      text: text || "(화면 캡처)",
      imageUrl: imagePreview ?? undefined,
    });
    setInput("");
    setInputError(null);
    // 파일 핸들은 요청에 쓰이므로 미리보기 URL은 남기고 선택만 해제한다
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setPending(true);

    try {
      // 이미지가 있으면 이미지를 우선한다 — 스크린샷 쪽이 정보량이 많다
      const res = file
        ? await captureTradeImage(portfolioId, file)
        : await captureTradeText(portfolioId, text);
      const draft = res.data.data;

      if (draft.items.length === 0) {
        push({
          id: nextId(),
          role: "assistant",
          kind: "text",
          text: draft.notice,
        });
      } else {
        push({
          id: nextId(),
          role: "assistant",
          kind: "draft",
          text: draft.notice,
          draft,
        });
      }
    } catch {
      // 인터셉터가 토스트를 띄우지만, 대화가 응답 없이 끊긴 것처럼 보이면 안 된다
      push({
        id: nextId(),
        role: "assistant",
        kind: "text",
        text: "지금은 내용을 읽지 못했어요. 잠시 후 다시 시도해 주세요.",
        tone: "error",
      });
    } finally {
      setPending(false);
    }
  };

  const handleSaved = (result: TradeConfirmResponse) => {
    push({
      id: nextId(),
      role: "assistant",
      kind: "text",
      text:
        result.failedCount === 0
          ? `${result.savedCount}건을 기록했어요. 종목 메뉴에서 확인하실 수 있습니다.`
          : `${result.savedCount}건을 기록했고 ${result.failedCount}건은 저장하지 못했어요. 남은 항목을 고쳐서 다시 저장해 주세요.`,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter 전송 / Shift+Enter 줄바꿈. 한글 조합 중 Enter는 무시한다.
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send();
    }
  };

  const isEmpty = messages.length === 0;

  const composer = (
    <div className="space-y-2">
      {imagePreview && (
        <div className="relative inline-block">
          <img
            src={imagePreview}
            alt="첨부한 화면 캡처"
            className="max-h-32 rounded-lg border border-slate-700"
          />
          <button
            type="button"
            onClick={clearImage}
            className="absolute top-1 right-1 p-1 rounded-md bg-slate-900/80 text-gray-300 hover:text-white"
            aria-label="이미지 제거"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="rounded-2xl border border-slate-700 bg-slate-900 focus-within:border-indigo-500/60 transition-colors">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          maxLength={2000}
          disabled={pending}
          placeholder="무엇을 사고 파셨는지 알려주세요. 증권사 화면을 캡처해 올려도 됩니다."
          className="w-full bg-transparent px-4 pt-3 pb-1 text-sm text-gray-100 placeholder-gray-500 resize-none focus:outline-none disabled:opacity-60"
        />
        <div className="flex items-center justify-between px-3 pb-2">
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_IMAGE_TYPES.join(",")}
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={pending}
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs text-gray-400 hover:text-gray-200 hover:bg-slate-800 disabled:opacity-50 transition-colors"
          >
            <ImagePlus className="w-4 h-4" />
            화면 캡처
          </button>
          <button
            type="button"
            onClick={() => send()}
            disabled={pending || (!input.trim() && !imageFile)}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white transition-colors"
            aria-label="보내기"
          >
            {pending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowUp className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {inputError && <p className="text-xs text-red-400 px-1">{inputError}</p>}
    </div>
  );

  return (
    <div className="flex flex-col h-[calc(100dvh-7rem)] lg:h-[calc(100dvh-3rem)] max-w-3xl mx-auto w-full">
      {/* 헤더 — 기록이 어느 포트폴리오로 가는지 항상 보이게 둔다 */}
      <div className="flex items-center justify-between gap-3 pb-3 flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles className="w-5 h-5 text-indigo-400 flex-shrink-0" />
          <h2 className="text-lg font-semibold text-gray-100 truncate">
            AI 어시스턴트
          </h2>
        </div>
        {portfolios.length > 0 && (
          <label className="flex items-center gap-2 text-xs text-gray-500 flex-shrink-0">
            기록할 곳
            <select
              value={portfolioId}
              onChange={(e) => setPortfolioId(Number(e.target.value))}
              className="h-8 rounded-md bg-slate-800 border border-slate-700 text-xs px-2 text-gray-200 max-w-[10rem]"
            >
              {portfolios.map((p) => (
                <option key={p.portfolioId} value={p.portfolioId}>
                  {p.portfolioNm}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {portfolioLoaded && portfolios.length === 0 && (
        <div className="mb-3 flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/5 px-3 py-2 text-xs text-amber-400 flex-shrink-0">
          <TriangleAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
          포트폴리오를 불러오지 못했어요. 새로고침하면 기본 포트폴리오가 만들어집니다.
        </div>
      )}

      {isEmpty ? (
        /* 빈 화면 — 입력창을 가운데 두고 예시를 보여준다 */
        <div className="flex-1 flex flex-col justify-center min-h-0">
          <div className="text-center mb-6">
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-100">
              무엇을 기록할까요?
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              말로 알려주시거나 증권사 화면을 캡처해 올려주세요.
            </p>
          </div>

          {composer}

          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            {EXAMPLES.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => send(example)}
                disabled={pending}
                className="px-3 py-1.5 rounded-full border border-slate-700 bg-slate-800/60 text-xs text-gray-400 hover:text-gray-200 hover:border-slate-600 disabled:opacity-50 transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* 대화 */}
          <div className="flex-1 overflow-y-auto min-h-0 space-y-4 pr-1">
            {messages.map((m) =>
              m.role === "user" ? (
                <div key={m.id} className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-br-md bg-indigo-600 px-4 py-2.5 text-sm text-white space-y-2">
                    {m.imageUrl && (
                      <img
                        src={m.imageUrl}
                        alt="첨부한 화면 캡처"
                        className="max-h-48 rounded-lg border border-indigo-400/30"
                      />
                    )}
                    <p className="whitespace-pre-wrap break-words">{m.text}</p>
                  </div>
                </div>
              ) : (
                <div key={m.id} className="space-y-2">
                  <p
                    className={`text-sm whitespace-pre-wrap break-words ${
                      m.kind === "text" && m.tone === "error"
                        ? "text-red-400"
                        : "text-gray-300"
                    }`}
                  >
                    {m.text}
                  </p>
                  {m.kind === "draft" && (
                    <TradeDraftCard draft={m.draft} onSaved={handleSaved} />
                  )}
                </div>
              ),
            )}

            {pending && (
              <p className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                읽는 중...
              </p>
            )}

            <div ref={bottomRef} />
          </div>

          {/* 입력창 */}
          <div className="pt-3 flex-shrink-0">{composer}</div>
        </>
      )}
    </div>
  );
}
