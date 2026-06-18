export const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const MIN_ZCOIN_CLAIM = 0.0001;

export const DAILY_TASK_COINS = 25;

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

export function getDailyTaskStatus(
  lastDailyTaskAt: string | null,
  now: Date = new Date()
): { available: boolean; remainingMs: number; reward: number } {
  if (!lastDailyTaskAt) {
    return { available: true, remainingMs: 0, reward: DAILY_TASK_COINS };
  }
  const elapsed = now.getTime() - new Date(lastDailyTaskAt).getTime();
  if (elapsed >= MS_PER_DAY) {
    return { available: true, remainingMs: 0, reward: DAILY_TASK_COINS };
  }
  return {
    available: false,
    remainingMs: MS_PER_DAY - elapsed,
    reward: DAILY_TASK_COINS,
  };
}
