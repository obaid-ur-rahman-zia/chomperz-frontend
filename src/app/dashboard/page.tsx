"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePlayer } from "@/hooks/usePlayer";
import { WalletConnect } from "@/components/WalletConnect";
import {
  apiFetch,
  clearToken,
  formatCoins,
  formatPercent,
} from "@/lib/api";

export default function DashboardPage() {
  const { player, loading, refresh } = usePlayer();
  const [claiming, setClaiming] = useState(false);
  const [claimMsg, setClaimMsg] = useState<string | null>(null);

  async function handleClaim() {
    setClaiming(true);
    setClaimMsg(null);
    try {
      const data = await apiFetch<{ earned: number; zCoins: number }>(
        "/api/player/claim",
        { method: "POST" }
      );
      setClaimMsg(`Claimed ${formatCoins(data.earned)} Z-Coins!`);
      await refresh();
    } catch (e) {
      setClaimMsg(e instanceof Error ? e.message : "Claim failed");
    } finally {
      setClaiming(false);
    }
  }

  async function handleLogout() {
    await apiFetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    clearToken();
    window.location.href = "/login";
  }

  if (loading || !player) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="font-bold text-[var(--muted)]">Loading basecamp...</p>
      </main>
    );
  }

  const { economy } = player;

  return (
    <main className="max-w-4xl mx-auto p-6">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-black tracking-wide">CHOMPERZ BASECAMP</h1>
        <div className="flex gap-3 items-center">
          <span className="font-bold text-[var(--gold)]">
            {player.twitterHandle}
          </span>
          <button
            onClick={handleLogout}
            className="text-xs text-[var(--muted)] font-bold hover:text-white"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <div className="relative w-full aspect-square max-w-[280px] mx-auto mb-4 rounded-2xl overflow-hidden border-4 border-[var(--green)] bg-[#1e2420]">
            <Image
              src="/images/chomper.jpg"
              alt="My Chomper"
              fill
              className="object-contain p-4"
            />
          </div>
          <h2 className="text-xl font-extrabold mb-1">
            {player.twitterHandle}
            {economy.nftCount > 0 && (
              <span className="text-[var(--muted)] text-sm font-bold ml-2">
                ({economy.nftCount} NFT{economy.nftCount !== 1 ? "s" : ""})
              </span>
            )}
          </h2>
          <p className="text-[var(--green)] font-bold text-sm mb-6">
            ● Actively Farming...
          </p>

          <h3 className="stat-label mb-3">Your Multipliers</h3>
          <div className="space-y-2 text-sm font-bold">
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">NFT Count</span>
              <span>{economy.nftCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Quantity Boost</span>
              <span className="text-[var(--green)]">
                {formatPercent(economy.quantityBoost)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Rarity Boost</span>
              <span className="text-[var(--green)]">
                {formatPercent(economy.rarityBoost)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">NFT Multiplier</span>
              <span>{economy.nftMultiplier.toFixed(2)}x</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Power Stat</span>
              <span className="text-[var(--blue)]">
                {economy.powerMultiplier.toFixed(2)}x
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card">
            <p className="stat-label">Wallet Balance</p>
            <p className="text-3xl font-black text-[var(--gold)]">
              🪙 {formatCoins(player.zCoins)}{" "}
              <span className="text-base font-bold">Z-Coins</span>
            </p>
          </div>

          <div className="card">
            <p className="stat-label">Earning Rate</p>
            <p className="text-xl font-extrabold text-[var(--green)]">
              📈 +{formatCoins(economy.dailyRate)} Z-Coins / Day
            </p>
            <p className="text-sm text-[var(--muted)] font-bold mt-2">
              Pending offline: {formatCoins(economy.pendingEarnings)} Z-Coins
            </p>
          </div>

          <div className="card space-y-3">
            <button
              onClick={handleClaim}
              disabled={claiming}
              className="btn-primary w-full disabled:opacity-50"
            >
              {claiming ? "Claiming..." : "Claim Idle Z-Coins"}
            </button>
            {claimMsg && (
              <p className="text-sm font-bold text-center text-[var(--green)]">
                {claimMsg}
              </p>
            )}
            <WalletConnect
              walletAddress={player.walletAddress}
              onLinked={refresh}
            />
          </div>
        </div>
      </div>

      <Link
        href="/map"
        className="btn-primary block text-center mt-8 py-5 text-lg no-underline"
      >
        🗺️ ENTER THE MAP: BID ON LAND & CLAIM LEADERBOARD SLOTS →
      </Link>
    </main>
  );
}
