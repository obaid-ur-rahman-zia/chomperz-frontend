"use client";

import { useEffect, useState } from "react";
import {
  calculateLivePending,
  getDailyTaskStatus,
  MS_PER_DAY,
} from "@/lib/economy";

export function useLivePendingZCoins(dailyRate: number, lastClaimAt: string | null) {
  const [pending, setPending] = useState(() =>
    calculateLivePending(dailyRate, lastClaimAt)
  );

  useEffect(() => {
    const tick = () => setPending(calculateLivePending(dailyRate, lastClaimAt));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [dailyRate, lastClaimAt]);

  return pending;
}

export function useDailyTaskStatus(lastDailyTaskAt: string | null) {
  const [status, setStatus] = useState(() => getDailyTaskStatus(lastDailyTaskAt));

  useEffect(() => {
    const tick = () => setStatus(getDailyTaskStatus(lastDailyTaskAt));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [lastDailyTaskAt]);

  return status;
}

export { MS_PER_DAY };
