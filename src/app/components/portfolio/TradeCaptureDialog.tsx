import { useCallback, useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/overlay/dialog";
import { Input } from "@/app/components/ui/form/input";
import { Textarea } from "@/app/components/ui/form/textarea";
import { Label } from "@/app/components/ui/form/label";
import {
  AlertTriangle,
  Check,
  ImagePlus,
  Loader2,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import type {
  TradeConfirmItem,
  TradeDraftItem,
  TradeDraftResponse,
} from "@/app/types";
import {
  captureTradeImage,
  captureTradeText,
  confirmTradeDraft,
} from "@/app/services/tradeCaptureService";

/** 서비스단 상한과 맞춘다 (BE: MAX_IMAGE_BYTES) */
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
];

interface TradeCaptureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPortfolioId: number;
  onCaptureComplete: () => void;
}

/** 화면에서 수정 가능한 행. 초안 응답을 편집 가능한 형태로 펼친 것. */
interface EditableRow {
  lineNo: number;
  rawName: string;
  stockCd: string;
  stockNm: string;
  transType: "BUY" | "SELL";
  transDt: string;
  qty: string;
  price: string;
  currency: string;
  issue: string | null;
  candidates: { stockCd: string; stockNm: string }[];
  include: boolean;
}

function toRow(item: TradeDraftItem): EditableRow {
  return {
    lineNo: item.lineNo,
    rawName: item.rawName,
    stockCd: item.stockCd ?? "",
    stockNm: item.stockNm ?? "",
    transType: item.transType === "SELL" ? "SELL" : "BUY",
    transDt: item.transDt ?? "",
    qty: item.qty != null ? String(item.qty) : "",
    price: item.price != null ? String(item.price) : "",
    currency: item.currency ?? "USD",
    issue: item.issue,
    candidates: item.candidates ?? [],
    // 확인이 필요한 줄도 기본 체크해 둔다 — 빠진 값을 채우면 바로 저장할 수 있다
    include: true,
  };
}

/** 저장 가능한 줄인지. BE가 확정 시점에 다시 검증하지만, 여기서 먼저 걸러 왕복을 줄인다. */
function isRowValid(row: EditableRow): boolean {
  return (
    row.stockCd.trim() !== "" &&
    row.transDt.trim() !== "" &&
    Number(row.qty) > 0 &&
    Number(row.price) > 0
  );
}

export function TradeCaptureDialog({
  open,
  onOpenChange,
  currentPortfolioId,
  onCaptureComplete,
}: TradeCaptureDialogProps) {
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [draft, setDraft] = useState<TradeDraftResponse | null>(null);
  const [rows, setRows] = useState<EditableRow[]>([]);
  const [reading, setReading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validCount = useMemo(
    () => rows.filter((r) => r.include && isRowValid(r)).length,
    [rows],
  );

  const reset = useCallback(() => {
    setText("");
    setImageFile(null);
    setImagePreview(null);
    setDraft(null);
    setRows([]);
    setLocalError(null);
    setResultMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handleClose = useCallback(
    (next: boolean) => {
      if (!next) reset();
      onOpenChange(next);
    },
    [onOpenChange, reset],
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setLocalError(null);
    if (!file) {
      setImageFile(null);
      setImagePreview(null);
      return;
    }
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setLocalError("png, jpg, webp, gif 이미지만 올릴 수 있습니다.");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setLocalError("이미지는 4MB 이하만 올릴 수 있습니다.");
      e.target.value = "";
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRead = async () => {
    if (!currentPortfolioId) {
      setLocalError("먼저 포트폴리오를 선택해 주세요.");
      return;
    }
    if (!imageFile && text.trim() === "") {
      setLocalError("매매 내용을 입력하거나 화면 캡처를 올려주세요.");
      return;
    }
    setReading(true);
    setLocalError(null);
    setResultMessage(null);
    try {
      // 이미지가 있으면 이미지를 우선한다 — 스크린샷 쪽이 정보량이 많다
      const res = imageFile
        ? await captureTradeImage(currentPortfolioId, imageFile)
        : await captureTradeText(currentPortfolioId, text.trim());
      const data = res.data.data;
      setDraft(data);
      setRows(data.items.map(toRow));
    } catch {
      // apiClient 인터셉터가 토스트를 띄운다
    } finally {
      setReading(false);
    }
  };

  const updateRow = (lineNo: number, patch: Partial<EditableRow>) => {
    setRows((prev) =>
      prev.map((r) => (r.lineNo === lineNo ? { ...r, ...patch } : r)),
    );
  };

  const handleSave = async () => {
    if (!draft) return;
    const items: TradeConfirmItem[] = rows
      .filter((r) => r.include && isRowValid(r))
      .map((r) => ({
        lineNo: r.lineNo,
        stockCd: r.stockCd.trim().toUpperCase(),
        transType: r.transType,
        transDt: r.transDt,
        qty: Number(r.qty),
        price: Number(r.price),
        currency: r.currency || undefined,
      }));

    if (items.length === 0) {
      setLocalError("저장할 항목이 없습니다.");
      return;
    }

    setSaving(true);
    setLocalError(null);
    try {
      const res = await confirmTradeDraft(draft.draftId, items);
      const result = res.data.data;
      onCaptureComplete();

      if (result.failedCount === 0) {
        setResultMessage(`${result.savedCount}건을 기록했습니다.`);
        setTimeout(() => handleClose(false), 1200);
        return;
      }

      // 일부만 실패한 경우 — 실패한 줄만 남겨 다시 시도할 수 있게 한다
      const failedLines = new Set(
        result.results.filter((r) => !r.saved).map((r) => r.lineNo),
      );
      setRows((prev) =>
        prev
          .filter((r) => failedLines.has(r.lineNo))
          .map((r) => ({
            ...r,
            issue:
              result.results.find((x) => x.lineNo === r.lineNo)?.message ??
              r.issue,
          })),
      );
      setResultMessage(
        `${result.savedCount}건 저장, ${result.failedCount}건 실패했습니다. 실패한 항목만 남겨두었습니다.`,
      );
    } catch {
      // apiClient 인터셉터가 토스트를 띄운다
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            AI로 매매 기록하기
          </DialogTitle>
        </DialogHeader>

        {/* 입력 단계 */}
        {draft === null && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="capture-text">무엇을 사고 파셨나요?</Label>
              <Textarea
                id="capture-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={2000}
                rows={3}
                placeholder="예) 어제 애플 10주를 230달러에 샀어, 삼성전자 5주는 71000원에 팔았고"
                disabled={reading || imageFile !== null}
              />
              {imageFile !== null && (
                <p className="text-xs text-gray-500">
                  이미지를 올리면 이미지에서 읽습니다. 문장으로 넣으려면 이미지를
                  먼저 지워주세요.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>증권사 화면 캡처 (선택)</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept={ALLOWED_IMAGE_TYPES.join(",")}
                onChange={handleFileChange}
                className="hidden"
                id="capture-image"
              />
              {imagePreview === null ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={reading}
                  className="flex items-center gap-2 px-3 py-2 w-full justify-center rounded-lg border border-dashed border-slate-600 text-sm text-gray-400 hover:text-gray-200 hover:border-slate-500 transition-colors"
                >
                  <ImagePlus className="w-4 h-4" />
                  매매내역 화면을 캡처해서 올려보세요 (4MB 이하)
                </button>
              ) : (
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="업로드한 매매내역 화면"
                    className="max-h-48 rounded-lg border border-slate-700"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="absolute top-1 right-1 p-1 rounded-md bg-slate-900/80 text-gray-300 hover:text-white"
                    aria-label="이미지 제거"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {localError && (
              <p className="text-sm text-red-400">{localError}</p>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => handleClose(false)}
                className="px-3 py-1.5 rounded-lg text-sm text-gray-400 hover:text-gray-200"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleRead}
                disabled={reading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
              >
                {reading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                {reading ? "읽는 중..." : "읽어오기"}
              </button>
            </div>
          </div>
        )}

        {/* 확인 단계 — 저장 전에 반드시 사람이 본다 */}
        {draft !== null && (
          <div className="space-y-4">
            <p className="text-sm text-gray-300">{draft.notice}</p>

            {rows.length === 0 && (
              <p className="text-sm text-gray-500">
                표시할 항목이 없습니다. 다시 입력해 주세요.
              </p>
            )}

            <div className="space-y-3">
              {rows.map((row) => {
                const valid = isRowValid(row);
                return (
                  <div
                    key={row.lineNo}
                    className={`rounded-lg border p-3 space-y-3 ${
                      row.include && !valid
                        ? "border-amber-500/40 bg-amber-500/5"
                        : "border-slate-700 bg-slate-800/50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <label className="flex items-center gap-2 text-sm text-gray-300">
                        <input
                          type="checkbox"
                          checked={row.include}
                          onChange={(e) =>
                            updateRow(row.lineNo, { include: e.target.checked })
                          }
                          className="accent-indigo-500"
                        />
                        <span className="text-gray-500">읽은 내용:</span>
                        <span className="font-medium">{row.rawName}</span>
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setRows((prev) =>
                            prev.filter((r) => r.lineNo !== row.lineNo),
                          )
                        }
                        className="p-1 text-gray-500 hover:text-red-400"
                        aria-label="이 항목 빼기"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {row.issue && (
                      <p className="flex items-start gap-1.5 text-xs text-amber-400">
                        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                        {row.issue}
                      </p>
                    )}

                    {row.candidates.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {row.candidates.map((c) => (
                          <button
                            key={c.stockCd}
                            type="button"
                            onClick={() =>
                              updateRow(row.lineNo, {
                                stockCd: c.stockCd,
                                stockNm: c.stockNm,
                                issue: null,
                              })
                            }
                            className={`px-2 py-1 rounded-md text-xs border transition-colors ${
                              row.stockCd === c.stockCd
                                ? "bg-indigo-600/20 border-indigo-500/40 text-indigo-300"
                                : "bg-slate-800 border-slate-700 text-gray-400 hover:text-gray-200"
                            }`}
                          >
                            {c.stockNm} ({c.stockCd})
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                      <div className="col-span-2">
                        <Label className="text-xs text-gray-500">종목코드</Label>
                        <Input
                          value={row.stockCd}
                          onChange={(e) =>
                            updateRow(row.lineNo, {
                              stockCd: e.target.value.toUpperCase(),
                            })
                          }
                          placeholder="AAPL"
                        />
                        {row.stockNm && (
                          <p className="mt-1 text-xs text-gray-500">
                            {row.stockNm}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">유형</Label>
                        <select
                          value={row.transType}
                          onChange={(e) =>
                            updateRow(row.lineNo, {
                              transType: e.target.value as "BUY" | "SELL",
                            })
                          }
                          className="w-full h-9 rounded-md bg-slate-900 border border-slate-700 text-sm px-2 text-gray-200"
                        >
                          <option value="BUY">매수</option>
                          <option value="SELL">매도</option>
                        </select>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">날짜</Label>
                        <Input
                          type="date"
                          value={row.transDt}
                          onChange={(e) =>
                            updateRow(row.lineNo, { transDt: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">수량</Label>
                        <Input
                          type="number"
                          min="0"
                          step="any"
                          value={row.qty}
                          onChange={(e) =>
                            updateRow(row.lineNo, { qty: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">단가</Label>
                        <Input
                          type="number"
                          min="0"
                          step="any"
                          value={row.price}
                          onChange={(e) =>
                            updateRow(row.lineNo, { price: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {(localError || resultMessage) && (
              <p
                className={`text-sm ${
                  localError ? "text-red-400" : "text-emerald-400"
                }`}
              >
                {localError ?? resultMessage}
              </p>
            )}

            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={reset}
                className="px-3 py-1.5 rounded-lg text-sm text-gray-400 hover:text-gray-200"
              >
                다시 입력
              </button>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  {validCount}건 저장 가능
                </span>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || validCount === 0}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  {saving ? "저장 중..." : "저장"}
                </button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
