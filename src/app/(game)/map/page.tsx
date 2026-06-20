"use client";

import { useCallback, useEffect, useState } from "react";
import { UserAvatar } from "@/components/UserAvatar";
import {
  apiFetch,
  formatCoins,
  formatDuration,
  type PlotDetail,
  type PlotSummary,
} from "@/lib/api";
import {
  CoinIcon,
  CrownIcon,
  MapIcon,
  PlotIcon,
  SwordIcon,
} from "@/components/Icons";
import { usePlayer } from "@/hooks/usePlayer";
import { useTerritorySocket, type PlotPatchPayload } from "@/hooks/useTerritorySocket";
import { toast } from "@/lib/toast";
import { MapSkeleton, PlotDetailSkeleton, Spinner } from "@/components/Loading";

function plotCellClass(plot: PlotSummary, isSelected: boolean): string {
  if (isSelected) return "bg-[var(--green)] text-black border-2 border-white";

  if (plot.isLegendary) {
    return "border-2 border-[var(--gold)] text-[var(--gold)] bg-[#3a3520] shadow-[0_0_10px_rgba(251,197,49,0.3)]";
  }

  switch (plot.status) {
    case "owned":
      return "bg-[#2d4a35] text-[var(--green)] border border-[var(--green)]/40";
    case "abandoned":
      return "bg-[#4a3030] text-[#e88] border border-red-500/40";
    case "unclaimed":
    default:
      return "bg-[#3a453d] text-[var(--muted)]";
  }
}

function patchToSummary(patch: PlotPatchPayload): Partial<PlotSummary> {
  return {
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
}

export default function MapPage() {
  const { player, refresh } = usePlayer();
  const [plots, setPlots] = useState<PlotSummary[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(11);
  const [detail, setDetail] = useState<PlotDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState("");
  const [bidding, setBidding] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [takingOver, setTakingOver] = useState(false);
  const [countdownMs, setCountdownMs] = useState<number | null>(null);

  const zCoins = player?.zCoins ?? null;

  const refreshDetail = useCallback(async () => {
    if (selectedId === null) return;
    const refreshed = await apiFetch<{ plot: PlotDetail }>(`/api/plots/${selectedId}`);
    setDetail(refreshed.plot);
    setBidAmount(String(refreshed.plot.minBid ?? 7));
    setCountdownMs(refreshed.plot.claimRemainingMs ?? null);
  }, [selectedId]);

  useEffect(() => {
    async function load() {
      try {
        const { plots: allPlots } = await apiFetch<{ plots: PlotSummary[] }>(
          "/api/plots"
        );
        setPlots(allPlots);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (selectedId === null) return;
    refreshDetail();
  }, [selectedId, refreshDetail]);

  useEffect(() => {
    if (countdownMs === null) return;
    const timer = setInterval(() => {
      setCountdownMs((prev) => (prev === null ? null : Math.max(0, prev - 1000)));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdownMs]);

  const handleSocketEvent = useCallback(
    (event: string, payload: Record<string, unknown>) => {
      const plotId = payload.plotId as number | undefined;
      if (plotId === undefined) return;

      if (selectedId === plotId) {
        void refreshDetail();
      }

      if (event === "landCaptured" || event === "landPurchased") {
        if (plotId !== selectedId) {
          toast.info(`Plot #${String(plotId + 1).padStart(2, "0")} was claimed`);
        }
      } else if (event === "landLost") {
        if (plotId !== selectedId) {
          toast.info(`Plot #${String(plotId + 1).padStart(2, "0")} was abandoned or lost`);
        }
      }
    },
    [selectedId, refreshDetail]
  );

  const handlePlotPatch = useCallback(
    (patch: PlotPatchPayload) => {
      if (selectedId === patch.plotId && detail) {
        setDetail({ ...detail, ...patchToSummary(patch) });
        if (patch.lastClaimAt) {
          const elapsed = Date.now() - new Date(patch.lastClaimAt).getTime();
          setCountdownMs(Math.max(0, 7 * 24 * 60 * 60 * 1000 - elapsed));
        }
      }
    },
    [selectedId, detail]
  );

  useTerritorySocket({
    onPlotsChange: setPlots,
    onPlotPatch: handlePlotPatch,
    onEvent: handleSocketEvent,
  });

  async function handlePurchase() {
    if (selectedId === null) return;
    setPurchasing(true);
    try {
      await apiFetch(`/api/plots/${selectedId}/purchase`, { method: "POST" });
      await refresh({ silent: true });
      toast.success("Land purchased for 100 Z-Coins!");
      await refreshDetail();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Purchase failed");
    } finally {
      setPurchasing(false);
    }
  }

  async function handleClaimLand() {
    if (selectedId === null) return;
    setClaiming(true);
    try {
      await apiFetch(`/api/plots/${selectedId}/claim-land`, { method: "POST" });
      toast.success("Land claimed — 7-day timer reset!");
      await refreshDetail();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Claim failed");
    } finally {
      setClaiming(false);
    }
  }

  async function handleTakeover() {
    if (selectedId === null) return;
    setTakingOver(true);
    try {
      await apiFetch(`/api/plots/${selectedId}/takeover`, { method: "POST" });
      await refresh({ silent: true });
      toast.success("Abandoned plot taken over for 100 Z-Coins!");
      await refreshDetail();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Takeover failed");
    } finally {
      setTakingOver(false);
    }
  }

  async function handleOutbid() {
    if (selectedId === null) return;
    const amount = parseInt(bidAmount, 10);
    if (!Number.isInteger(amount) || amount < 7) {
      toast.error("Enter a whole-number 7-day bid (min 7 Z-Coins)");
      return;
    }
    setBidding(true);
    try {
      await apiFetch<{ zCoins: number }>(`/api/plots/${selectedId}/bid`, {
        method: "POST",
        body: JSON.stringify({ amount }),
      });
      await refresh({ silent: true });
      toast.success(`7-day lease bid placed: ${amount} Z-Coins`);
      await refreshDetail();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Bid failed");
    } finally {
      setBidding(false);
    }
  }

  if (loading) {
    return <MapSkeleton />;
  }

  const canPurchase =
    detail?.purchasePrice != null && detail.status === "unclaimed" && !detail.isLegendary;
  const canClaim = detail?.canClaimLand === true;
  const canTakeover = detail?.canTakeover === true;
  const canBid = detail?.status === "owned" && detail.landlordHandle && !detail.isLegendary;

  return (
    <>
      <h2 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2">
        <MapIcon className="w-6 h-6 text-[var(--green)] shrink-0" />
        Territory Map
      </h2>

      <div className="grid lg:grid-cols-[1.2fr_1fr] gap-4 lg:gap-6">
        <div className="card">
          <h3 className="stat-label mb-3">Select a Plot</h3>
          <div className="overflow-x-auto -mx-1 px-1 pb-1">
            <div className="grid grid-cols-10 gap-1 min-w-[280px] sm:min-w-0 sm:gap-1.5">
            {plots.map((plot) => {
              const displayNum = String(plot.plotId + 1).padStart(2, "0");
              const isSelected = selectedId === plot.plotId;
              return (
                <button
                  key={plot.plotId}
                  onClick={() => setSelectedId(plot.plotId)}
                  className={`
                    aspect-square rounded-md sm:rounded-lg text-[10px] sm:text-xs font-extrabold transition-transform active:scale-95
                    ${plotCellClass(plot, isSelected)}
                  `}
                >
                  #{displayNum}
                </button>
              );
            })}
            </div>
          </div>
          <div className="text-xs text-[var(--muted)] font-bold mt-4 space-y-1">
            <p className="flex items-center gap-1.5">
              <CrownIcon className="text-[var(--gold)]" />
              <span><span className="text-[var(--gold)]">Gold</span> = Legendary (NFT-linked)</span>
            </p>
            <p><span className="text-[var(--green)]">Green</span> = Owned frontier · <span className="text-red-400">Red</span> = Abandoned · Gray = Unclaimed</p>
          </div>
        </div>

        <div className="card">
          {detail ? (
            <>
              <h2 className="text-xl font-black text-[var(--green)] mb-1 flex items-center gap-2">
                <PlotIcon />
                PLOT #{detail.displayId ?? String(detail.plotId + 1).padStart(2, "0")}
              </h2>
              <p className="text-[var(--muted)] font-bold mb-2">{detail.name}</p>
              <p className="text-xs font-bold text-gray-400 mb-4">
                {detail.landType ?? (detail.isLegendary ? "Legendary" : "Frontier")}
                {detail.isLegendary && detail.legendaryTokenId != null && (
                  <> · NFT #{detail.legendaryTokenId}</>
                )}
                {!detail.isLegendary && detail.status === "owned" && countdownMs !== null && (
                  <> · Claim within {formatDuration(countdownMs)}</>
                )}
              </p>

              {canPurchase && (
                <div className="mb-4 p-4 bg-black/25 rounded-2xl border border-[var(--green)]/30">
                  <p className="text-sm font-bold text-gray-300 mb-3">
                    Unoccupied frontier land — purchase for {detail.purchasePrice} Z-Coins
                  </p>
                  <button
                    onClick={handlePurchase}
                    disabled={purchasing}
                    className="btn-primary w-full disabled:opacity-50"
                  >
                    {purchasing ? <Spinner size="sm" /> : "Purchase Land"}
                  </button>
                </div>
              )}

              {canClaim && (
                <div className="mb-4 p-4 bg-black/25 rounded-2xl border border-[var(--green)]/30">
                  <p className="text-sm font-bold text-gray-300 mb-2">
                    Reset your 7-day activity timer to keep this plot
                  </p>
                  {countdownMs !== null && (
                    <p className="text-xs text-[var(--gold)] font-bold mb-3">
                      Time remaining: {formatDuration(countdownMs)}
                    </p>
                  )}
                  <button
                    onClick={handleClaimLand}
                    disabled={claiming}
                    className="btn-primary w-full disabled:opacity-50"
                  >
                    {claiming ? <Spinner size="sm" /> : "Claim Land"}
                  </button>
                </div>
              )}

              {canTakeover && (
                <div className="mb-4 p-4 bg-black/25 rounded-2xl border border-red-500/30">
                  <p className="text-sm font-bold text-gray-300 mb-3">
                    This plot was abandoned — take over for 100 Z-Coins
                  </p>
                  <button
                    onClick={handleTakeover}
                    disabled={takingOver}
                    className="btn-danger w-full disabled:opacity-50"
                  >
                    {takingOver ? <Spinner size="sm" /> : "Takeover (100 Z)"}
                  </button>
                </div>
              )}

              {(detail.landlordHandle || detail.ownerWallet) && (
                <div className="bg-black/25 rounded-2xl p-4 mb-4 border border-[var(--gold)]/20">
                  <p className="stat-label mb-3 flex items-center gap-1.5 text-[var(--gold)]">
                    <CrownIcon className="w-4 h-4" />
                    {detail.isLegendary ? "Legendary Owner" : "Current Landlord"}
                  </p>
                  <div className="flex items-center gap-3">
                    {!detail.isLegendary && (
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden border-2 border-[var(--green)] bg-[#1e2420] shrink-0">
                        <UserAvatar
                          src={detail.landlordAvatarUrl || "/images/chomper.jpg"}
                          alt="Landlord"
                        />
                      </div>
                    )}
                    <div>
                      <p className="font-extrabold">
                        {detail.landlordHandle ??
                          (detail.ownerWallet
                            ? `${detail.ownerWallet.slice(0, 6)}…${detail.ownerWallet.slice(-4)}`
                            : "Unknown")}
                      </p>
                      {!detail.isLegendary && (
                        <p className="text-xs text-[var(--muted)] font-bold">
                          Receives {detail.landlordTaxPct ?? 10}% of each renter&apos;s 7-day bid per day
                        </p>
                      )}
                      {detail.isLegendary && detail.ownerWallet && (
                        <p className="text-xs text-[var(--muted)] font-bold font-mono">
                          {detail.ownerWallet}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {canBid && (
                <>
                  <div className="mb-4">
                    <p className="stat-label mb-3 flex items-center gap-1.5">
                      <SwordIcon />
                      Active Renters (Max 3)
                    </p>
                    {detail.renters.length === 0 ? (
                      <p className="text-sm text-[var(--muted)] font-bold">No renters yet</p>
                    ) : (
                      <ul className="space-y-2">
                        {detail.renters.map((r, i) => (
                          <li
                            key={r.walletAddress}
                            className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-black/15 rounded-xl px-3 py-2.5 text-sm font-bold gap-1"
                          >
                            <span>
                              {i + 1}. {r.twitterHandle || `${r.walletAddress.slice(0, 8)}...`}
                            </span>
                            <span className="text-[var(--gold)] flex items-center gap-1 flex-wrap">
                              <CoinIcon className="w-3.5 h-3.5" />
                              {r.sevenDayBid ?? r.escrowBalance} Z / 7 days
                              {r.leaseExpiresAt && (
                                <span className="text-[10px] text-gray-400">
                                  · until {new Date(r.leaseExpiresAt).toLocaleDateString()}
                                </span>
                              )}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 mt-6">
                    <label className="text-xs text-gray-400 font-bold">
                      7-day bid (whole Z-Coins, min {detail.minBid ?? 7})
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="number"
                        min={detail.minBid ?? 7}
                        step={1}
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        placeholder={`Min. ${detail.minBid ?? 7}`}
                        className="flex-1 bg-black/30 border-2 border-[#3a453d] rounded-xl px-4 py-3 font-bold text-white outline-none focus:border-[var(--gold)] min-h-[48px]"
                      />
                      <button
                        onClick={handleOutbid}
                        disabled={bidding}
                        className="btn-danger px-6 py-3 shrink-0 disabled:opacity-50 min-h-[48px]"
                      >
                        <SwordIcon className="w-4 h-4" />
                        {bidding ? <Spinner size="sm" /> : "BID / EXTEND"}
                      </button>
                    </div>
                    {zCoins !== null && (
                      <p className="text-[10px] text-gray-500 font-bold">
                        Your balance: {formatCoins(zCoins)} Z-Coins
                      </p>
                    )}
                  </div>
                </>
              )}
            </>
          ) : selectedId !== null ? (
            <PlotDetailSkeleton />
          ) : (
            <p className="text-[var(--muted)] font-bold">Select a plot</p>
          )}
        </div>
      </div>
    </>
  );
}
