import { useState, useEffect, useCallback } from "react";
import { Card } from "@/app/components/ui/layout/card";
import { Button } from "@/app/components/ui/form/button";
import { History, ChevronLeft, ChevronRight, Search, User } from "lucide-react";
import type { ActivityLogResponse, PageResponse, ApiResponse } from "@/app/types";
import {
  getMyActivityLogs,
  getAllActivityLogs,
} from "@/app/services/activityLogService";

const PAGE_SIZE = 20;

// 액션 유형별 라벨/색상
const ACTION_META: Record<string, { label: string; cls: string }> = {
  LOGIN: { label: "로그인", cls: "bg-cyan-600/80 text-white" },
  LOGOUT: { label: "로그아웃", cls: "bg-slate-600/80 text-white" },
  TRADE_BUY: { label: "매수", cls: "bg-emerald-600/80 text-white" },
  TRADE_SELL: { label: "매도", cls: "bg-red-600/80 text-white" },
  SURVEY_SUBMIT: { label: "설문 제출", cls: "bg-purple-600/80 text-white" },
  PORTFOLIO_CREATE: { label: "포트폴리오 생성", cls: "bg-indigo-600/80 text-white" },
  PORTFOLIO_DELETE: { label: "포트폴리오 삭제", cls: "bg-orange-600/80 text-white" },
};

const actionMeta = (a: string) =>
  ACTION_META[a] ?? { label: a, cls: "bg-slate-600/80 text-white" };

const fmtDateTime = (s: string) => s.replace("T", " ").slice(0, 19);

interface ActivityLogProps {
  isAdmin?: boolean;
}

export function ActivityLog({ isAdmin = false }: ActivityLogProps) {
  const [tab, setTab] = useState<"me" | "all">("me");

  const [logs, setLogs] = useState<ActivityLogResponse[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);

  // 관리자 필터 (적용된 값)
  const [userIdInput, setUserIdInput] = useState("");
  const [actionInput, setActionInput] = useState("");
  const [appliedUserId, setAppliedUserId] = useState("");
  const [appliedAction, setAppliedAction] = useState("");

  const fetchLogs = useCallback(() => {
    setLoading(true);
    const req =
      tab === "all"
        ? getAllActivityLogs({
            targetUserId: appliedUserId || undefined,
            actionType: appliedAction || undefined,
            page,
            size: PAGE_SIZE,
          })
        : getMyActivityLogs(page, PAGE_SIZE);

    req
      .then((res) => {
        const d = (res.data as ApiResponse<PageResponse<ActivityLogResponse>>).data;
        setLogs(d.content ?? []);
        setTotalPages(d.totalPages ?? 1);
        setTotalElements(d.totalElements ?? 0);
      })
      .catch(() => {
        setLogs([]);
        setTotalPages(1);
        setTotalElements(0);
      })
      .finally(() => setLoading(false));
  }, [tab, page, appliedUserId, appliedAction]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const switchTab = (t: "me" | "all") => {
    setTab(t);
    setPage(0);
  };

  const applyAdminFilter = () => {
    setAppliedUserId(userIdInput.trim());
    setAppliedAction(actionInput.trim());
    setPage(0);
  };

  return (
    <div className="space-y-5">
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/25 to-purple-600/15 ring-1 ring-indigo-500/30">
          <History className="h-5 w-5 text-indigo-300" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-100">활동 내역</h2>
          <p className="text-xs text-gray-500">
            {tab === "all" ? "전체 사용자 활동 (관리자)" : "내 활동 기록"}
          </p>
        </div>
      </div>

      {/* 관리자 탭 전환 */}
      {isAdmin && (
        <div className="flex gap-1 rounded-lg bg-slate-800/60 p-1">
          {(["me", "all"] as const).map((t) => (
            <button
              key={t}
              onClick={() => switchTab(t)}
              className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                tab === t
                  ? "bg-indigo-600 text-white"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {t === "me" ? "내 활동" : "전체 (관리자)"}
            </button>
          ))}
        </div>
      )}

      {/* 관리자 필터 */}
      {isAdmin && tab === "all" && (
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[160px]">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              value={userIdInput}
              onChange={(e) => setUserIdInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyAdminFilter()}
              placeholder="사용자 ID"
              className="w-full rounded-lg border border-slate-600 bg-slate-700 py-2 pl-9 pr-3 text-sm text-gray-100 placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <input
            value={actionInput}
            onChange={(e) => setActionInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyAdminFilter()}
            placeholder="액션 (예: LOGIN)"
            className="min-w-[140px] flex-1 rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
          />
          <Button
            size="sm"
            onClick={applyAdminFilter}
            className="gap-1.5 bg-indigo-600 text-sm text-white hover:bg-indigo-500"
          >
            <Search className="h-4 w-4" /> 조회
          </Button>
        </div>
      )}

      {/* 목록 */}
      {loading ? (
        <Card className="p-10 text-center bg-slate-800/60 border-slate-700/60">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
          <p className="text-sm text-gray-400">불러오는 중...</p>
        </Card>
      ) : logs.length === 0 ? (
        <Card className="p-12 text-center bg-slate-800/40 border-slate-700/60">
          <History className="mx-auto mb-3 h-12 w-12 text-gray-600" />
          <p className="text-sm text-gray-400">활동 기록이 없습니다.</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => {
            const meta = actionMeta(log.actionType);
            return (
              <Card
                key={log.logId}
                className="flex items-center gap-3 border-slate-700/60 bg-slate-800/70 p-3.5"
              >
                <span
                  className={`flex-shrink-0 rounded-md px-2 py-1 text-[12px] font-semibold ${meta.cls}`}
                >
                  {meta.label}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-gray-200">
                    {log.detail ?? log.targetType ?? "-"}
                    {log.targetId && (
                      <span className="ml-1 text-gray-500">({log.targetId})</span>
                    )}
                  </p>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500">
                    <span>{fmtDateTime(log.regDt)}</span>
                    {tab === "all" && log.userId && (
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {log.userId.slice(0, 8)}
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs text-gray-400 transition-colors hover:bg-slate-700 hover:text-gray-200 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            이전
          </button>
          <span className="text-xs text-gray-500">
            {page + 1} / {totalPages}
            <span className="ml-1 text-indigo-400">· 총 {totalElements}건</span>
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs text-gray-400 transition-colors hover:bg-slate-700 hover:text-gray-200 disabled:cursor-not-allowed disabled:opacity-30"
          >
            다음
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
