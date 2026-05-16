const KEYS = {
  access: "access_token",
  refresh: "refresh_token",
  expires: "access_token_expires_at",
} as const;

export function saveTokens(accessToken: string, refreshToken: string): void {
  const expiresAt = new Date(Date.now() + 25 * 60 * 1000).toISOString();
  localStorage.setItem(KEYS.access, accessToken);
  localStorage.setItem(KEYS.refresh, refreshToken);
  localStorage.setItem(KEYS.expires, expiresAt);
}

export function clearTokens(): void {
  localStorage.removeItem(KEYS.access);
  localStorage.removeItem(KEYS.refresh);
  localStorage.removeItem(KEYS.expires);
}

export function getAccessToken(): string | null {
  return localStorage.getItem(KEYS.access);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(KEYS.refresh);
}

export function isAccessTokenExpired(): boolean {
  const exp = localStorage.getItem(KEYS.expires);
  if (!exp) return true;
  return new Date(exp) <= new Date();
}

export async function refreshTokens(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;
  try {
    const res = await fetch("/api/v1/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!res.ok) {
      clearTokens();
      return false;
    }
    const data = await res.json();
    saveTokens(data.access_token, data.refresh_token);
    return true;
  } catch {
    clearTokens();
    return false;
  }
}
