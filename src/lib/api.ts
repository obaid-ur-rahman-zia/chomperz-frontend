const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";

/** Same URL on server and client — avoids hydration mismatch. */
export function getApiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (!API_URL) {
    return normalized;
  }
  return `${API_URL}${normalized}`;
}

export interface PlayerEconomy {
  nftCount: number;
  quantityBoost: number;
  rarityBoost: number;
  nftMultiplier: number;
  powerMultiplier: number;
  dailyRate: number;
  pendingEarnings: number;
}

export interface PlayerData {
  id: string;
  twitterHandle: string;
  profilePicUrl: string;
  walletAddress: string | null;
  zCoins: number;
  powerLvl: number;
  speedLvl: number;
  lastClaimedAt: string;
  cachedNftCount: number;
  economy: PlayerEconomy;
}

export interface PlotSummary {
  plotId: number;
  isLegendary: boolean;
  legendaryTokenId: number | null;
  name: string;
  ownerWallet: string | null;
  status: string;
  renters: { walletAddress: string; dailyBid: number; escrowBalance: number }[];
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<T> {
  const { token, ...init } = options;
  const headers: HeadersInit = {
    ...(init.body ? { "Content-Type": "application/json" } : {}),
    ...(init.headers || {}),
  };
  const stored = token ?? getToken();
  if (stored) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${stored}`;
  }

  const res = await fetch(getApiUrl(path), {
    ...init,
    headers,
    credentials: "include",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || "Request failed");
  }

  return res.json() as Promise<T>;
}

export function formatPercent(value: number): string {
  return `+${Math.round(value * 100)}%`;
}

export function formatCoins(value: number): string {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("chomperz_token");
}

export function setToken(token: string): void {
  localStorage.setItem("chomperz_token", token);
}

export function clearToken(): void {
  localStorage.removeItem("chomperz_token");
}
