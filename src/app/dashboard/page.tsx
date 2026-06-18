"use client";

import { useState } from "react";
import Image from "next/image";
import { usePlayer } from "@/hooks/usePlayer";
import { WalletConnect } from "@/components/WalletConnect";
import { UserMenu } from "@/components/UserMenu";
import { GameShell } from "@/components/GameShell";
import {
  BoltIcon,
  CoinIcon,
  SpeedIcon,
  StatusDot,
  TrendIcon,
} from "@/components/Icons";
import {
  apiFetch,
  formatCoins,
  formatPercent,
} from "@/lib/api";
import { getChomperLabelFromPlayer } from "@/lib/chomper";
import { toast } from "@/lib/toast";
import { DashboardSkeleton, Spinner } from "@/components/Loading";

export default function DashboardPage() {
  const { player, loading, refresh } = usePlayer();
  const [claiming, setClaiming] = useState(false);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [dailyTaskLoading, setDailyTaskLoading] = useState(false);

  async function handleClaim() {
    setClaiming(true);
    try {
      const data = await apiFetch<{ earned: number; zCoins: number }>(
        "/api/player/claim",
        { method: "POST" }
      );
      toast.success(`Claimed ${formatCoins(data.earned)} Z-Coins!`);
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Claim failed");
    } finally {
      setClaiming(false);
    }
  }

  async function handleDailyTask() {
    setDailyTaskLoading(true);
    try {
      const data = await apiFetch<{ awarded: number }>("/api/player/daily-task", {
        method: "POST",
      });
      toast.success(`Earned ${data.awarded} Coins!`);
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Daily task failed");
    } finally {
      setDailyTaskLoading(false);
    }
  }

  async function handleUpgrade(stat: "power" | "speed") {
    setUpgrading(stat);
    try {
      await apiFetch("/api/player/upgrade", {
        method: "POST",
        body: JSON.stringify({ stat }),
      });
      toast.success(`${stat === "power" ? "Power" : "Speed"} upgraded!`);
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upgrade failed");
    } finally {
      setUpgrading(null);
    }
  }

  if (loading || !player) {
    return <DashboardSkeleton />;
  }

  const { economy } = player;
  const chomperLabel = getChomperLabelFromPlayer(player);

  return (
    <GameShell>
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="text-xl sm:text-2xl font-black tracking-wide text-center sm:text-left">
          CHOMPERZ BASECAMP
        </h1>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <span className="bg-black/30 border-2 border-[#3a453d] rounded-full px-3 py-1.5 font-extrabold text-[var(--gold)] text-sm flex items-center gap-1.5">
            <CoinIcon className="w-4 h-4" />
            {formatCoins(player.zCoins)} Z
          </span>
          <span className="bg-black/30 border-2 border-[#3a453d] rounded-full px-3 py-1.5 font-extrabold text-[var(--blue)] text-sm">
            {formatCoins(player.coins ?? 0)} Coins
          </span>
          <UserMenu
            twitterHandle={player.twitterHandle}
            profilePicUrl={player.profilePicUrl}
          />
        </div>
      </header>

      <div className="grid md:grid-cols-2 gap-4 md:gap-6">
        <div className="card text-center">
          <div className="relative w-full max-w-[220px] sm:max-w-[280px] aspect-square mx-auto mb-4 rounded-2xl overflow-hidden border-4 border-[var(--green)] bg-[#1e2420]">
            <Image
              src="/images/chomper.jpg"
              alt="My Chomper"
              fill
              className="object-contain p-4"
              priority
            />
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold mb-1">{chomperLabel}</h2>
          <p className="text-[var(--green)] font-bold text-sm mb-4 flex items-center justify-center gap-2">
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
            <p className="text-2xl sm:text-3xl font-black text-[var(--gold)] flex items-center gap-2 flex-wrap">
              <CoinIcon className="w-6 h-6 sm:w-7 sm:h-7 shrink-0" />
              {formatCoins(player.zCoins)}
              <span className="text-sm sm:text-base font-bold">Z-Coins</span>
            </p>
          </div>

          <div className="card">
            <p className="stat-label">Standard Coins</p>
            <p className="text-lg sm:text-xl font-extrabold text-[var(--blue)]">
              {formatCoins(player.coins ?? 0)} Coins
            </p>
            <button
              onClick={handleDailyTask}
              disabled={dailyTaskLoading}
              className="btn-secondary w-full mt-3 text-sm disabled:opacity-50"
            >
              {dailyTaskLoading ? (
                <>
                  <Spinner size="sm" />
                  Claiming...
                </>
              ) : (
                "Claim Daily Task"
              )}
            </button>
          </div>

        <div className="card">
          <p className="stat-label">NFT Multiplier</p>
          <p className="text-lg sm:text-xl font-extrabold text-[var(--green)]">
            {player.multiplier.toFixed(2)}x
          </p>
          <p className="text-xs text-[var(--muted)] font-bold mt-1">
            {player.nftCount} NFT{player.nftCount === 1 ? "" : "s"} synced
          </p>
        </div>

        <div className="card">
          <p className="stat-label">Earning Rate</p>
            <p className="text-lg sm:text-xl font-extrabold text-[var(--green)] flex items-center gap-2">
              <TrendIcon className="w-5 h-5 shrink-0" />
              +{formatCoins(economy.dailyRate)} / Day
            </p>
            <p className="text-xs sm:text-sm text-[var(--muted)] font-bold mt-2">
              Pending: {formatCoins(economy.pendingEarnings)} Z-Coins
            </p>
          </div>

          <div className="card">
            <p className="stat-label mb-3">Laboratory Upgrades</p>
            <div className="space-y-3">
              {(
                [
                  { stat: "power" as const, icon: BoltIcon, color: "text-[var(--gold)]", lvl: player.powerLvl, cost: player.powerUpgradeCost },
                  { stat: "speed" as const, icon: SpeedIcon, color: "text-white", lvl: player.speedLvl, cost: player.speedUpgradeCost },
                ]
              ).map(({ stat, icon: Icon, color, lvl, cost }) => (
                <div
                  key={stat}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-black/20 rounded-xl p-3"
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-6 h-6 shrink-0 ${color}`} />
                    <div>
                      <p className="font-extrabold text-sm capitalize">
                        {stat} (Lvl {lvl})
                      </p>
                      <p className="text-[var(--gold)] text-xs font-bold flex items-center gap-1">
                        <CoinIcon className="w-3 h-3" />
                        {cost} Z-Coins
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUpgrade(stat)}
                    disabled={upgrading !== null || lvl >= 100}
                    className="btn-secondary w-full sm:w-auto px-4 py-2 text-sm disabled:opacity-50"
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {upgrading === stat ? (
                      <Spinner size="sm" />
                    ) : (
                      "Upgrade"
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="card space-y-3">
            <button
              onClick={handleClaim}
              disabled={claiming}
              className="btn-primary w-full disabled:opacity-50"
            >
              <CoinIcon className="w-5 h-5" />
              {claiming ? (
                <>
                  <Spinner size="sm" />
                  Claiming...
                </>
              ) : (
                "Claim Idle Z-Coins"
              )}
            </button>
            <WalletConnect
              walletAddress={player.walletAddress}
              onLinked={refresh}
            />
          </div>
        </div>
      </div>
    </GameShell>
  );
}
