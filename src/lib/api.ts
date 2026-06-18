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

export interface OwnedNft {
  tokenId: number;
  rarity: "common" | "uncommon" | "rare" | "legendary";
}

export interface ActionStatus {
  state: "idle" | "running" | "completed";
  skill: string | null;
  progressPct: number;
  secondsRemaining: number;
  startedAt: string | null;
  durationMs: number | null;
}

export interface ActiveSkillEntry {
  id: string;
  label: string;
  level: number;
  xp: number;
  xpToNext: number;
  upgradeCost: number;
  rewardItemId: string;
  rewardItemLabel: string;
  successPct: number;
  failPct: number;
}

export interface ActiveSkillsState {
  selectedSkill: string;
  skills: ActiveSkillEntry[];
  selected: ActiveSkillEntry & {
    inventoryQty: number;
  };
  action: ActionStatus;
}

export interface InventoryStack {
  itemId: string;
  name: string;
  shortLabel: string;
  quantity: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  profilePicUrl: string;
  value: number;
}

export interface PlayerData {
  id: string;
  twitterId: string;
  twitterHandle: string;
  username: string;
  profilePicUrl: string;
  walletAddress: string | null;
  nftCount: number;
  multiplier: number;
  zCoins: number;
  coins: number;
  lastLoginAt: string;
  lastClaimedAt: string;
  lastClaimAt: string;
  powerLvl: number;
  speedLvl: number;
  speedUpgradingUntil?: string | null;
  speedUpgradeRemainingMs?: number;
  isSpeedUpgrading?: boolean;
  powerUpgradeCost: number;
  speedUpgradeCost: number;
  cachedNftCount: number;
  cachedTokenIds?: number[];
  nfts: OwnedNft[];
  chomperLabel: string;
  activeSkills?: ActiveSkillsState;
  economy: PlayerEconomy;
}

export interface PlotRenter {
  walletAddress: string;
  twitterHandle?: string;
  dailyBid: number;
  escrowBalance: number;
}

export interface PlotSummary {
  plotId: number;
  isLegendary: boolean;
  legendaryTokenId: number | null;
  name: string;
  ownerWallet: string | null;
  landlordHandle?: string | null;
  landlordAvatarUrl?: string | null;
  status: string;
  renters: PlotRenter[];
}

export interface PlotDetail extends PlotSummary {
  landType?: string;
  displayId?: string;
  minBid?: number;
  landlordTaxPct?: number;
}

export interface FurnitureItem {
  id: string;
  name: string;
  price: number;
  w: number;
  h: number;
  color: string;
  shortLabel: string;
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
    const err = (await res.json().catch(() => ({ error: res.statusText }))) as {
      error?: string;
      code?: string;
    };
    const message = err.error || "Request failed";
    const error = new Error(message) as Error & { code?: string };
    if (err.code) error.code = err.code;
    throw error;
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

export function formatDuration(ms: number): string {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
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
