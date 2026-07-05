import { useState, useEffect, useRef, useCallback } from "react";
import type { StockPrice } from "@/app/types";

const SSE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1/stocks/price/stream`;

// 실시간 시세(SSE) 비활성화 — 종목 시세를 실시간으로 노출하지 않는다.
// 다시 켜려면 false 로 변경.
const SSE_DISABLED = true;

export function useStockPrice(enabled: boolean) {
  const [prices, setPrices] = useState<Record<string, StockPrice>>({});
  const [connected, setConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setConnected(false);
    }
  }, []);

  useEffect(() => {
    if (SSE_DISABLED || !enabled) {
      disconnect();
      return;
    }

    const eventSource = new EventSource(SSE_URL, { withCredentials: true });
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setConnected(true);
    };

    eventSource.addEventListener("price-update", (event) => {
      try {
        const data: StockPrice | StockPrice[] = JSON.parse(event.data);
        setPrices((prev) => {
          const next = { ...prev };
          if (Array.isArray(data)) {
            data.forEach((item) => {
              next[item.stockCd] = item;
            });
          } else {
            next[data.stockCd] = data;
          }
          return next;
        });
      } catch {
        // 파싱 실패 시 무시
      }
    });

    eventSource.onerror = (e) => {
      setConnected(false);
      eventSource.close();
      eventSourceRef.current = null;
    };

    return () => {
      eventSource.close();
      eventSourceRef.current = null;
      setConnected(false);
    };
  }, [enabled, disconnect]);

  return { prices, connected, disconnect };
}
