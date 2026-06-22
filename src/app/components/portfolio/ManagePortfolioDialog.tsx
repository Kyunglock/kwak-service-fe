import { useState } from "react";
import { Button } from "@/app/components/ui/form/button";
import { Badge } from "@/app/components/ui/feedback/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/overlay/dialog";
import { Input } from "@/app/components/ui/form/input";
import { Label } from "@/app/components/ui/form/label";
import { Folder, Edit2, Trash2, Loader2 } from "lucide-react";
import type { PortfolioResponse } from "@/app/types";
import { addPortfolio, modifyPortfolio, removePortfolio } from "@/app/services/portfolioService";
import { showAlert } from "@/app/utils/alertEvent";
import { useAuth } from "@/app/contexts/AuthContext";

interface ManagePortfolioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  portfolios: PortfolioResponse[];
  currentPortfolioId: number;
  onPortfolioChange: () => void;
  onPortfolioDeleted: (deletedId: number) => void;
}

export function ManagePortfolioDialog({
  open,
  onOpenChange,
  portfolios,
  currentPortfolioId,
  onPortfolioChange,
  onPortfolioDeleted,
}: ManagePortfolioDialogProps) {
  const { user } = useAuth();
  const [newPortfolioName, setNewPortfolioName] = useState("");
  const [newPortfolioDescription, setNewPortfolioDescription] = useState("");
  const [editingPortfolioId, setEditingPortfolioId] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleCreatePortfolio = async () => {
    if (!newPortfolioName.trim()) return;
    setSubmitting(true);
    try {
      await addPortfolio({
        userId: user?.userId || "",
        portfolioNm: newPortfolioName,
        portfolioDesc: newPortfolioDescription || undefined,
      });
      onPortfolioChange();
      setNewPortfolioName("");
      setNewPortfolioDescription("");
      onOpenChange(false);
    } catch {
      // apiClient 인터셉터에서 에러 처리됨
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditPortfolio = (portfolio: PortfolioResponse) => {
    setEditingPortfolioId(portfolio.portfolioId);
    setNewPortfolioName(portfolio.portfolioNm);
    setNewPortfolioDescription(portfolio.portfolioDesc || "");
  };

  const handleCancelEdit = () => {
    setEditingPortfolioId(null);
    setNewPortfolioName("");
    setNewPortfolioDescription("");
  };

  const handleUpdatePortfolio = async () => {
    if (!newPortfolioName.trim() || !editingPortfolioId) return;
    setSubmitting(true);
    try {
      await modifyPortfolio({
        portfolioId: editingPortfolioId,
        portfolioNm: newPortfolioName,
        portfolioDesc: newPortfolioDescription || undefined,
      });
      onPortfolioChange();
      setEditingPortfolioId(null);
      setNewPortfolioName("");
      setNewPortfolioDescription("");
    } catch {
      // apiClient 인터셉터에서 에러 처리됨
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePortfolio = (targetId: number) => {
    if (portfolios.length <= 1) {
      showAlert("최소 하나의 포트폴리오는 유지해야 합니다.", "warning");
      return;
    }
    setDeleteConfirmId(targetId);
  };

  const confirmDeletePortfolio = async () => {
    if (!deleteConfirmId) return;
    const targetId = deleteConfirmId;
    setDeleteConfirmId(null);
    setSubmitting(true);
    try {
      await removePortfolio(targetId);
      onPortfolioDeleted(targetId);
      onPortfolioChange();
    } catch {
      // apiClient 인터셉터에서 에러 처리됨
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[90vw] max-h-[80vh] overflow-y-auto bg-slate-700 border-slate-600 text-gray-100">
          <DialogHeader>
            <DialogTitle className="text-gray-100">포트폴리오 관리</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* 포트폴리오 목록 */}
            <div className="space-y-2">
              {portfolios.map((portfolio) => (
                <div key={portfolio.portfolioId} className="flex items-center justify-between p-2 rounded-md bg-slate-600/50">
                  <div className="flex items-center gap-2">
                    <Folder className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-100 font-medium">{portfolio.portfolioNm}</span>
                        {portfolio.portfolioId === currentPortfolioId && (
                          <Badge className="text-xs py-0.5 px-2 bg-gray-500 text-gray-300">현재</Badge>
                        )}
                      </div>
                      {portfolio.portfolioDesc && (
                        <span className="text-xs text-gray-400">{portfolio.portfolioDesc}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleEditPortfolio(portfolio)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    {portfolios.length > 1 && (
                      <Button
                        size="sm"
                        onClick={() => handleDeletePortfolio(portfolio.portfolioId)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* 새 포트폴리오 추가/수정 폼 */}
            <div className="space-y-3 border-t border-slate-600 pt-4">
              <h4 className="text-sm font-semibold text-gray-100">
                {editingPortfolioId ? "포트폴리오 수정" : "새 포트폴리오 추가"}
              </h4>
              <div>
                <Label htmlFor="newPortfolioName" className="text-xs text-gray-200">포트폴리오 이름 *</Label>
                <Input
                  id="newPortfolioName"
                  placeholder="예: 주식 포트폴리오"
                  value={newPortfolioName}
                  onChange={(e) => setNewPortfolioName(e.target.value)}
                  className="text-sm bg-slate-600 border-slate-500 text-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="newPortfolioDescription" className="text-xs text-gray-200">설명</Label>
                <Input
                  id="newPortfolioDescription"
                  placeholder="포트폴리오에 대한 설명"
                  value={newPortfolioDescription}
                  onChange={(e) => setNewPortfolioDescription(e.target.value)}
                  className="text-sm bg-slate-600 border-slate-500 text-gray-100"
                />
              </div>
            </div>

            {editingPortfolioId ? (
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={handleCancelEdit}
                  variant="outline"
                  className="border-slate-500 text-gray-300 hover:bg-slate-600"
                >
                  취소
                </Button>
                <Button
                  onClick={handleUpdatePortfolio}
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={!newPortfolioName.trim() || submitting}
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  수정하기
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleCreatePortfolio}
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                disabled={!newPortfolioName.trim() || submitting}
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                포트폴리오 추가하기
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={deleteConfirmId !== null} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent className="max-w-[80vw] bg-slate-700 border-slate-600 text-gray-100">
          <DialogHeader>
            <DialogTitle className="text-gray-100">포트폴리오 삭제</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-300">이 포트폴리오와 모든 보유 종목을 삭제하시겠습니까?</p>
          <div className="grid grid-cols-2 gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmId(null)}
              className="border-slate-500 text-gray-300 hover:bg-slate-600"
            >
              취소
            </Button>
            <Button
              onClick={confirmDeletePortfolio}
              className="bg-red-600 hover:bg-red-700"
            >
              삭제
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
