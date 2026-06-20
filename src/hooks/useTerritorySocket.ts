"use client";

import { useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";
import { apiFetch, type PlotSummary } from "@/lib/api";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL?.replace(/\/$/, "") ||
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "";

const POLL_INTERVAL_MS = 12_000;

export interface PlotPatchPayload {
  plotId: number;
  isLegendary: boolean;
  legendaryTokenId: number | null;
  name: string;
  ownerWallet: string | null;
  landlordHandle: string | null;
  status: string;
  lastClaimAt: string | null;
  abandonedAt: string | null;
  renters: PlotSummary["renters"];
}

function mergePlotPatch(plots: PlotSummary[], patch: PlotPatchPayload): PlotSummary[] {
  const idx = plots.findIndex((p) => p.plotId === patch.plotId);
  const merged: PlotSummary = {
    plotId: patch.plotId,
    isLegendary: patch.isLegendary,
    legendaryTokenId: patch.legendaryTokenId,
    name: patch.name,
    ownerWallet: patch.ownerWallet,
    landlordHandle: patch.landlordHandle,
    status: patch.status,
    lastClaimAt: patch.lastClaimAt,
    abandonedAt: patch.abandonedAt,
    renters: patch.renters,
  };
  if (idx === -1) return [...plots, merged].sort((a, b) => a.plotId - b.plotId);
  const next = [...plots];
  next[idx] = { ...next[idx], ...merged };
  return next;
}

function isSocketExplicitlyDisabled(): boolean {
  const flag = process.env.NEXT_PUBLIC_SOCKET_ENABLED?.trim().toLowerCase();
  return flag === "false" || flag === "0" || flag === "no";
}

/** Vercel serverless cannot host persistent Socket.IO — use HTTP polling instead. */
function isServerlessSocketHost(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return host.endsWith(".vercel.app");
  } catch {
    return url.includes(".vercel.app");
  }
}

async function fetchPlots(): Promise<PlotSummary[]> {
  const { plots } = await apiFetch<{ plots: PlotSummary[] }>("/api/plots");
  return plots;
}

export function useTerritorySocket(options: {
  enabled?: boolean;
  onPlotPatch?: (patch: PlotPatchPayload) => void;
  onPlotsChange?: (updater: (prev: PlotSummary[]) => PlotSummary[]) => void;
  onEvent?: (event: string, payload: Record<string, unknown>) => void;
  /** Called after each HTTP poll (e.g. refresh selected plot detail). */
  onPoll?: () => void;
}) {
  const { enabled = true, onPlotPatch, onPlotsChange, onEvent, onPoll } = options;

  const onPlotPatchRef = useRef(onPlotPatch);
  const onPlotsChangeRef = useRef(onPlotsChange);
  const onEventRef = useRef(onEvent);
  const onPollRef = useRef(onPoll);

  onPlotPatchRef.current = onPlotPatch;
  onPlotsChangeRef.current = onPlotsChange;
  onEventRef.current = onEvent;
  onPollRef.current = onPoll;

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    let pollId: ReturnType<typeof setInterval> | null = null;
    let socket: Socket | null = null;
    let pollingActive = false;

    const startPolling = () => {
      if (pollingActive) return;
      pollingActive = true;

      const runPoll = async () => {
        try {
          const plots = await fetchPlots();
          onPlotsChangeRef.current?.(() => plots);
          onPollRef.current?.();
        } catch {
          /* ignore transient poll errors */
        }
      };

      void runPoll();
      pollId = setInterval(runPoll, POLL_INTERVAL_MS);
    };

    const stopPolling = () => {
      pollingActive = false;
      if (pollId) {
        clearInterval(pollId);
        pollId = null;
      }
    };

    const useSocket =
      Boolean(SOCKET_URL) &&
      !isSocketExplicitlyDisabled() &&
      !isServerlessSocketHost(SOCKET_URL);

    if (!useSocket) {
      startPolling();
      return stopPolling;
    }

    socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      withCredentials: true,
      reconnectionAttempts: 2,
      reconnectionDelay: 2000,
      timeout: 10_000,
    });

    socket.on("plots:patch", (patch: PlotPatchPayload) => {
      onPlotPatchRef.current?.(patch);
      onPlotsChangeRef.current?.((prev) => mergePlotPatch(prev, patch));
    });

    const events = [
      "landPurchased",
      "landClaimed",
      "landLost",
      "landCaptured",
      "bidPlaced",
    ] as const;

    for (const event of events) {
      socket.on(event, (payload: Record<string, unknown>) => {
        onEventRef.current?.(event, payload);
      });
    }

    socket.io.on("reconnect_failed", () => {
      socket?.disconnect();
      socket = null;
      startPolling();
    });

    return () => {
      socket?.disconnect();
      stopPolling();
    };
  }, [enabled]);

  return {};
}

export function applyPlotPatch(plots: PlotSummary[], patch: PlotPatchPayload): PlotSummary[] {
  return mergePlotPatch(plots, patch);
}
