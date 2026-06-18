"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { apiFetch, type PlayerData } from "@/lib/api";

interface RefreshOptions {
  silent?: boolean;
}

interface PlayerContextValue {
  player: PlayerData | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refresh: (options?: RefreshOptions) => Promise<void>;
  setPlayer: React.Dispatch<React.SetStateAction<PlayerData | null>>;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [player, setPlayer] = useState<PlayerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const fetchedRef = useRef(false);

  const refresh = useCallback(
    async (options?: RefreshOptions) => {
      const silent = options?.silent ?? false;

      if (!silent && player === null) {
        setLoading(true);
      } else if (silent) {
        setRefreshing(true);
      }

      try {
        setError(null);
        const data = await apiFetch<PlayerData>("/api/player/me");
        setPlayer(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load player");
        router.push("/login");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [router, player]
  );

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    refresh();
  }, [refresh]);

  return (
    <PlayerContext.Provider
      value={{ player, loading, error, refreshing, refresh, setPlayer }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayerContext() {
  const ctx = useContext(PlayerContext);
  if (!ctx) {
    throw new Error("usePlayerContext must be used within PlayerProvider");
  }
  return ctx;
}
