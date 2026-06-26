"use client";

import { useState } from "react";
import Image from "next/image";
import { ProfileSkeleton } from "@/components/Loading";
import { NftGallery } from "@/components/NftGallery";
import { ProfileAvatarPicker } from "@/components/ProfileAvatarPicker";
import { UserAvatar } from "@/components/UserAvatar";
import { WalletConnect } from "@/components/WalletConnect";
import { usePlayer } from "@/hooks/usePlayer";
import { SlicedPage, SlicedPanel, SlicedActionButton } from "@/components/sliced";
import { SLICING } from "@/lib/slicing-paths";
import { LogoutIcon } from "@/components/Icons";
import { apiFetch, clearToken, formatCoinsCompact, formatPercent } from "@/lib/api";
import { getChomperLabelFromPlayer } from "@/lib/chomper";
import { formatHandle } from "@/lib/handle";

function StatCell({
  label,
  value,
  icon,
  valueClass = "text-white",
}: {
  label: string;
  value: string;
  icon?: string;
  valueClass?: string;
}) {
  return (
    <div className="profile-stat-cell p-2 md:p-2.5 min-h-[3.75rem] flex flex-col justify-center">
      <p className="text-[9px] md:text-[10px] font-bold text-white/90 mb-0.5">{label}</p>
      <p className={`font-black text-sm md:text-base flex items-center gap-1.5 tabular-nums truncate ${valueClass}`}>
        {icon ? (
          <Image src={icon} alt="" width={18} height={18} className="w-4 h-4 shrink-0" unoptimized />
        ) : null}
        <span className="truncate">{value}</span>
      </p>
    </div>
  );
}

function MultiplierStatRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2 py-1.5 text-xs md:text-sm font-semibold text-white border-b border-white/20 last:border-b-0">
      <span className="flex items-center gap-2 min-w-0">
        {icon}
        <span>{label}</span>
      </span>
      <span className="shrink-0 tabular-nums font-bold text-white">{value}</span>
    </div>
  );
}

export default function ProfilePage() {
  return <ProfileContent />;
}

function ProfileContent() {
  const { player, loading, refresh, setPlayer } = usePlayer();
  const [pickerOpen, setPickerOpen] = useState(false);

  async function handleLogout() {
    await apiFetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    clearToken();
    window.location.href = "/login";
  }

  if (loading || !player) {
    return (
      <SlicedPage>
        <ProfileSkeleton />
      </SlicedPage>
    );
  }

  const { economy } = player;
  const chomperLabel = getChomperLabelFromPlayer(player);
  const avatar = player.displayAvatarUrl || "/images/chomper.jpg";
  const handle = formatHandle(player.twitterHandle);

  const rarityLabel =
    player.nftCount === 0
      ? "No NFT"
      : economy.rarityBoost >= 0.12
        ? "Rare+"
        : economy.rarityBoost >= 0.05
          ? "Uncommon"
          : "Common";

  const powerPct = formatPercent(Math.max(0, economy.powerMultiplier - 1));

  return (
    <SlicedPage className="max-w-3xl mx-auto space-y-3 md:space-y-4">
      <SlicedPanel
        src={SLICING.mainMenu.characterPanel}
        padding="14% 10% 12% 10%"
        fit="content"
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 group"
            aria-label="Change profile picture"
          >
            <Image
              src={SLICING.navbar.profileImage}
              alt=""
              fill
              className="object-fill pointer-events-none"
              unoptimized
            />
            <span className="absolute inset-[10%] overflow-hidden rounded-sm block">
              <UserAvatar key={avatar} src={avatar} alt="Profile" className="object-cover" />
            </span>
            <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black/15 rounded-sm" />
          </button>

          <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5 sm:gap-1">
            <p className="text-[#76B852] text-[10px] md:text-[11px] font-bold flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-[#76B852] shrink-0" aria-hidden />
              Profile
            </p>
            <h1 className="dashboard-character-name text-base sm:text-lg md:text-xl truncate">{handle}</h1>
            <p className="text-white text-[11px] md:text-xs font-bold truncate sliced-btn-text">{chomperLabel}</p>
            <p className="text-[#76B852] text-[11px] md:text-xs font-bold">{rarityLabel}</p>

            <div className="flex flex-wrap gap-1.5 mt-1">
              <SlicedActionButton
                src={SLICING.shop.unselectedButton}
                onClick={() => setPickerOpen(true)}
                className="h-7 sm:h-8 min-w-[6.5rem] text-[9px] sm:text-[10px]"
              >
                Change Profile
              </SlicedActionButton>
              <SlicedActionButton
                src={SLICING.shop.unselectedButton}
                onClick={handleLogout}
                className="h-7 sm:h-8 min-w-[5rem] text-[9px] sm:text-[10px]"
              >
                <span className="flex items-center gap-1">
                  <LogoutIcon className="w-3.5 h-3.5 text-[#fbbf24]" />
                  Logout
                </span>
              </SlicedActionButton>
            </div>
          </div>
        </div>
      </SlicedPanel>

      <ProfileAvatarPicker
        player={player}
        onUpdated={(updated) => {
          setPlayer(updated);
          void refresh({ silent: true });
        }}
        hideTrigger
        open={pickerOpen}
        onOpenChange={setPickerOpen}
      />

      <SlicedPanel
        src={SLICING.mainMenu.statEarningPanel}
        padding="12% 9% 11% 9%"
        fit="content"
      >
        <div className="grid grid-cols-2 gap-2 md:gap-2.5">
          <StatCell
            label="Z-Coins"
            value={formatCoinsCompact(player.zCoins)}
            icon={SLICING.mainMenu.zCoin}
          />
          <StatCell
            label="Coins"
            value={formatCoinsCompact(player.coins ?? 0)}
            icon={SLICING.mainMenu.simpleCoin}
          />
          <StatCell
            label="Daily Rate"
            value={`+${formatCoinsCompact(economy.dailyRate)}`}
            valueClass="text-[#4ade80]"
          />
          <StatCell label="NFTs" value={String(player.nftCount)} />
        </div>
      </SlicedPanel>

      <SlicedPanel src={SLICING.mainMenu.statEarningPanel} padding="12% 9% 11% 9%" fit="content">
        <h2 className="sliced-title text-center text-sm md:text-base font-black text-[#f5d76e] mb-3">
          Wallet
        </h2>
        <div className="flex justify-center pb-1">
          <WalletConnect
            walletAddress={player.walletAddress}
            nftCount={player.nftCount}
            onLinked={() => refresh({ silent: true })}
            variant="dashboard"
          />
        </div>
      </SlicedPanel>

      <SlicedPanel src={SLICING.mainMenu.statEarningPanel} padding="12% 9% 11% 9%" fit="content">
        <NftGallery
          nfts={player.nfts ?? []}
          collectionName={player.nftCollectionName}
          walletLinked={Boolean(player.walletAddress)}
          onDarkPanel
        />
      </SlicedPanel>

      <SlicedPanel src={SLICING.mainMenu.statEarningPanel} padding="12% 9% 11% 9%" fit="content">
        <h2 className="sliced-title text-center text-sm md:text-base font-black text-[#f5d76e] mb-2">
          Multiplier Stats
        </h2>
        <div className="profile-stat-cell p-2 md:p-3">
          <MultiplierStatRow
            icon={
              <Image src={SLICING.assets.plank} alt="" width={18} height={18} className="w-4 h-4 object-contain shrink-0" unoptimized />
            }
            label="Quantity Boost"
            value={formatPercent(economy.quantityBoost)}
          />
          <MultiplierStatRow
            icon={
              <Image src={SLICING.assets.ore} alt="" width={18} height={18} className="w-4 h-4 object-contain shrink-0" unoptimized />
            }
            label="Rarity Boost"
            value={formatPercent(economy.rarityBoost)}
          />
          <MultiplierStatRow
            icon={
              <Image src={SLICING.mainMenu.power} alt="" width={18} height={18} className="w-4 h-4 object-contain shrink-0" unoptimized />
            }
            label="Power Stat"
            value={powerPct}
          />
          <MultiplierStatRow
            icon={
              <Image src={SLICING.mainMenu.speed} alt="" width={18} height={18} className="w-4 h-4 object-contain shrink-0" unoptimized />
            }
            label="Speed Level"
            value={String(player.speedLvl)}
          />
          <MultiplierStatRow
            icon={
              <Image src={SLICING.mainMenu.power} alt="" width={18} height={18} className="w-4 h-4 object-contain shrink-0" unoptimized />
            }
            label="Power Level"
            value={String(player.powerLvl)}
          />
          <MultiplierStatRow
            icon={
              <span className="w-4 h-4 shrink-0 text-center text-[10px] font-black text-white">×</span>
            }
            label="Total Multiplier"
            value={`${player.multiplier.toFixed(2)}x`}
          />
        </div>
      </SlicedPanel>
    </SlicedPage>
  );
}
