"use client";

import Image from "next/image";
import { ProfileSkeleton } from "@/components/Loading";
import { NftGallery } from "@/components/NftGallery";
import { UserAvatar } from "@/components/UserAvatar";
import { usePlayer } from "@/hooks/usePlayer";
import { SlicedPage, SlicedPanel, SlicedActionButton } from "@/components/sliced";
import { SLICING } from "@/lib/slicing-paths";
import {
  BoltIcon,
  LogoutIcon,
  ProfileIcon,
  SpeedIcon,
} from "@/components/Icons";
import { apiFetch, clearToken, formatCoins, formatPercent } from "@/lib/api";
import { getChomperLabelFromPlayer } from "@/lib/chomper";

export default function ProfilePage() {
  return <ProfileContent />;
}

function ProfileContent() {
  const { player, loading } = usePlayer();

  async function handleLogout() {
    await apiFetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    clearToken();
    window.location.href = "/login";
  }

  if (loading || !player) {
    return <ProfileSkeleton />;
  }

  const { economy } = player;
  const chomperLabel = getChomperLabelFromPlayer(player);
  const avatar = player.displayAvatarUrl || "/images/chomper.jpg";

  return (
    <SlicedPage>
      <SlicedPanel src={SLICING.mainMenu.characterPanel} padding="1.25rem 1rem 1rem" className="mb-4">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-3 sliced-wood-inset rounded-lg overflow-hidden">
            <UserAvatar key={avatar} src={avatar} alt="Profile" className="object-contain" />
          </div>
          <h2 className="sliced-title text-lg font-black text-white flex items-center justify-center gap-2">
            <ProfileIcon className="w-5 h-5 text-[#38bdf8]" />
            {player.twitterHandle}
          </h2>
          <p className="text-sm text-[#c4b5a0] font-bold mt-1">{chomperLabel}</p>
          <SlicedActionButton
            src={SLICING.mainMenu.button}
            onClick={handleLogout}
            className="mt-4 h-9 min-w-[6rem] mx-auto"
          >
            <span className="flex items-center gap-1">
              <LogoutIcon className="w-4 h-4" />
              Logout
            </span>
          </SlicedActionButton>
        </div>
      </SlicedPanel>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {[
          { label: "Z-Coins", value: formatCoins(player.zCoins), color: "text-[#facc15]", icon: SLICING.mainMenu.zCoin },
          { label: "Coins", value: formatCoins(player.coins ?? 0), color: "text-white", icon: SLICING.mainMenu.simpleCoin },
          { label: "Daily Rate", value: `+${formatCoins(economy.dailyRate)}`, color: "text-[#4ade80]", icon: null },
          { label: "NFTs", value: String(player.nftCount), color: "text-white", icon: null },
        ].map((stat) => (
          <SlicedPanel key={stat.label} src={SLICING.inventory.innerPanel} padding="0.75rem 1rem">
            <p className="text-[9px] font-black text-[#c4b5a0] uppercase">{stat.label}</p>
            <p className={`font-black text-lg flex items-center gap-1 ${stat.color}`}>
              {stat.icon ? (
                <Image src={stat.icon} alt="" width={18} height={18} className="w-4 h-4" unoptimized />
              ) : null}
              {stat.value}
            </p>
          </SlicedPanel>
        ))}
      </div>

      <NftGallery
        nfts={player.nfts ?? []}
        collectionName={player.nftCollectionName}
        walletLinked={Boolean(player.walletAddress)}
      />

      <SlicedPanel src={SLICING.mainMenu.statEarningPanel} title="Stats" className="mt-4" padding="1.5rem 1.25rem 1rem">
        <div className="space-y-2 text-sm font-bold text-white">
          <div className="flex justify-between">
            <span className="text-[#c4b5a0]">Quantity Boost</span>
            <span className="text-[#4ade80]">{formatPercent(economy.quantityBoost)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#c4b5a0]">Rarity Boost</span>
            <span className="text-[#4ade80]">{formatPercent(economy.rarityBoost)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#c4b5a0] flex items-center gap-1">
              <BoltIcon className="w-4 h-4 text-[#facc15]" />
              Power Lvl
            </span>
            <span>{player.powerLvl}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#c4b5a0] flex items-center gap-1">
              <SpeedIcon className="w-4 h-4" />
              Speed Lvl
            </span>
            <span>{player.speedLvl}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#c4b5a0]">Multiplier</span>
            <span>{player.multiplier.toFixed(2)}x</span>
          </div>
        </div>
      </SlicedPanel>
    </SlicedPage>
  );
}
