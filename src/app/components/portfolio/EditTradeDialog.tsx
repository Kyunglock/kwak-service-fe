import { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/form/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/overlay/dialog";
import { Input } from "@/app/components/ui/form/input";
import { Label } from "@/app/components/ui/form/label";
import { Loader2 } from "lucide-react";
import { sp500Stocks } from "@/app/constants/stocks";
import type { TransactionResponse } from "@/app/types";
import { updateTransaction } from "@/app/services/transactionService";

interface EditTradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: TransactionResponse | null;
  onEditComplete: () => void;
}

export function EditTradeDialog({ open, onOpenChange, transaction, onEditComplete }: EditTradeDialogProps) {
  const [form, setForm] = useState({ qty: "", price: "", transDt: "", memo: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (transaction) {
      setForm({
        qty: transaction.qty.toString(),
        price: transaction.price.toString(),
        transDt: transaction.transDt.slice(0, 10),
        memo: transaction.memo ?? "",
      });
    }
  }, [transaction]);

  const handleSubmit = async () => {
    if (!transaction || !form.qty || !form.price || !form.transDt) return;
    const qty = parseFloat(form.qty);
    const price = parseFloat(form.price);
    setSubmitting(true);
    try {
      await updateTransaction({
        transId: transaction.transId,
        transDt: form.transDt,
        qty,
        price,
        amount: qty * price,
        memo: form.memo || undefined,
      });
      onEditComplete();
      onOpenChange(false);
    } catch {
      // apiClient 인터셉터에서 에러 처리됨
    } finally {
      setSubmitting(false);
    }
  };

  if (!transaction) return null;

  const isBuy = transaction.transType === "BUY";
  const stockInfo = sp500Stocks.find((s) => s.symbol === transaction.stockCd);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] bg-card border-border text-foreground">
        <DialogHeader>
          <DialogTitle className="text-foreground">매매 내역 수정</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* 종목 정보 (읽기전용) */}
          <div className="flex items-center gap-2 p-2 rounded-md bg-muted">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${isBuy ? "bg-primary text-primary-foreground" : "bg-foreground text-background"}`}>
              {isBuy ? "매수" : "매도"}
            </span>
            <span className="font-bold text-foreground">{transaction.stockCd}</span>
            {stockInfo && <span className="text-xs text-muted-foreground">{stockInfo.nameKr}</span>}
          </div>

          <div className="space-y-3">
            <div>
              <Label htmlFor="editQty" className="text-xs text-foreground">수량 *</Label>
              <Input
                id="editQty"
                type="number"
                value={form.qty}
                onChange={(e) => setForm({ ...form, qty: e.target.value })}
                className="text-sm bg-muted border-border text-foreground"
              />
            </div>
            <div>
              <Label htmlFor="editPrice" className="text-xs text-foreground">단가 ($) *</Label>
              <Input
                id="editPrice"
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="text-sm bg-muted border-border text-foreground"
              />
            </div>
            <div>
              <Label htmlFor="editDt" className="text-xs text-foreground">날짜 *</Label>
              <Input
                id="editDt"
                type="date"
                value={form.transDt}
                onChange={(e) => setForm({ ...form, transDt: e.target.value })}
                className="text-sm bg-muted border-border text-foreground"
              />
            </div>
            <div>
              <Label htmlFor="editMemo" className="text-xs text-foreground">메모</Label>
              <Input
                id="editMemo"
                placeholder="메모 (선택)"
                value={form.memo}
                onChange={(e) => setForm({ ...form, memo: e.target.value })}
                className="text-sm bg-muted border-border text-foreground"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-border text-muted-foreground hover:bg-accent"
            >
              취소
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!form.qty || !form.price || !form.transDt || submitting}
              className={`flex-1 ${isBuy ? "bg-primary hover:bg-primary-strong text-primary-foreground" : "bg-foreground hover:bg-foreground/85 text-background"}`}
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              수정하기
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
