"use client";

import { useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";
import type { PlotSummary } from "@/lib/api";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL?.replace(/\/$/, "") ||
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "";

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

export function useTerritorySocket(options: {
  enabled?: boolean;
  onPlotPatch?: (patch: PlotPatchPayload) => void;
  onPlotsChange?: (updater: (prev: PlotSummary[]) => PlotSummary[]) => void;
  onEvent?: (event: string, payload: Record<string, unknown>) => void;
}) {
  const { enabled = true, onPlotPatch, onPlotsChange, onEvent } = options;
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!enabled || !SOCKET_URL || typeof window === "undefined") return;

    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      withCredentials: true,
    });
    socketRef.current = socket;

    socket.on("plots:patch", (patch: PlotPatchPayload) => {
      onPlotPatch?.(patch);
      onPlotsChange?.((prev) => mergePlotPatch(prev, patch));
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
        onEvent?.(event, payload);
      });
    }

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [enabled, onEvent, onPlotPatch, onPlotsChange]);

  return { connected: Boolean(socketRef.current?.connected) };
}

export function applyPlotPatch(plots: PlotSummary[], patch: PlotPatchPayload): PlotSummary[] {
  return mergePlotPatch(plots, patch);
}
