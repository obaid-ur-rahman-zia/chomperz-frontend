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
  coinsDailyRate: number;
  pendingCoins: number;
}

export interface OwnedNft {
  tokenId: number;
  rarity: "common" | "uncommon" | "rare" | "legendary";
  imageUrl?: string;
  isCrownBound?: boolean;
}

export interface ActionStatus {
  state: "idle" | "running" | "completed";
  skill: string | null;
  progressPct: number;
  secondsRemaining: number;
  startedAt: string | null;
  durationMs: number | null;
}

export interface PlayerSkillEntry {
  skillName: string;
  level: number;
  xp: number;
  active: boolean;
  actionDurationMs: number;
  successPct: number;
}

export interface ActiveSkillEntry {
  id: string;
  label: string;
  level: number;
  xp: number;
  xpToNext: number;
  rewardItemId: string;
  rewardItemLabel: string;
  successPct: number;
  failPct: number;
  inputItemId?: string | null;
  inputQuantity?: number;
  actionDurationMs?: number;
  upgradeCost?: number;
}

export interface ActiveSkillsState {
  selectedSkill: string;
  playerSkills?: PlayerSkillEntry[];
  skills: ActiveSkillEntry[];
  selected: ActiveSkillEntry & {
    inventoryQty: number;
    inputQty?: number;
    actionDurationMs?: number;
    actionDurationSec?: number;
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
  displayAvatarUrl?: string;
  value: number;
}

export interface PlayerData {
  id: string;
  twitterId: string;
  twitterHandle: string;
  username: string;
  profilePicUrl: string;
  displayAvatarUrl?: string;
  avatarSource?: "default" | "twitter" | "nft";
  avatarNftTokenId?: number | null;
  walletAddress: string | null;
  nftCount: number;
  multiplier: number;
  zCoins: number;
  coins: number;
  lastLoginAt: string;
  lastClaimedAt: string;
  lastClaimAt: string;
  lastCoinsClaimAt: string;
  powerLvl: number;
  speedLvl: number;
  speedUpgradingUntil?: string | null;
  powerUpgradingUntil?: string | null;
  speedUpgradeRemainingMs?: number;
  powerUpgradeRemainingMs?: number;
  isSpeedUpgrading?: boolean;
  isPowerUpgrading?: boolean;
  powerUpgradeCost: number;
  speedUpgradeCost: number;
  cachedNftCount: number;
  cachedTokenIds?: number[];
  nfts: OwnedNft[];
  nftCollectionName: string;
  nftContractAddress: string | null;
  isDevNftCollection?: boolean;
  chomperLabel: string;
  activeSkills?: ActiveSkillsState;
  economy: PlayerEconomy;
}

export interface PlotRenter {
  walletAddress: string;
  twitterHandle?: string;
  sevenDayBid?: number;
  dailyBid: number;
  escrowBalance: number;
  leaseExpiresAt?: string;
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
  lastClaimAt?: string | null;
  abandonedAt?: string | null;
  renters: PlotRenter[];
}

export interface PlotDetail extends PlotSummary {
  landType?: string;
  displayId?: string;
  minBid?: number;
  purchasePrice?: number | null;
  canTakeover?: boolean;
  loginRemainingMs?: number | null;
  landlordTaxPct?: number;
  viewerOwnsFrontierLand?: boolean;
  viewerHasWallet?: boolean;
  viewerCanPurchase?: boolean;
  viewerCanTakeover?: boolean;
  viewerCanBid?: boolean;
}

export interface FurnitureCost {
  coins?: number;
  zCoins?: number;
  wood?: number;
  plank?: number;
  ore?: number;
  ingot?: number;
}

export interface FurnitureItem {
  id: string;
  name: string;
  tier: "wooden" | "iron" | "fancy";
  cost: FurnitureCost;
  w: number;
  h: number;
  color: string;
  shortLabel: string;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string; timeoutMs?: number } = {}
): Promise<T> {
  const { token, timeoutMs = 30_000, ...init } = options;
  const headers: HeadersInit = {
    ...(init.body ? { "Content-Type": "application/json" } : {}),
    ...(init.headers || {}),
  };
  const stored = token ?? getToken();
  if (stored) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${stored}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let res: Response;
  try {
    res = await fetch(getApiUrl(path), {
      ...init,
      headers,
      credentials: "include",
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("Request timed out. The server may be busy — try again.");
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!res.ok) {
    const err = (await res.json().catch(() => ({ error: res.statusText }))) as {
      error?: string;
      code?: string;
    };
    const message = err.error || "Request failed";
    const error = new Error(message) as Error & { code?: string; status?: number };
    if (err.code) error.code = err.code;
    error.status = res.status;
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

/** Shorter display for tight mobile header slots */
export function formatCoinsCompact(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(2).replace(/\.?0+$/, "")}B`;
  }
  if (abs >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2).replace(/\.?0+$/, "")}M`;
  }
  if (abs >= 10_000) {
    return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  if (abs >= 1_000) {
    return value.toLocaleString(undefined, { maximumFractionDigits: 1 });
  }
  return formatCoins(value);
}

export function formatDuration(ms: number): string {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

import {
  TOKEN_KEY,
  SESSION_COOKIE,
  sessionCookieValue,
  clearSessionCookieValue,
} from "./auth";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function hasSession(): boolean {
  return getToken() !== null;
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
  if (typeof document !== "undefined") {
    document.cookie = sessionCookieValue();
  }
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  if (typeof document !== "undefined") {
    document.cookie = clearSessionCookieValue();
  }
}

export { SESSION_COOKIE } from "./auth";
