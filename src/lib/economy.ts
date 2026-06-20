export const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const MIN_ZCOIN_CLAIM = 0.0001;
export const MIN_COIN_CLAIM = 0.0001;

export const BASE_COINS_PER_DAY = 5;

/** Mirrors backend calculateOfflineEarnings — display tick only; claim uses server. */
export function calculateLivePending(
  dailyRate: number,
  lastClaimAt: string | Date | null,
  now: Date = new Date()
): number {
  if (!lastClaimAt || dailyRate <= 0) return 0;
  const since = typeof lastClaimAt === "string" ? new Date(lastClaimAt) : lastClaimAt;
  const msElapsed = Math.max(0, now.getTime() - since.getTime());
  return dailyRate * (msElapsed / MS_PER_DAY);
}
