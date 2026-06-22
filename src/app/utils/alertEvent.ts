export type AlertType = 'error' | 'success' | 'warning' | 'info';

export interface AlertEvent {
  message: string;
  type: AlertType;
}

type AlertListener = (event: AlertEvent) => void;

const listeners: Set<AlertListener> = new Set();

export function showAlert(message: string, type: AlertType = 'error') {
  const event: AlertEvent = { message, type };
  listeners.forEach((listener) => listener(event));
}

export function onAlert(listener: AlertListener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
