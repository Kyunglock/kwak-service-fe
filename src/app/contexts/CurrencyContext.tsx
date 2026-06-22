import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

export type DisplayCurrency = "KRW" | "USD";

export const EXCHANGE_RATE = 1500; // 1 USD = 1500 KRW

interface CurrencyContextValue {
  currency: DisplayCurrency;
  toggleCurrency: () => void;
  setCurrency: (c: DisplayCurrency) => void;
  /** 금액을 현재 선택된 통화로 변환 */
  convert: (amount: number, fromCurrency: string) => number;
  /** 현재 통화로 포맷된 문자열 반환 */
  format: (amount: number, fromCurrency: string) => string;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<DisplayCurrency>("USD");

  const toggleCurrency = () =>
    setCurrency((prev) => (prev === "USD" ? "KRW" : "USD"));

  function convert(amount: number, fromCurrency: string): number {
    if (fromCurrency === currency) return amount;
    if (fromCurrency === "KRW" && currency === "USD") return amount / EXCHANGE_RATE;
    if (fromCurrency === "USD" && currency === "KRW") return amount * EXCHANGE_RATE;
    return amount;
  }

  function format(amount: number, fromCurrency: string): string {
    const converted = convert(amount, fromCurrency);
    if (currency === "KRW") {
      return `₩${Math.round(converted).toLocaleString("ko-KR")}`;
    }
    return `$${converted.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  return (
    <CurrencyContext.Provider value={{ currency, toggleCurrency, setCurrency, convert, format }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}
