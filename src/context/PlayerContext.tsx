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
import { apiFetch, clearToken, type ActiveSkillsState, type PlayerData } from "@/lib/api";
import { LoadingScreen } from "@/components/Loading";
import { SlicedActionButton } from "@/components/sliced";
import { SLICING } from "@/lib/slicing-paths";

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

function isAuthError(err: unknown): boolean {
  const status = (err as { status?: number })?.status;
  return status === 401 || status === 403;
}

function PlayerLoadGate({
  error,
  onRetry,
  onLogout,
}: {
  error: string | null;
  onRetry: () => void;
  onLogout: () => void;
}) {
  if (error) {
    return (
      <main className="min-h-[50vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="loading-glass-panel max-w-md w-full">
        <p className="text-sm font-bold text-white">{error}</p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <SlicedActionButton src={SLICING.mainMenu.button} onClick={onRetry} className="h-10 min-w-[7rem]">
            Try Again
          </SlicedActionButton>
          <SlicedActionButton
            src={SLICING.shop.unselectedButton}
            onClick={onLogout}
            className="h-10 min-w-[7rem]"
          >
            Back to Login
          </SlicedActionButton>
        </div>
        </div>
      </main>
    );
  }

  return <LoadingScreen label="Loading your Chomper..." />;
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [player, setPlayer] = useState<PlayerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef(false);
  const refresh = useCallback(async (options?: RefreshOptions) => {
    const silent = options?.silent ?? false;

    if (!silent) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      setError(null);
      const data = await apiFetch<PlayerData>("/api/player/me", { timeoutMs: 45_000 });
      setPlayer(data);

      // Sync offline skill progress in background (login uses fast /me without catch-up).
      void apiFetch<ActiveSkillsState>("/api/player/skills")
        .then((activeSkills) => {
          setPlayer((prev) => (prev ? { ...prev, activeSkills } : prev));
        })
        .catch(() => {});
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to load player";
      if (isAuthError(e)) {
        clearToken();
        window.location.replace("/login");
        return;
      }
      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    void refresh();
  }, [refresh]);

  const showGate = !player && (loading || error !== null);

  return (
    <PlayerContext.Provider
      value={{ player, loading, error, refreshing, refresh, setPlayer }}
    >
      {showGate ? (
        <PlayerLoadGate
          error={error}
          onRetry={() => void refresh()}
          onLogout={() => {
            clearToken();
            window.location.replace("/login");
          }}
        />
      ) : (
        children
      )}
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
