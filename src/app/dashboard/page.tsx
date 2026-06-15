"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePlayer } from "@/hooks/usePlayer";
import { WalletConnect } from "@/components/WalletConnect";
import {
  ArrowRightIcon,
  BoltIcon,
  CoinIcon,
  HomeIcon,
  MapIcon,
  SpeedIcon,
  StatusDot,
  TrendIcon,
} from "@/components/Icons";
import {
  apiFetch,
  clearToken,
  formatCoins,
  formatPercent,
} from "@/lib/api";
import { getChomperLabel } from "@/lib/chomper";

export default function DashboardPage() {
  const { player, loading, refresh } = usePlayer();
  const [claiming, setClaiming] = useState(false);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [claimMsg, setClaimMsg] = useState<string | null>(null);
  const [upgradeMsg, setUpgradeMsg] = useState<string | null>(null);

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

  async function handleUpgrade(stat: "power" | "speed") {
    setUpgrading(stat);
    setUpgradeMsg(null);
    try {
      await apiFetch("/api/player/upgrade", {
        method: "POST",
        body: JSON.stringify({ stat }),
      });
      setUpgradeMsg(`${stat === "power" ? "Power" : "Speed"} upgraded!`);
      await refresh();
    } catch (e) {
      setUpgradeMsg(e instanceof Error ? e.message : "Upgrade failed");
    } finally {
      setUpgrading(null);
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
  const tokenIds = player.cachedTokenIds ?? [];
  const chomperLabel = getChomperLabel(tokenIds.length ? tokenIds : [4242]);

  return (
    <main className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-6 relative">
        <h1 className="text-2xl font-black tracking-wide">CHOMPERZ BASECAMP</h1>
        <div className="absolute right-0 top-0 flex gap-3 items-center">
          <span className="font-bold text-[var(--gold)] text-sm hidden sm:inline">
            {player.twitterHandle}
          </span>
          <button
            onClick={handleLogout}
            className="text-xs text-[var(--muted)] font-bold hover:text-white"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card text-center">
          <div className="relative w-full aspect-square max-w-[280px] mx-auto mb-4 rounded-2xl overflow-hidden border-4 border-[var(--green)] bg-[#1e2420]">
            <Image
              src="/images/chomper.jpg"
              alt="My Chomper"
              fill
              className="object-contain p-4"
              priority
            />
          </div>
          <h2 className="text-xl font-extrabold mb-1">{chomperLabel}</h2>
          <p className="text-[var(--green)] font-bold text-sm mb-6 flex items-center justify-center gap-2">
            <StatusDot />
            Actively Farming
          </p>

          <h3 className="stat-label mb-3 text-left">Your Multipliers</h3>
          <div className="space-y-2 text-sm font-bold text-left">
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
            <p className="text-3xl font-black text-[var(--gold)] flex items-center gap-2">
              <CoinIcon className="w-7 h-7 shrink-0" />
              {formatCoins(player.zCoins)}
              <span className="text-base font-bold">Z-Coins</span>
            </p>
          </div>

          <div className="card">
            <p className="stat-label">Earning Rate</p>
            <p className="text-xl font-extrabold text-[var(--green)] flex items-center gap-2">
              <TrendIcon className="w-6 h-6 shrink-0" />
              +{formatCoins(economy.dailyRate)} Z-Coins / Day
            </p>
            <p className="text-sm text-[var(--muted)] font-bold mt-2">
              Pending offline: {formatCoins(economy.pendingEarnings)} Z-Coins
            </p>
          </div>

          <div className="card">
            <p className="stat-label mb-3">Laboratory Upgrades</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3 bg-black/20 rounded-xl p-3">
                <div className="flex items-center gap-3">
                  <BoltIcon className="w-6 h-6 text-[var(--gold)] shrink-0" />
                  <div className="text-left">
                    <p className="font-extrabold text-sm">
                      Power (Lvl {player.powerLvl})
                    </p>
                    <p className="text-[var(--gold)] text-xs font-bold">
                      {player.powerUpgradeCost} Z-Coins
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleUpgrade("power")}
                  disabled={upgrading !== null || player.powerLvl >= 100}
                  className="btn-secondary px-4 py-2 text-sm disabled:opacity-50"
                >
                  {upgrading === "power" ? "..." : "Upgrade"}
                </button>
              </div>
              <div className="flex items-center justify-between gap-3 bg-black/20 rounded-xl p-3">
                <div className="flex items-center gap-3">
                  <SpeedIcon className="w-6 h-6 text-white shrink-0" />
                  <div className="text-left">
                    <p className="font-extrabold text-sm">
                      Speed (Lvl {player.speedLvl})
                    </p>
                    <p className="text-[var(--gold)] text-xs font-bold">
                      {player.speedUpgradeCost} Z-Coins
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleUpgrade("speed")}
                  disabled={upgrading !== null || player.speedLvl >= 100}
                  className="btn-secondary px-4 py-2 text-sm disabled:opacity-50"
                >
                  {upgrading === "speed" ? "..." : "Upgrade"}
                </button>
              </div>
            </div>
            {upgradeMsg && (
              <p className="text-xs font-bold text-center text-[var(--green)] mt-2">
                {upgradeMsg}
              </p>
            )}
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

      <div className="grid sm:grid-cols-2 gap-4 mt-8">
        <Link
          href="/crib"
          className="btn-secondary flex items-center justify-center gap-3 py-4 text-base no-underline"
        >
          <HomeIcon className="w-5 h-5" />
          My Crib — Furniture Shop
        </Link>
        <Link
          href="/map"
          className="btn-primary flex items-center justify-center gap-3 py-4 text-base no-underline"
        >
          <MapIcon className="w-5 h-5" />
          Enter the Map
          <ArrowRightIcon className="w-4 h-4 opacity-80" />
        </Link>
      </div>
    </main>
  );
}
