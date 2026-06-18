"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { usePlayer } from "@/hooks/usePlayer";
import { DashboardSkeletonInner, Spinner } from "@/components/Loading";
import { ActiveSkillsPanel } from "@/components/ActiveSkillsPanel";
import {
  BoltIcon,
  CoinIcon,
  SpeedIcon,
  StatusDot,
} from "@/components/Icons";
import {
  apiFetch,
  formatCoins,
  formatDuration,
  formatPercent,
} from "@/lib/api";
import { getChomperLabelFromPlayer } from "@/lib/chomper";
import { toast } from "@/lib/toast";

function ClaimArrowIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
    </svg>
  );
}

export default function DashboardPage() {
  return <DashboardContent />;
}

function DashboardContent() {
  const { player, loading, refresh } = usePlayer();
  const [claiming, setClaiming] = useState(false);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [dailyTaskLoading, setDailyTaskLoading] = useState(false);
  const [speedRemaining, setSpeedRemaining] = useState(0);

  useEffect(() => {
    if (!player?.isSpeedUpgrading) {
      setSpeedRemaining(0);
      return;
    }
    setSpeedRemaining(player.speedUpgradeRemainingMs ?? 0);
    const id = setInterval(() => {
      setSpeedRemaining((ms) => Math.max(0, ms - 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [player?.isSpeedUpgrading, player?.speedUpgradeRemainingMs]);

  async function handleClaim() {
    setClaiming(true);
    try {
      const data = await apiFetch<{ earned: number; zCoins: number }>(
        "/api/player/claim",
        { method: "POST" }
      );
      toast.success(`Claimed ${formatCoins(data.earned)} Z-Coins!`);
      await refresh({ silent: true });
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
      await refresh({ silent: true });
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
      toast.success(
        stat === "power" ? "Power upgraded!" : "Speed upgrade started (12h)!"
      );
      await refresh({ silent: true });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upgrade failed");
    } finally {
      setUpgrading(null);
    }
  }

  if (loading || !player) {
    return <DashboardSkeletonInner />;
  }

  const { economy } = player;
  const chomperLabel = getChomperLabelFromPlayer(player);
  const activeSkills = player.activeSkills;
  const speedUpgrading = player.isSpeedUpgrading && speedRemaining > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="card h-fit">
          <div className="border-2 md:border-4 border-[var(--green)] rounded-xl overflow-hidden bg-[#c9d0b6] aspect-square flex items-center justify-center mb-4 w-32 md:w-full max-w-sm mx-auto shadow-inner relative">
            <Image
              src="/images/chomper.jpg"
              alt="My Chomper"
              fill
              className="object-contain"
              priority
            />
          </div>

          <div className="text-center mb-5">
            <h2 className="text-lg md:text-xl font-bold">{chomperLabel}</h2>
            <p className="text-[var(--green)] text-xs md:text-sm flex items-center justify-center gap-1.5 mt-1 font-bold">
              <StatusDot />
              Actively Farming
            </p>
          </div>

          <div>
            <h3 className="stat-label mb-2 md:mb-3">Your Multipliers</h3>
            <div className="space-y-1.5 md:space-y-2 text-xs md:text-sm font-medium mb-4 md:mb-5">
              <div className="flex justify-between">
                <span className="text-gray-300">Quantity Boost</span>
                <span className="text-[var(--green)]">{formatPercent(economy.quantityBoost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Rarity Boost</span>
                <span className="text-[var(--green)]">{formatPercent(economy.rarityBoost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Power Stat</span>
                <span className="text-[var(--blue)]">{economy.powerMultiplier.toFixed(2)}x</span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-700/50">
              <h3 className="stat-label mb-2 md:mb-3">Stat Upgrades</h3>
              <div className="flex flex-col gap-2 md:gap-3">
                <div className="bg-dark-card p-2 md:p-3 rounded-lg flex justify-between items-center">
                  <div className="flex items-center gap-2 md:gap-3">
                    <BoltIcon className="w-6 h-6 text-[var(--gold)] shrink-0" />
                    <div>
                      <div className="font-bold text-xs md:text-sm text-gray-200">
                        Power (Lvl {player.powerLvl})
                      </div>
                      <div className="text-[10px] md:text-xs text-[var(--gold)] flex items-center gap-1 mt-0.5 font-bold">
                        <CoinIcon className="w-3 h-3" />
                        {player.powerUpgradeCost} Z-Coins
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleUpgrade("power")}
                    disabled={upgrading !== null || player.powerLvl >= 100}
                    className="btn-secondary text-[10px] md:text-xs py-1.5 px-2 md:px-3 disabled:opacity-50"
                  >
                    {upgrading === "power" ? <Spinner size="sm" /> : "Upgrade"}
                  </button>
                </div>

                <div className="bg-dark-card p-2 md:p-3 rounded-lg flex flex-col gap-2.5">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 md:gap-3">
                      <SpeedIcon className={`w-6 h-6 shrink-0 ${speedUpgrading ? "animate-pulse text-[var(--blue)]" : "text-gray-300"}`} />
                      <div>
                        <div className="font-bold text-xs md:text-sm text-gray-200">
                          Speed (Lvl {player.speedLvl})
                        </div>
                        {speedUpgrading ? (
                          <div className="text-[10px] md:text-xs text-[var(--blue)] font-medium mt-0.5">
                            Upgrading to Lvl {player.speedLvl + 1}...
                          </div>
                        ) : (
                          <div className="text-[10px] md:text-xs text-[var(--gold)] flex items-center gap-1 mt-0.5 font-bold">
                            <CoinIcon className="w-3 h-3" />
                            {player.speedUpgradeCost} Z-Coins
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleUpgrade("speed")}
                      disabled={upgrading !== null || player.speedLvl >= 100 || speedUpgrading}
                      className={`text-[10px] md:text-xs font-bold py-1.5 px-2 md:px-3 rounded flex items-center gap-1 ${
                        speedUpgrading
                          ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                          : "btn-secondary disabled:opacity-50"
                      }`}
                    >
                      {upgrading === "speed" ? (
                        <Spinner size="sm" />
                      ) : speedUpgrading ? (
                        "Upgrading"
                      ) : (
                        "Upgrade"
                      )}
                    </button>
                  </div>

                  {speedUpgrading && (
                    <div className="game-inset rounded flex justify-between items-center p-1.5 md:p-2">
                      <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        Time Remaining
                      </span>
                      <span className="text-[10px] md:text-xs font-mono font-bold text-[var(--blue)]">
                        {formatDuration(speedRemaining)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="card flex flex-col gap-3 md:gap-4">
            <h3 className="stat-label mb-0.5">Wallet & Earnings</h3>

            <div className="flex justify-between items-center gap-2">
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                  <CoinIcon className="w-5 h-5 text-[var(--gold)] shrink-0" />
                  <span className="text-lg md:text-xl font-bold text-[var(--gold)] leading-none">
                    {formatCoins(player.zCoins)}
                  </span>
                  <span className="text-gray-300 font-medium text-xs md:text-sm">Z-Coins</span>
                </div>
                <div className="flex items-center gap-1 ml-6 text-[10px] md:text-xs flex-wrap">
                  <span className="font-bold text-[var(--green)]">
                    +{formatCoins(economy.dailyRate)}/Day
                  </span>
                  <span className="text-gray-400 truncate">
                    (Pen: {formatCoins(economy.pendingEarnings)})
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClaim}
                disabled={claiming}
                className="btn-primary py-2 px-3 text-[10px] md:text-sm shrink-0 disabled:opacity-50"
              >
                {claiming ? <Spinner size="sm" /> : <ClaimArrowIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />}
                Claim
              </button>
            </div>

            <div className="w-full h-px bg-gray-700/50" />

            <div className="flex justify-between items-center gap-2">
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                  <CoinIcon className="w-5 h-5 text-gray-300 shrink-0" />
                  <span className="text-lg md:text-xl font-bold text-gray-200 leading-none">
                    {formatCoins(player.coins ?? 0)}
                  </span>
                  <span className="text-gray-300 font-medium text-xs md:text-sm">Coins</span>
                </div>
                <div className="text-[10px] md:text-xs text-gray-400 ml-6">
                  Daily task reward available
                </div>
              </div>
              <button
                type="button"
                onClick={handleDailyTask}
                disabled={dailyTaskLoading}
                className="btn-primary py-2 px-3 text-[10px] md:text-sm shrink-0 disabled:opacity-50"
              >
                {dailyTaskLoading ? (
                  <Spinner size="sm" />
                ) : (
                  <ClaimArrowIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                )}
                Claim
              </button>
            </div>
          </div>

          {activeSkills && (
            <ActiveSkillsPanel
              initial={activeSkills}
              onRefresh={() => refresh({ silent: true })}
            />
          )}
        </div>
      </div>
  );
}
