"use client";

import { useEffect, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { UserAvatar } from "@/components/UserAvatar";
import {
  apiFetch,
  formatCoins,
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
import { GameShell } from "@/components/GameShell";
import { toast } from "@/lib/toast";
import { MapSkeleton, PlotDetailSkeleton, Spinner } from "@/components/Loading";

export default function MapPage() {
  const [plots, setPlots] = useState<PlotSummary[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(11);
  const [detail, setDetail] = useState<PlotDetail | null>(null);
  const [zCoins, setZCoins] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState("");
  const [bidding, setBidding] = useState(false);

  async function loadPlayer() {
    try {
      const me = await apiFetch<{ zCoins: number }>("/api/player/me");
      setZCoins(me.zCoins);
    } catch {
      setZCoins(null);
    }
  }

  useEffect(() => {
    async function load() {
      try {
        const { plots: allPlots } = await apiFetch<{ plots: PlotSummary[] }>(
          "/api/plots"
        );
        setPlots(allPlots);
        await loadPlayer();
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (selectedId === null) return;
    apiFetch<{ plot: PlotDetail }>(`/api/plots/${selectedId}`).then((data) => {
      setDetail(data.plot);
      setBidAmount(String(data.plot.minBid ?? 1));
    });
  }, [selectedId]);

  async function handleOutbid() {
    if (selectedId === null) return;
    const amount = parseInt(bidAmount, 10);
    if (!amount) return;
    setBidding(true);
    try {
      const data = await apiFetch<{ zCoins: number }>(`/api/plots/${selectedId}/bid`, {
        method: "POST",
        body: JSON.stringify({ amount }),
      });
      setZCoins(data.zCoins);
      toast.success(`Bid placed: ${amount} Z-Coins / day`);
      const refreshed = await apiFetch<{ plot: PlotDetail }>(
        `/api/plots/${selectedId}`
      );
      setDetail(refreshed.plot);
      setBidAmount(String(refreshed.plot.minBid ?? amount + 1));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Bid failed");
    } finally {
      setBidding(false);
    }
  }

  if (loading) {
    return <MapSkeleton />;
  }

  return (
    <GameShell>
      <AppHeader
        title="TERRITORY"
        icon={<MapIcon className="w-6 h-6 text-[var(--green)] shrink-0" />}
        zCoins={zCoins}
        backHref="/dashboard"
      />

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
                    ${isSelected ? "bg-[var(--green)] text-black border-2 border-white" : "bg-[#3a453d] text-[var(--muted)]"}
                    ${plot.isLegendary && !isSelected ? "border-2 border-[var(--gold)] text-[var(--gold)] shadow-[0_0_10px_rgba(251,197,49,0.3)]" : ""}
                  `}
                >
                  #{displayNum}
                </button>
              );
            })}
            </div>
          </div>
          <p className="text-xs text-[var(--muted)] font-bold mt-4 flex items-center gap-1.5">
            <CrownIcon className="text-[var(--gold)]" />
            <span>
              <span className="text-[var(--gold)]">Gold borders</span> indicate
              Legendary Plots. High rent limits, high taxes.
            </span>
          </p>
        </div>

        <div className="card">
          {detail ? (
            <>
              <h2 className="text-xl font-black text-[var(--green)] mb-1 flex items-center gap-2">
                <PlotIcon />
                PLOT #{detail.displayId ?? String(detail.plotId + 1).padStart(2, "0")}
              </h2>
              <p className="text-[var(--muted)] font-bold mb-6">{detail.name}</p>

              {detail.landlordHandle && (
                <div className="bg-black/25 rounded-2xl p-4 mb-4 border border-[var(--gold)]/20">
                  <p className="stat-label mb-3 flex items-center gap-1.5 text-[var(--gold)]">
                    <CrownIcon className="w-4 h-4" />
                    Current Landlord
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden border-2 border-[var(--green)] bg-[#1e2420] shrink-0">
                      <UserAvatar
                        src={detail.landlordAvatarUrl || "/images/chomper.jpg"}
                        alt="Landlord"
                      />
                    </div>
                    <div>
                      <p className="font-extrabold">{detail.landlordHandle}</p>
                      <p className="text-xs text-[var(--muted)] font-bold">
                        Takes {detail.landlordTaxPct ?? 10}% of all rent collected
                      </p>
                    </div>
                  </div>
                </div>
              )}

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
                        className="flex justify-between items-center bg-black/15 rounded-xl px-3 py-2.5 text-sm font-bold"
                      >
                        <span>
                          {i + 1}. {r.twitterHandle || `${r.walletAddress.slice(0, 8)}...`}
                        </span>
                        <span className="text-[var(--gold)] flex items-center gap-1">
                          <CoinIcon className="w-3.5 h-3.5" />
                          {r.dailyBid} / day
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2 mt-6">
                <input
                  type="number"
                  min={detail.minBid ?? 1}
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  placeholder={`Min. ${detail.minBid ?? 1}`}
                  className="flex-1 bg-black/30 border-2 border-[#3a453d] rounded-xl px-4 py-3 font-bold text-white outline-none focus:border-[var(--gold)] min-h-[48px]"
                />
                <button
                  onClick={handleOutbid}
                  disabled={bidding}
                  className="btn-danger px-6 py-3 shrink-0 disabled:opacity-50 min-h-[48px]"
                >
                  <SwordIcon className="w-4 h-4" />
                  {bidding ? <Spinner size="sm" /> : "OUTBID"}
                </button>
              </div>
            </>
          ) : selectedId !== null ? (
            <PlotDetailSkeleton />
          ) : (
            <p className="text-[var(--muted)] font-bold">Select a plot</p>
          )}
        </div>
      </div>
    </GameShell>
  );
}
