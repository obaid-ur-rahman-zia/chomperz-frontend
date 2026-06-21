"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Spinner } from "@/components/Loading";

const PULL_THRESHOLD = 72;
const MAX_PULL = 120;

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
}

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const pulling = useRef(false);
  const canPull = useRef(false);
  const refreshingRef = useRef(false);

  const runRefresh = useCallback(async () => {
    if (refreshingRef.current) return;
    refreshingRef.current = true;
    setRefreshing(true);
    setPull(PULL_THRESHOLD);
    try {
      await onRefresh();
    } finally {
      refreshingRef.current = false;
      setRefreshing(false);
      setPull(0);
    }
  }, [onRefresh]);

  useEffect(() => {
    function onAppRefresh() {
      void runRefresh();
    }
    window.addEventListener("chomperz:pull-refresh", onAppRefresh);
    return () => window.removeEventListener("chomperz:pull-refresh", onAppRefresh);
  }, [runRefresh]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    function onTouchStart(e: TouchEvent) {
      if (refreshingRef.current) return;
      canPull.current = window.scrollY <= 0;
      if (!canPull.current) return;
      pulling.current = true;
      startY.current = e.touches[0]?.clientY ?? 0;
    }

    function onTouchMove(e: TouchEvent) {
      if (!pulling.current || refreshingRef.current || !canPull.current) return;
      const y = e.touches[0]?.clientY ?? 0;
      const delta = y - startY.current;
      if (delta <= 0) {
        setPull(0);
        return;
      }
      if (window.scrollY > 0) {
        pulling.current = false;
        setPull(0);
        return;
      }
      e.preventDefault();
      setPull(Math.min(delta * 0.45, MAX_PULL));
    }

    function onTouchEnd() {
      if (!pulling.current) return;
      pulling.current = false;
      setPull((current) => {
        if (current >= PULL_THRESHOLD) {
          void runRefresh();
        }
        return current >= PULL_THRESHOLD ? current : 0;
      });
    }

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    el.addEventListener("touchcancel", onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [runRefresh]);

  const showIndicator = pull > 8 || refreshing;
  const offset = refreshing ? PULL_THRESHOLD : pull;
  const progress = refreshing ? 1 : Math.min(pull / PULL_THRESHOLD, 1);

  return (
    <div ref={rootRef} className="relative touch-pan-y">
      <div
        className="pointer-events-none absolute left-0 right-0 z-20 flex justify-center transition-opacity duration-200"
        style={{
          top: 0,
          opacity: showIndicator ? 1 : 0,
        }}
        aria-hidden={!showIndicator}
      >
        <div
          className="flex items-center gap-2 rounded-full bg-black/50 px-3 py-1.5 text-xs font-bold text-[var(--green)] border border-[var(--green)]/30"
          style={{ transform: `translateY(${Math.max(offset - 36, 4)}px)` }}
        >
          {refreshing ? (
            <>
              <Spinner size="sm" />
              Refreshing…
            </>
          ) : (
            <>
              <span
                className="inline-block transition-transform"
                style={{ transform: `rotate(${progress * 180}deg)` }}
              >
                ↓
              </span>
              {progress >= 1 ? "Release to refresh" : "Pull to refresh"}
            </>
          )}
        </div>
      </div>

      <div
        className="transition-transform duration-200 ease-out will-change-transform"
        style={{ transform: showIndicator ? `translateY(${offset}px)` : undefined }}
      >
        {children}
      </div>
    </div>
  );
}

export function dispatchPullRefresh() {
  window.dispatchEvent(new CustomEvent("chomperz:pull-refresh"));
}
