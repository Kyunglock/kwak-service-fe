import { useCurrency } from "@/app/contexts/CurrencyContext";

export function CurrencyToggleButton() {
  const { currency, toggleCurrency } = useCurrency();
  const isKRW = currency === "KRW";

  return (
    <button
      onClick={toggleCurrency}
      className="flex items-center gap-0.5 rounded-full border border-slate-500 bg-slate-700 p-0.5 text-xs font-semibold shadow-sm transition-colors hover:border-slate-400"
      aria-label="통화 전환"
    >
      <span
        className={`rounded-full px-2.5 py-1 transition-colors ${
          !isKRW
            ? "bg-blue-600 text-white shadow"
            : "text-gray-400 hover:text-gray-300"
        }`}
      >
        USD
      </span>
      <span
        className={`rounded-full px-2.5 py-1 transition-colors ${
          isKRW
            ? "bg-rose-600 text-white shadow"
            : "text-gray-400 hover:text-gray-300"
        }`}
      >
        KRW
      </span>
    </button>
  );
}
