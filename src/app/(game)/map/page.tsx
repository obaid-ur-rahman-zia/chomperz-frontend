"use client";

import { useCallback, useEffect, useState } from "react";
import { UserAvatar } from "@/components/UserAvatar";
import {
  apiFetch,
  formatDuration,
  type PlotDetail,
  type PlotSummary,
} from "@/lib/api";
import { CrownIcon } from "@/components/Icons";
import { usePlayer } from "@/hooks/usePlayer";
import { useTerritorySocket, type PlotPatchPayload } from "@/hooks/useTerritorySocket";
import { toast } from "@/lib/toast";
import { SlicedPage, SlicedImageButton } from "@/components/sliced";
import { SLICING } from "@/lib/slicing-paths";
import Image from "next/image";
import { MapSkeleton, PlotDetailSkeleton, Spinner } from "@/components/Loading";

function plotCellBg(plot: PlotSummary): string | null {
  if (plot.isLegendary) return SLICING.map.crownPanel;
  if (plot.status === "owned") return SLICING.map.ownedPanel;
  if (plot.status === "abandoned") return SLICING.map.abandonedPanel;
  return null;
}

function plotCellClass(plot: PlotSummary, isSelected: boolean): string {
  const base = "aspect-square rounded text-[8px] sm:text-[9px] font-extrabold transition-transform active:scale-95 relative overflow-hidden";
  if (isSelected) return `${base} ring-2 ring-white ring-offset-1 ring-offset-transparent z-[2]`;
  if (plot.isLegendary) return `${base} text-[var(--gold)]`;
  switch (plot.status) {
    case "owned":
      return `${base} text-[var(--green)]`;
    case "abandoned":
      return `${base} text-red-300`;
    default:
      return `${base} text-white/80 border border-[#4ade80]/50 bg-black/20`;
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
    landlordAvatarUrl: patch.landlordAvatarUrl ?? null,
    status: patch.status,
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
  const [takingOver, setTakingOver] = useState(false);
  const [loginCountdownMs, setLoginCountdownMs] = useState<number | null>(null);

  const refreshDetail = useCallback(async () => {
    if (selectedId === null) return;
    const refreshed = await apiFetch<{ plot: PlotDetail }>(`/api/plots/${selectedId}`);
    setDetail(refreshed.plot);
    setBidAmount(String(refreshed.plot.minBid ?? 7));
    setLoginCountdownMs(refreshed.plot.loginRemainingMs ?? null);
  }, [selectedId]);

  useEffect(() => {
    async function loadPlots() {
      try {
        const { plots: allPlots } = await apiFetch<{ plots: PlotSummary[] }>(
          "/api/plots"
        );
        setPlots(allPlots);
      } finally {
        setLoading(false);
      }
    }
    loadPlots();

    function onPageRefresh() {
      void loadPlots();
      void refreshDetail();
    }
    window.addEventListener("chomperz:page-refresh", onPageRefresh);
    return () => window.removeEventListener("chomperz:page-refresh", onPageRefresh);
  }, [refreshDetail]);

  useEffect(() => {
    if (selectedId === null) return;
    refreshDetail();
  }, [selectedId, refreshDetail]);

  useEffect(() => {
    if (loginCountdownMs === null) return;
    const timer = setInterval(() => {
      setLoginCountdownMs((prev) => (prev === null ? null : Math.max(0, prev - 1000)));
    }, 1000);
    return () => clearInterval(timer);
  }, [loginCountdownMs]);

  const handleSocketEvent = useCallback(
    (event: string, payload: Record<string, unknown>) => {
      const plotId = payload.plotId as number | undefined;
      if (plotId === undefined) return;

      const ownerId = payload.ownerId as string | undefined;
      const isSelf = Boolean(ownerId && player?.id && ownerId === player.id);

      if (event === "bidPlaced" && selectedId === plotId) {
        void refreshDetail();
        return;
      }

      if (event === "landCaptured" || event === "landPurchased") {
        if (!isSelf && plotId !== selectedId) {
          toast.info(`Plot #${String(plotId + 1).padStart(2, "0")} was claimed`);
        }
      } else if (event === "landLost") {
        if (!isSelf && plotId !== selectedId) {
          toast.info(`Plot #${String(plotId + 1).padStart(2, "0")} was abandoned or lost`);
        }
      }
    },
    [selectedId, refreshDetail, player?.id]
  );

  const handlePlotPatch = useCallback(
    (patch: PlotPatchPayload) => {
      if (selectedId === patch.plotId) {
        setDetail((prev) => (prev ? { ...prev, ...patchToSummary(patch) } : prev));
      }
    },
    [selectedId]
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
  const canTakeover = detail?.canTakeover === true;
  const canBid = detail?.status === "owned" && detail.landlordHandle && !detail.isLegendary;
  const legendaryNftId = detail?.legendaryTokenId ?? null;
  const showLegendaryNftHint =
    detail?.isLegendary === true &&
    detail.status === "unclaimed" &&
    !detail.landlordHandle &&
    !detail.ownerWallet &&
    legendaryNftId != null;
  const showLoginWarning =
    detail?.loginRemainingMs != null && detail.loginRemainingMs > 0;

  return (
    <SlicedPage bg={SLICING.map.bg}>
      <div className="grid lg:grid-cols-[1.2fr_1fr] gap-3 md:gap-4">
        <div className="overflow-x-auto pb-1">
          <div className="grid grid-cols-10 gap-0.5 sm:gap-1 min-w-[280px] p-1">
            {plots.map((plot) => {
              const displayNum = String(plot.plotId + 1).padStart(2, "0");
              const isSelected = selectedId === plot.plotId;
              const bgImg = plotCellBg(plot);
              const handle = plot.landlordHandle;
              return (
                <button
                  key={plot.plotId}
                  onClick={() => setSelectedId(plot.plotId)}
                  className={plotCellClass(plot, isSelected)}
                >
                  {bgImg ? (
                    <Image src={bgImg} alt="" fill className="object-cover opacity-90" unoptimized />
                  ) : null}
                  <span className="relative z-[1] block text-center leading-tight p-0.5">
                    <span className="block text-[7px] sm:text-[8px]">{displayNum}</span>
                    {plot.status === "abandoned" ? (
                      <span className="block text-[6px] sm:text-[7px] opacity-80">Abandoned</span>
                    ) : handle ? (
                      <span className="block text-[6px] sm:text-[7px] truncate">@{handle}</span>
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="relative min-w-0">
          <Image
            src={SLICING.map.woodenPanel}
            alt=""
            width={400}
            height={500}
            className="w-full h-auto pointer-events-none"
            unoptimized
          />
          <div className="absolute inset-0 flex flex-col p-4 md:p-5 overflow-auto hide-scrollbar">
          {detail ? (
            <>
              <h2 className="sliced-title text-lg font-black text-white mb-0.5">
                Plot #{detail.displayId ?? String(detail.plotId + 1).padStart(2, "0")}
              </h2>
              <p className="text-[#c4b5a0] text-xs font-bold mb-3">{detail.name}</p>
              <p className="text-xs font-bold text-gray-400 mb-4">
                {detail.landType ?? (detail.isLegendary ? "Legendary" : "Frontier")}
                {detail.isLegendary && detail.legendaryTokenId != null && (
                  <> · NFT #{detail.legendaryTokenId}</>
                )}
                {!detail.isLegendary && showLoginWarning && loginCountdownMs !== null && (
                  <> · Log in within {formatDuration(loginCountdownMs)} to keep land</>
                )}
              </p>

              {showLegendaryNftHint && legendaryNftId != null && (
                <div className="mb-4 p-4 bg-black/25 rounded-2xl border border-[var(--gold)]/30">
                  <p className="text-sm font-bold text-gray-300 mb-2 flex items-center gap-1.5">
                    <CrownIcon className="text-[var(--gold)] w-4 h-4 shrink-0" />
                    Crown Land — not for sale
                  </p>
                  <p className="text-xs text-[var(--muted)] font-bold leading-relaxed">
                    Own {player?.nftCollectionName ?? "Chomperz"} NFT #{legendaryNftId} in your linked wallet, then tap{" "}
                    <span className="text-[var(--gold)]">NFTs</span> in the header to sync. This plot
                    cannot be purchased with Z-Coins.
                  </p>
                </div>
              )}

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

              {showLoginWarning && (
                <div className="mb-4 p-4 bg-black/25 rounded-2xl border border-[var(--gold)]/30">
                  <p className="text-sm font-bold text-gray-300 mb-1">
                    Log in at least once every 7 days to keep this plot
                  </p>
                  {loginCountdownMs !== null && (
                    <p className="text-xs text-[var(--gold)] font-bold">
                      Time until land is lost: {formatDuration(loginCountdownMs)}
                    </p>
                  )}
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
                <div
                  className="relative mb-3 p-3 rounded"
                  style={{
                    backgroundImage: `url("${SLICING.map.playerCardBg}")`,
                    backgroundSize: "100% 100%",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded overflow-hidden border-2 border-[#4ade80] shrink-0">
                      <UserAvatar
                        src={detail.landlordAvatarUrl || "/images/chomper.jpg"}
                        alt="Landlord"
                      />
                    </div>
                    <div className="text-xs font-bold">
                      <p className="text-[#4ade80]">
                        Status: <span className="text-white">Current LandLord</span>
                      </p>
                      <p className="text-white">
                        Name: @{detail.landlordHandle ?? "unknown"}
                      </p>
                      <p className="text-[#c4b5a0] text-[10px]">
                        Earning: Takes {detail.landlordTaxPct ?? 10}% of all rent Collected
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {canBid && (
                <>
                  <div className="mb-3">
                    <p className="text-[10px] font-black text-[#f5d76e] uppercase mb-2">
                      Active Renter (Max 3)
                    </p>
                    {detail.renters.length === 0 ? (
                      <p className="text-xs text-[#c4b5a0] font-bold">No renters yet</p>
                    ) : (
                      <ul className="space-y-1.5">
                        {detail.renters.map((r, i) => (
                          <li key={r.walletAddress} className="relative h-8">
                            <Image src={SLICING.map.renterBar} alt="" fill className="object-fill" unoptimized />
                            <div className="absolute inset-0 flex justify-between items-center px-2 text-[10px] font-bold text-white">
                              <span>
                                {i + 1}. @{r.twitterHandle || r.walletAddress.slice(0, 8)}
                              </span>
                              <span className="text-[#4ade80]">
                                ${r.sevenDayBid ?? r.escrowBalance} / Day
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="flex gap-2 mt-auto items-end">
                    <div className="relative flex-1 h-10">
                      <Image src={SLICING.map.bidBar} alt="" fill className="object-fill" unoptimized />
                      <input
                        type="number"
                        min={detail.minBid ?? 7}
                        step={1}
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        className="absolute inset-0 bg-transparent px-3 font-black text-white text-sm outline-none w-full"
                      />
                    </div>
                    <SlicedImageButton
                      src={SLICING.map.outbidButton}
                      label="Outbid"
                      onClick={handleOutbid}
                      disabled={bidding}
                      width={100}
                      height={40}
                    />
                  </div>
                </>
              )}
            </>
          ) : selectedId !== null ? (
            <PlotDetailSkeleton />
          ) : (
            <p className="text-[#c4b5a0] font-bold text-sm">Select a plot</p>
          )}
          </div>
        </div>
      </div>
    </SlicedPage>
  );
}
