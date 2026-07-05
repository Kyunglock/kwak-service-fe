// 메뉴 이동(탭 전환) 로그 전송 — 사용 패턴 분석용 (tbl_menu_log)
// apiClient(axios)는 실패 시 토스트를 띄우므로 사용하지 않고,
// 실패해도 조용히 무시되는 fire-and-forget fetch를 쓴다.

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const SESSION_KEY = "menuLogSessionId";

/** crypto.randomUUID()는 secure context(HTTPS/localhost) 전용이라 http://192.168.x.x 접속 시 사용 불가 → getRandomValues 폴백 */
function generateId(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** 브라우저 세션 단위 UUID — 세션 내 메뉴 이동 흐름 추적용 */
function getSessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = generateId();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

/** 메뉴 이동 기록. prevMenuCd는 직전 탭 (최초 진입은 null). */
export function logMenuMove(menuCd: string, prevMenuCd: string | null) {
  try {
    fetch(`${BASE_URL}/api/v1/menu-logs`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ menuCd, prevMenuCd, sessionId: getSessionId() }),
    }).catch(() => {
      // 로그 전송 실패는 UX에 영향 주지 않음
    });
  } catch {
    // sessionStorage/fetch 불가 환경에서도 앱 동작에 영향 없음
  }
}
