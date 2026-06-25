"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { UserAvatar } from "@/components/UserAvatar";
import { usePlayer } from "@/hooks/usePlayer";
import { DashboardSkeletonInner, Spinner } from "@/components/Loading";
import { ProfileAvatarPicker } from "@/components/ProfileAvatarPicker";
import { ActiveSkillsPanel } from "@/components/ActiveSkillsPanel";
import { WalletConnect } from "@/components/WalletConnect";
import { StatusDot } from "@/components/Icons";
import {
  SlicedPage,
  SlicedPanel,
  SlicedActionButton,
  SlicedCoinRow,
} from "@/components/sliced";
import { SLICING } from "@/lib/slicing-paths";
import {
  apiFetch,
  formatCoins,
  formatDuration,
  formatPercent,
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
  const avatarSrc =
    player?.displayAvatarUrl ||
    (player?.avatarSource === "default" || !player?.avatarSource
      ? "/images/chomper.jpg"
      : player?.profilePicUrl) ||
    "/images/chomper.jpg";
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
        {/* Top-left: Character — reference: chomper left, info right on parchment */}
        <SlicedPanel
          src={SLICING.mainMenu.characterPanel}
          padding="14% 8% 10% 8%"
        >
          <div className="flex h-full gap-2 md:gap-3 items-stretch min-h-0">
            {/* Parchment portrait slot */}
            <div className="relative w-[38%] max-w-[7.5rem] shrink-0 flex items-center justify-center">
              <div className="relative w-full aspect-[4/5] rounded-md overflow-hidden bg-[#d4c4a0] border-2 border-[#8b6914]/40 shadow-inner flex items-center justify-center">
                <UserAvatar
                  key={`${avatarSrc}-${player.avatarSource ?? "default"}-${player.avatarNftTokenId ?? ""}`}
                  src={avatarSrc}
                  alt="My Chomper"
                  size={96}
                  className="object-contain p-1 max-h-[90%] w-auto h-auto"
                />
              </div>
            </div>

            {/* Character stats */}
            <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
              <p className="text-[#4ade80] text-[9px] md:text-[10px] font-bold flex items-center gap-1">
                <StatusDot />
                Actively Farming
              </p>
              <h2 className="text-white text-xs md:text-base font-black leading-tight truncate">
                {chomperLabel}
              </h2>
              <p className="text-[#4ade80] text-[10px] md:text-xs font-bold">{rarityLabel}</p>

              <div className="sliced-stat-box p-1.5 md:p-2 mt-1">
                <p className="text-[8px] md:text-[9px] font-black text-[#8b7355] uppercase mb-1 text-center">
                  Your Multiplier Stat
                </p>
                <div className="space-y-0.5 text-[9px] md:text-[10px] font-bold">
                  <div className="flex justify-between text-[#3d2516] gap-1">
                    <span>Quantity Boost</span>
                    <span className="text-[#15803d]">{formatPercent(economy.quantityBoost)}</span>
                  </div>
                  <div className="flex justify-between text-[#3d2516] gap-1">
                    <span>Rarity Boost</span>
                    <span className="text-[#15803d]">{formatPercent(economy.rarityBoost)}</span>
                  </div>
                  <div className="flex justify-between text-[#3d2516] gap-1">
                    <span>Power Stat</span>
                    <span className="text-[#15803d]">{economy.powerMultiplier.toFixed(2)}x</span>
                  </div>
                </div>
              </div>

              <ProfileAvatarPicker
                player={player}
                onUpdated={(updated) => {
                  setPlayer(updated);
                  void refresh({ silent: true });
                }}
                triggerClassName="mt-1 text-[9px] text-[#8b7355] font-bold underline bg-transparent border-0 p-0 w-auto text-left hover:text-[#4ade80] transition-colors"
              />
            </div>
          </div>
        </SlicedPanel>

        {/* Top-right: Active Skills */}
        {activeSkills ? (
          <ActiveSkillsPanel
            initial={activeSkills}
            onRefresh={() => refresh({ silent: true })}
          />
        ) : null}

        {/* Bottom-left: Stat Upgrade */}
        <SlicedPanel
          src={SLICING.mainMenu.statEarningPanel}
          title="Stat Upgrade"
          padding="16% 10% 10% 10%"
        >
          <div className="space-y-2 md:space-y-3">
            <div className="flex items-center gap-2">
              <Image src={SLICING.mainMenu.power} alt="" width={32} height={32} className="w-7 h-7 md:w-8 md:h-8 shrink-0" unoptimized />
              <div className="flex-1 min-w-0">
                <p className="text-white text-[10px] md:text-xs font-black">Power (Lvl {player.powerLvl})</p>
                <p className="text-[#facc15] text-[9px] font-bold flex items-center gap-1">
                  <Image src={SLICING.mainMenu.zCoin} alt="" width={12} height={12} className="w-3 h-3" unoptimized />
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
              <Image src={SLICING.mainMenu.speed} alt="" width={32} height={32} className="w-7 h-7 md:w-8 md:h-8 shrink-0" unoptimized />
              <div className="flex-1 min-w-0">
                <p className="text-white text-[10px] md:text-xs font-black">Speed (Lvl {player.speedLvl})</p>
                <p className="text-[#facc15] text-[9px] font-bold flex items-center gap-1">
                  <Image src={SLICING.mainMenu.zCoin} alt="" width={12} height={12} className="w-3 h-3" unoptimized />
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

          {(powerUpgrading || speedUpgrading) && (
            <div className="relative mt-2">
              <Image src={SLICING.mainMenu.timePanel} alt="" width={300} height={28} className="w-full h-7 object-fill" unoptimized />
              <div className="absolute inset-0 flex items-center justify-between px-2 text-[9px] font-black text-white">
                <span>Remaining Time</span>
                <span className="tabular-nums">{formatDuration(upgradeRemaining)}</span>
              </div>
            </div>
          )}
        </SlicedPanel>

        {/* Bottom-right: Wallet & Earning */}
        <SlicedPanel
          src={SLICING.mainMenu.earningPanel}
          title="Wallet & Earning"
          padding="16% 10% 10% 10%"
        >
          <SlicedCoinRow
            variant="zcoin"
            balance={player.zCoins}
            rate={economy.dailyRate}
            pending={livePendingZ}
            action={
              <SlicedActionButton
                src={SLICING.mainMenu.button}
                onClick={handleClaimZ}
                disabled={claimingZ || !canClaimZ}
                className="h-7 md:h-8 min-w-[3.5rem] text-[10px]"
              >
                {claimingZ ? <Spinner size="sm" /> : "Claim"}
              </SlicedActionButton>
            }
          />
          <div className="h-px bg-white/10 my-0.5" />
          <SlicedCoinRow
            variant="coin"
            balance={player.coins ?? 0}
            rate={coinsDailyRate}
            pending={livePendingCoins}
            action={
              <SlicedActionButton
                src={SLICING.mainMenu.button}
                onClick={handleClaimCoins}
                disabled={claimingCoins || !canClaimCoins}
                className="h-7 md:h-8 min-w-[3.5rem] text-[10px]"
              >
                {claimingCoins ? <Spinner size="sm" /> : "Claim"}
              </SlicedActionButton>
            }
          />

          <div className="mt-3 flex justify-center w-full">
            <WalletConnect
              walletAddress={player.walletAddress}
              nftCount={player.nftCount}
              onLinked={() => refresh({ silent: true })}
              compact
            />
          </div>
        </SlicedPanel>
      </div>
    </SlicedPage>
  );
}
