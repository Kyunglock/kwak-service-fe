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
  // useEffect cleanup 은 void 를 요구한다 — Set.delete 의 boolean 을 흘리지 않는다.
  return () => {
    listeners.delete(listener);
  };
}
