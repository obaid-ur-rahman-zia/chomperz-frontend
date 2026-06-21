export const TOKEN_KEY = "chomperz_token";

/** Flag cookie — set alongside localStorage so new tabs detect login. */
export const SESSION_COOKIE = "chomperz_session";

export const SESSION_MAX_AGE_SEC = 7 * 24 * 60 * 60;

export function sessionCookieValue(): string {
  return `${SESSION_COOKIE}=1; path=/; max-age=${SESSION_MAX_AGE_SEC}; samesite=lax`;
}

export function clearSessionCookieValue(): string {
  return `${SESSION_COOKIE}=; path=/; max-age=0; samesite=lax`;
}
