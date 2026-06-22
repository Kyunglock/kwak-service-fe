import { useState, useEffect, useCallback } from "react";
import { onAlert, type AlertEvent, type AlertType } from "@/app/utils/alertEvent";
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

const ICON_MAP: Record<AlertType, typeof AlertCircle> = {
  error: AlertCircle,
  success: CheckCircle2,
  warning: AlertTriangle,
  info: Info,
};

const STYLE_MAP: Record<AlertType, { bg: string; border: string; icon: string }> = {
  error: { bg: "bg-red-950/95", border: "border-red-700", icon: "text-red-400" },
  success: { bg: "bg-green-950/95", border: "border-green-700", icon: "text-green-400" },
  warning: { bg: "bg-yellow-950/95", border: "border-yellow-700", icon: "text-yellow-400" },
  info: { bg: "bg-blue-950/95", border: "border-blue-700", icon: "text-blue-400" },
};

const AUTO_CLOSE_MS = 3000;

interface AlertItem extends AlertEvent {
  id: number;
  exiting: boolean;
}

let idCounter = 0;

export function MobileAlert() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  const removeAlert = useCallback((id: number) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, exiting: true } : a)));
    setTimeout(() => {
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    }, 300);
  }, []);

  useEffect(() => {
    return onAlert((event) => {
      const id = ++idCounter;
      setAlerts((prev) => [...prev, { ...event, id, exiting: false }]);
      setTimeout(() => removeAlert(id), AUTO_CLOSE_MS);
    });
  }, [removeAlert]);

  if (alerts.length === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] flex flex-col items-center gap-2 p-3 pointer-events-none">
      {alerts.map((alert) => {
        const style = STYLE_MAP[alert.type];
        const Icon = ICON_MAP[alert.type];

        return (
          <div
            key={alert.id}
            className={`
              pointer-events-auto w-full max-w-md
              flex items-start gap-3 px-4 py-3
              rounded-xl border shadow-lg backdrop-blur-sm
              ${style.bg} ${style.border}
              transition-all duration-300 ease-out
              ${alert.exiting ? "opacity-0 -translate-y-2" : "opacity-100 translate-y-0 animate-slide-down"}
            `}
          >
            <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${style.icon}`} />
            <p className="text-sm text-gray-100 flex-1 break-words">{alert.message}</p>
            <button
              onClick={() => removeAlert(alert.id)}
              className="shrink-0 text-gray-400 hover:text-gray-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
