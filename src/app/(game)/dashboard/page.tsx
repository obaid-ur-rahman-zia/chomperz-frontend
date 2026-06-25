"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { usePlayer } from "@/hooks/usePlayer";
import { DashboardSkeletonInner, Spinner } from "@/components/Loading";
import { ActiveSkillsPanel } from "@/components/ActiveSkillsPanel";
import { DashboardCharacterPanel } from "@/components/dashboard/DashboardCharacterPanel";
import { WalletConnect } from "@/components/WalletConnect";
import {
  SlicedPage,
  SlicedPanel,
  SlicedActionButton,
  WalletEarningRow,
} from "@/components/sliced";
import { SLICING } from "@/lib/slicing-paths";
import {
  apiFetch,
  formatCoins,
  formatDuration,
} from "@/lib/api";
import { MIN_ZCOIN_CLAIM, MIN_COIN_CLAIM } from "@/lib/economy";
import { useLivePendingCoins, useLivePendingZCoins } from "@/hooks/useLiveEarnings";
import { getChomperLabelFromPlayer } from "@/lib/chomper";
import { toast } from "@/lib/toast";

export default function DashboardPage() {
  return <DashboardContent />;
}

function DashboardContent() {
  const { player, loading, refresh, setPlayer } = usePlayer();
  const [claimingZ, setClaimingZ] = useState(false);
  const [claimingCoins, setClaimingCoins] = useState(false);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [speedRemaining, setSpeedRemaining] = useState(0);
  const [powerRemaining, setPowerRemaining] = useState(0);

  const dailyRate = player?.economy.dailyRate ?? 0;
  const coinsDailyRate = player?.economy.coinsDailyRate ?? 5;
  const livePendingZ = useLivePendingZCoins(dailyRate, player?.lastClaimAt ?? null);
  const livePendingCoins = useLivePendingCoins(player?.lastCoinsClaimAt ?? null);
  const canClaimZ = livePendingZ >= MIN_ZCOIN_CLAIM;
  const canClaimCoins = livePendingCoins >= MIN_COIN_CLAIM;

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

  useEffect(() => {
    if (!player?.isPowerUpgrading) {
      setPowerRemaining(0);
      return;
    }
    setPowerRemaining(player.powerUpgradeRemainingMs ?? 0);
    const id = setInterval(() => {
      setPowerRemaining((ms) => Math.max(0, ms - 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [player?.isPowerUpgrading, player?.powerUpgradeRemainingMs]);

  async function handleClaimZ() {
    if (!canClaimZ) return;
    setClaimingZ(true);
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
      setClaimingZ(false);
    }
  }

  async function handleClaimCoins() {
    if (!canClaimCoins) return;
    setClaimingCoins(true);
    try {
      const data = await apiFetch<{ earned: number; coins: number }>(
        "/api/player/claim-coins",
        { method: "POST" }
      );
      toast.success(`Claimed ${formatCoins(data.earned)} Coins!`);
      await refresh({ silent: true });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Claim failed");
    } finally {
      setClaimingCoins(false);
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
        stat === "power" ? "Power upgrade started!" : "Speed upgrade started!"
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
  const powerUpgrading = player.isPowerUpgrading && powerRemaining > 0;
  const upgradeRemaining = Math.max(powerRemaining, speedRemaining);

  const rarityLabel =
    player.nftCount === 0
      ? "No NFT"
      : economy.rarityBoost >= 0.12
        ? "Rare+"
        : economy.rarityBoost >= 0.05
          ? "Uncommon"
          : "Common";

  return (
    <SlicedPage>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4 auto-rows-fr">
        <DashboardCharacterPanel
          player={player}
          chomperLabel={chomperLabel}
          rarityLabel={rarityLabel}
          onAvatarUpdated={(updated) => {
            setPlayer(updated);
            void refresh({ silent: true });
          }}
        />

        {activeSkills ? (
          <ActiveSkillsPanel
            initial={activeSkills}
            onRefresh={() => refresh({ silent: true })}
          />
        ) : (
          <div className="min-h-[11rem] md:min-h-[13rem]" />
        )}

        <SlicedPanel
          src={SLICING.mainMenu.statEarningPanel}
          padding={SLICING.dashboardInsets.statUpgrade}
          className="min-h-[11rem] md:min-h-[13rem]"
        >
          <div className="flex flex-col h-full min-h-0">
            <div className="space-y-2 md:space-y-3 flex-1">
              <div className="flex items-center gap-2">
                <Image
                  src={SLICING.mainMenu.power}
                  alt=""
                  width={32}
                  height={32}
                  className="w-7 h-7 md:w-8 md:h-8 shrink-0"
                  unoptimized
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-[10px] md:text-xs font-black drop-shadow">
                    Power (Lvl {player.powerLvl})
                  </p>
                  <p className="text-[#facc15] text-[9px] font-bold flex items-center gap-1">
                    <Image
                      src={SLICING.mainMenu.zCoin}
                      alt=""
                      width={12}
                      height={12}
                      className="w-3 h-3"
                      unoptimized
                    />
                    Z Coin : {player.powerUpgradeCost}
                  </p>
                </div>
                <SlicedActionButton
                  src={SLICING.mainMenu.button}
                  onClick={() => handleUpgrade("power")}
                  disabled={upgrading !== null || player.powerLvl >= 100 || powerUpgrading}
                  className="h-7 md:h-8 min-w-[4rem] text-[10px]"
                >
                  {upgrading === "power" ? <Spinner size="sm" /> : powerUpgrading ? "..." : "Upgrade"}
                </SlicedActionButton>
              </div>

              <div className="flex items-center gap-2">
                <Image
                  src={SLICING.mainMenu.speed}
                  alt=""
                  width={32}
                  height={32}
                  className="w-7 h-7 md:w-8 md:h-8 shrink-0"
                  unoptimized
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-[10px] md:text-xs font-black drop-shadow">
                    Speed (Lvl {player.speedLvl})
                  </p>
                  <p className="text-[#facc15] text-[9px] font-bold flex items-center gap-1">
                    <Image
                      src={SLICING.mainMenu.zCoin}
                      alt=""
                      width={12}
                      height={12}
                      className="w-3 h-3"
                      unoptimized
                    />
                    Z Coin : {player.speedUpgradeCost}
                  </p>
                </div>
                <SlicedActionButton
                  src={SLICING.mainMenu.button}
                  onClick={() => handleUpgrade("speed")}
                  disabled={upgrading !== null || player.speedLvl >= 100 || speedUpgrading}
                  className="h-7 md:h-8 min-w-[4rem] text-[10px]"
                >
                  {upgrading === "speed" ? <Spinner size="sm" /> : speedUpgrading ? "..." : "Upgrade"}
                </SlicedActionButton>
              </div>
            </div>

            <div className="relative mt-auto pt-2 shrink-0">
              <Image
                src={SLICING.mainMenu.timePanel}
                alt=""
                width={300}
                height={28}
                className="w-full h-7 object-fill"
                unoptimized
              />
              <div className="absolute inset-0 flex items-center justify-between px-3 text-[9px] md:text-[10px] font-black text-white">
                <span className="flex items-center gap-1">
                  <span aria-hidden>🕐</span>
                  Remaining Time
                </span>
                <span className="tabular-nums">
                  {powerUpgrading || speedUpgrading
                    ? formatDuration(upgradeRemaining)
                    : "00:00:00"}
                </span>
              </div>
            </div>
          </div>
        </SlicedPanel>

        <SlicedPanel
          src={SLICING.mainMenu.statEarningPanel}
          padding={SLICING.dashboardInsets.wallet}
          className="min-h-[11rem] md:min-h-[13rem]"
        >
          <div className="flex flex-col h-full min-h-0">
            <div className="flex-1 space-y-0.5">
              <WalletEarningRow
                variant="zcoin"
                balance={player.zCoins}
                rate={economy.dailyRate}
                pending={livePendingZ}
                onAction={handleClaimZ}
                actionDisabled={!canClaimZ}
                actionBusy={claimingZ}
              />
              <WalletEarningRow
                variant="coin"
                balance={player.coins ?? 0}
                rate={coinsDailyRate}
                pending={livePendingCoins}
                onAction={handleClaimCoins}
                actionDisabled={!canClaimCoins}
                actionBusy={claimingCoins}
              />
            </div>

            <div className="mt-auto pt-2 flex justify-center w-full shrink-0">
              <WalletConnect
                walletAddress={player.walletAddress}
                nftCount={player.nftCount}
                onLinked={() => refresh({ silent: true })}
                variant="dashboard"
              />
            </div>
          </div>
        </SlicedPanel>
      </div>
    </SlicedPage>
  );
}
