import { useMemo, useState } from "react";
import { Input } from "@/app/components/ui/form/input";
import { Label } from "@/app/components/ui/form/label";
import { AlertTriangle, Check, Loader2, Trash2 } from "lucide-react";
import type {
  TradeConfirmItem,
  TradeConfirmResponse,
  TradeDraftItem,
  TradeDraftResponse,
} from "@/app/types";
import { confirmTradeDraft } from "@/app/services/tradeCaptureService";

/** 입력값이 placeholder 와 같은 톤이면 "읽어온 값"인지 "빈 칸"인지 구분되지 않는다. */
const FIELD_CLASS = "text-gray-100 placeholder:text-gray-600";

/** 대화 안에서 수정 가능한 행. 초안 응답을 편집 가능한 형태로 펼친 것. */
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

/** 저장 가능한 줄인지. 서버가 확정 시점에 다시 검증하지만 여기서 먼저 걸러 왕복을 줄인다. */
function isRowValid(row: EditableRow): boolean {
  return (
    row.stockCd.trim() !== "" &&
    row.transDt.trim() !== "" &&
    Number(row.qty) > 0 &&
    Number(row.price) > 0
  );
}

interface TradeDraftCardProps {
  draft: TradeDraftResponse;
  /** 저장이 끝나면 대화에 결과 메시지를 붙이기 위해 호출된다. */
  onSaved: (result: TradeConfirmResponse) => void;
}

export function TradeDraftCard({ draft, onSaved }: TradeDraftCardProps) {
  const [rows, setRows] = useState<EditableRow[]>(() => draft.items.map(toRow));
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validCount = useMemo(
    () => rows.filter((r) => r.include && isRowValid(r)).length,
    [rows],
  );

  const updateRow = (lineNo: number, patch: Partial<EditableRow>) => {
    setRows((prev) =>
      prev.map((r) => (r.lineNo === lineNo ? { ...r, ...patch } : r)),
    );
  };

  const handleSave = async () => {
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
      setError("저장할 항목이 없습니다.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const res = await confirmTradeDraft(draft.draftId, items);
      const result = res.data.data;
      onSaved(result);

      if (result.failedCount === 0) {
        setDone(true);
        return;
      }

      // 일부만 실패한 경우 — 실패한 줄만 남겨 고쳐서 다시 시도하게 한다
      const failed = new Map(
        result.results.filter((r) => !r.saved).map((r) => [r.lineNo, r.message]),
      );
      setRows((prev) =>
        prev
          .filter((r) => failed.has(r.lineNo))
          .map((r) => ({ ...r, issue: failed.get(r.lineNo) ?? r.issue })),
      );
    } catch {
      // apiClient 인터셉터가 토스트를 띄운다
    } finally {
      setSaving(false);
    }
  };

  if (draft.items.length === 0) {
    return null;
  }

  if (done) {
    // 상세 안내는 뒤따르는 어시스턴트 메시지가 하므로 여기서는 짧게 끝낸다
    return (
      <div className="flex items-center gap-1.5 text-xs text-emerald-400">
        <Check className="w-3.5 h-3.5 flex-shrink-0" />
        저장 완료
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-3 sm:p-4 space-y-3">
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
                <label className="flex items-center gap-2 text-sm text-gray-300 min-w-0">
                  <input
                    type="checkbox"
                    checked={row.include}
                    onChange={(e) =>
                      updateRow(row.lineNo, { include: e.target.checked })
                    }
                    className="accent-indigo-500 flex-shrink-0"
                  />
                  <span className="text-gray-500 flex-shrink-0">읽은 내용:</span>
                  <span className="font-medium truncate">{row.rawName}</span>
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setRows((prev) => prev.filter((r) => r.lineNo !== row.lineNo))
                  }
                  className="p-1 text-gray-500 hover:text-red-400 flex-shrink-0"
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
                    placeholder="종목코드"
                    className={FIELD_CLASS}
                  />
                  {row.stockNm && (
                    <p className="mt-1 text-xs text-gray-500 truncate">
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
                    className={FIELD_CLASS}
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">수량</Label>
                  <Input
                    type="number"
                    min="0"
                    step="any"
                    value={row.qty}
                    onChange={(e) => updateRow(row.lineNo, { qty: e.target.value })}
                    className={FIELD_CLASS}
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
                    className={FIELD_CLASS}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex items-center justify-end gap-3">
        <span className="text-xs text-gray-500">{validCount}건 저장 가능</span>
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
  );
}
