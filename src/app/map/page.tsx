"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch, formatCoins, type PlotSummary } from "@/lib/api";

interface PlotDetail extends PlotSummary {
  landType?: string;
  displayId?: string;
}

export default function MapPage() {
  const [plots, setPlots] = useState<PlotSummary[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(12);
  const [detail, setDetail] = useState<PlotDetail | null>(null);
  const [zCoins, setZCoins] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { plots: allPlots } = await apiFetch<{ plots: PlotSummary[] }>(
          "/api/plots"
        );
        setPlots(allPlots);

        try {
          const me = await apiFetch<{ zCoins: number }>("/api/player/me");
          setZCoins(me.zCoins);
        } catch {
          /* not logged in */
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (selectedId === null) return;
    apiFetch<{ plot: PlotDetail }>(`/api/plots/${selectedId}`).then((data) =>
      setDetail(data.plot)
    );
  }, [selectedId]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="font-bold text-[var(--muted)]">Loading territory map...</p>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto p-6">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-black">🗺️ CHOMPERZ TERRITORY</h1>
        <div className="flex items-center gap-4">
          {zCoins !== null && (
            <span className="bg-black/30 border-2 border-[#3a453d] rounded-full px-4 py-2 font-extrabold text-[var(--gold)]">
              🪙 {formatCoins(zCoins)} Z-Coins
            </span>
          )}
          <Link href="/dashboard" className="text-sm font-bold text-[var(--blue)]">
            ← Basecamp
          </Link>
        </div>
      </header>

      <div className="grid lg:grid-cols-[1.2fr_1fr] gap-6">
        <div className="card">
          <h3 className="stat-label mb-4">Select a Plot</h3>
          <div className="grid grid-cols-10 gap-1.5">
            {plots.map((plot) => {
              const displayNum = String(plot.plotId + 1).padStart(2, "0");
              const isSelected = selectedId === plot.plotId;
              return (
                <button
                  key={plot.plotId}
                  onClick={() => setSelectedId(plot.plotId)}
                  className={`
                    aspect-square rounded-lg text-xs font-extrabold transition-transform hover:scale-105
                    ${isSelected ? "bg-[var(--green)] text-black border-2 border-white" : "bg-[#3a453d] text-[var(--muted)]"}
                    ${plot.isLegendary && !isSelected ? "border-2 border-[var(--gold)] text-[var(--gold)] shadow-[0_0_10px_rgba(251,197,49,0.3)]" : ""}
                  `}
                >
                  #{displayNum}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-[var(--muted)] font-bold mt-4">
            <span className="text-[var(--gold)]">👑 Gold borders</span> indicate
            Legendary Plots. High rent limits, high taxes.
          </p>
        </div>

        <div className="card">
          {detail ? (
            <>
              <h2 className="text-xl font-black text-[var(--green)] mb-1">
                📍 PLOT #{detail.displayId ?? String(detail.plotId + 1).padStart(2, "0")}
              </h2>
              <p className="text-[var(--muted)] font-bold mb-6">{detail.name}</p>

              <div className="bg-black/20 rounded-2xl p-4 mb-4">
                <p className="stat-label mb-2">Land Type</p>
                <p className="font-extrabold">
                  {detail.landType ??
                    (detail.isLegendary ? "Legendary (Crown Land)" : "Frontier")}
                </p>
              </div>

              <div className="bg-black/20 rounded-2xl p-4 mb-4">
                <p className="stat-label mb-2">Status</p>
                <p className="font-extrabold capitalize">{detail.status}</p>
              </div>

              <div className="bg-black/20 rounded-2xl p-4">
                <p className="stat-label mb-2">Current Owner</p>
                {detail.ownerWallet ? (
                  <p className="font-extrabold text-[var(--green)]">
                    {detail.ownerWallet.slice(0, 6)}...{detail.ownerWallet.slice(-4)}
                  </p>
                ) : (
                  <p className="font-bold text-[var(--muted)]">Unclaimed</p>
                )}
                {detail.isLegendary && detail.legendaryTokenId && (
                  <p className="text-xs text-[var(--gold)] font-bold mt-2">
                    Bound to Legendary NFT #{detail.legendaryTokenId}
                  </p>
                )}
              </div>

              {detail.renters.length > 0 && (
                <div className="mt-4">
                  <p className="stat-label mb-2">Active Renters</p>
                  <ul className="space-y-2">
                    {detail.renters.map((r, i) => (
                      <li
                        key={i}
                        className="flex justify-between bg-black/15 rounded-xl px-3 py-2 text-sm font-bold"
                      >
                        <span>{r.walletAddress.slice(0, 8)}...</span>
                        <span className="text-[var(--gold)]">
                          {r.dailyBid} / day
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <p className="text-[var(--muted)] font-bold">Select a plot</p>
          )}
        </div>
      </div>
    </main>
  );
}
