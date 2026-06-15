"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, type PlayerData } from "@/lib/api";

export function usePlayer() {
  const [player, setPlayer] = useState<PlayerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const data = await apiFetch<PlayerData>("/api/player/me");
      setPlayer(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load player");
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { player, loading, error, refresh, setPlayer };
}
