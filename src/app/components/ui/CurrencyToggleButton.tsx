import { useCurrency } from "@/app/contexts/CurrencyContext";

export function CurrencyToggleButton() {
  const { currency, toggleCurrency } = useCurrency();
  const isKRW = currency === "KRW";

  return (
    <button
      onClick={toggleCurrency}
      className="flex items-center gap-0.5 rounded-full border border-border bg-muted p-0.5 text-xs font-semibold shadow-paper transition-colors hover:border-primary/40"
      aria-label="통화 전환"
    >
      <span
        className={`rounded-full px-2.5 py-1 transition-colors ${
          !isKRW
            ? "bg-primary text-primary-foreground shadow-paper"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        USD
      </span>
      <span
        className={`rounded-full px-2.5 py-1 transition-colors ${
          isKRW
            ? "bg-primary text-primary-foreground shadow-paper"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        KRW
      </span>
    </button>
  );
}
