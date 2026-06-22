// JWT 쿠키에서 토큰 읽기
export function getAccessToken(): string | null {
  const match = document.cookie.match(/(^| )accessToken=([^;]+)/);
  return match ? decodeURIComponent(match[2]) : null;
}

// JWT 페이로드 디코딩 (서명 검증은 백엔드 담당)
export function decodeJwt(token: string): JwtPayload | null {
  try {
    const payload = token.split(".")[1];
    const bytes = Uint8Array.from(atob(payload), (c) => c.charCodeAt(0));
    const decoded = new TextDecoder().decode(bytes);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

// JWT 만료 확인
export function isTokenExpired(token: string): boolean {
  const payload = decodeJwt(token);
  if (!payload?.exp) return true;
  return Date.now() >= payload.exp * 1000;
}

// 쿠키에서 JWT 읽고 유저 정보 반환
export function getAuthFromCookie() {
  const token = getAccessToken();
  if (!token || isTokenExpired(token)) return null;

  const payload = decodeJwt(token);
  if (!payload) return null;

  return {
    userId: payload.sub,
    nickname: payload.nickname || "",
  };
}

// 쿠키 삭제 (프론트 측)
export function removeAccessTokenCookie() {
  document.cookie = "accessToken=; path=/; max-age=0";
}

interface JwtPayload {
  sub: string;
  nickname: string;
  iat: number;
  exp: number;
}
