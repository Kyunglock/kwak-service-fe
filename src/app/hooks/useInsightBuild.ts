import { useCallback, useEffect, useRef, useState } from "react";
import { requestInsightBuild, getInsightBuildStatus } from "@/app/services/insightService";
import type { ApiResponse, BuildStatus } from "@/app/types";

const POLL_INTERVAL_MS = 2500;
const POLL_TIMEOUT_MS = 180000; // 3분 상한

export function useInsightBuild(onDone: () => void) {
  const [status, setStatus] = useState<BuildStatus>("IDLE");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = useRef<number>(0);
  const onDoneRef = useRef(onDone);
  const stoppedRef = useRef(false);
  const errorCountRef = useRef(0);
  onDoneRef.current = onDone;

  const stopPolling = useCallback(() => {
    stoppedRef.current = true;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const readStatus = useCallback(async (): Promise<BuildStatus | null> => {
    try {
      const res = await getInsightBuildStatus();
      return (res.data as ApiResponse<{ status: BuildStatus }>).data.status;
    } catch {
      return null;
    }
  }, []);

  const startPolling = useCallback(() => {
    stopPolling();
    stoppedRef.current = false;
    errorCountRef.current = 0;
    startedAtRef.current = Date.now();
    timerRef.current = setInterval(async () => {
      const s = await readStatus();
      if (stoppedRef.current) return;
      if (s === null) {
        errorCountRef.current += 1;
        if (errorCountRef.current >= 3) {
          stopPolling();
          setStatus("FAILED");
        }
        return;
      }
      errorCountRef.current = 0;
      if (s === "IDLE") return;
      setStatus(s);
      if (s === "DONE") {
        stopPolling();
        onDoneRef.current();
      } else if (s === "FAILED" || Date.now() - startedAtRef.current > POLL_TIMEOUT_MS) {
        stopPolling();
        setStatus(s === "FAILED" ? "FAILED" : "IDLE");
      }
    }, POLL_INTERVAL_MS);
  }, [readStatus, stopPolling]);

  const trigger = useCallback(async () => {
    try {
      await requestInsightBuild();
      setStatus("PROCESSING");
      startPolling();
    } catch {
      setStatus("IDLE");
    }
  }, [startPolling]);

  // 마운트 시 초기 상태 동기화 (이미 진행 중이면 폴링 재개)
  useEffect(() => {
    let mounted = true;
    readStatus().then((s) => {
      if (!mounted) return;
      if (s !== null) {
        setStatus(s);
        if (s === "PROCESSING") startPolling();
      }
    });
    return () => {
      mounted = false;
      stopPolling();
    };
  }, [readStatus, startPolling, stopPolling]);

  return { status, isProcessing: status === "PROCESSING", trigger };
}
