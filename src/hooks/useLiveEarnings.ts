"use client";

import { useEffect, useState } from "react";
import { calculateLivePending, BASE_COINS_PER_DAY, MS_PER_DAY } from "@/lib/economy";

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

export function useLivePendingCoins(lastCoinsClaimAt: string | null) {
  const [pending, setPending] = useState(() =>
    calculateLivePending(BASE_COINS_PER_DAY, lastCoinsClaimAt)
  );

  useEffect(() => {
    const tick = () =>
      setPending(calculateLivePending(BASE_COINS_PER_DAY, lastCoinsClaimAt));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [lastCoinsClaimAt]);

  return pending;
}

export { MS_PER_DAY, BASE_COINS_PER_DAY };
