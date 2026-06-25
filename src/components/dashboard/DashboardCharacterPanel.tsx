"use client";

import { useState } from "react";
import Image from "next/image";
import { StatusDot } from "@/components/Icons";
import { ProfileAvatarPicker } from "@/components/ProfileAvatarPicker";
import { UserAvatar } from "@/components/UserAvatar";
import { SlicedPanel } from "@/components/sliced";
import { SLICING } from "@/lib/slicing-paths";
import { formatPercent, type PlayerData } from "@/lib/api";

interface DashboardCharacterPanelProps {
  player: PlayerData;
  chomperLabel: string;
  rarityLabel: string;
  onAvatarUpdated: (player: PlayerData) => void;
}

function StatRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-1 py-0.5 text-[9px] md:text-[10px] font-bold text-[#3d2516]">
      <span className="flex items-center gap-1 min-w-0 truncate">
        {icon}
        <span className="truncate">{label}</span>
      </span>
      <span className="text-[#15803d] shrink-0 tabular-nums">{value}</span>
    </div>
  );
}

export function DashboardCharacterPanel({
  player,
  chomperLabel,
  rarityLabel,
  onAvatarUpdated,
}: DashboardCharacterPanelProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const avatarSrc =
    player.displayAvatarUrl ||
    (player.avatarSource === "default" || !player.avatarSource
      ? "/images/chomper.jpg"
      : player.profilePicUrl) ||
    "/images/chomper.jpg";

  const useChomperSprite =
    player.avatarSource === "default" || !player.avatarSource;

  const { economy } = player;
  const powerPct = formatPercent(Math.max(0, economy.powerMultiplier - 1));

  return (
    <SlicedPanel
      src={SLICING.mainMenu.characterPanel}
      padding={SLICING.dashboardInsets.character}
      className="aspect-[5/3] md:aspect-[2.15/1] min-h-0"
    >
      <div className="flex h-full items-center gap-2 min-h-0 overflow-hidden">
        <div className="relative w-[40%] max-w-[7.5rem] shrink-0 h-full flex items-center justify-center overflow-hidden">
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="relative w-full h-full max-h-full flex items-center justify-center group px-0.5"
            aria-label="Change profile picture"
          >
            {useChomperSprite ? (
              <Image
                src={SLICING.assets.chomperFront}
                alt="Chomper"
                width={140}
                height={160}
                className="w-auto h-auto max-w-full max-h-[88%] object-contain object-center drop-shadow-[0_3px_6px_rgba(0,0,0,0.35)]"
                priority
                unoptimized
              />
            ) : (
              <UserAvatar
                src={avatarSrc}
                alt="My Chomper"
                size={96}
                className="object-contain max-h-[88%] max-w-full w-auto h-auto"
              />
            )}
            <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black/15 rounded" />
          </button>
          <ProfileAvatarPicker
            player={player}
            onUpdated={onAvatarUpdated}
            hideTrigger
            open={pickerOpen}
            onOpenChange={setPickerOpen}
          />
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5 overflow-hidden">
          <p className="text-[#4ade80] text-[9px] md:text-[10px] font-bold flex items-center gap-1 drop-shadow">
            <StatusDot />
            Actively Farming
          </p>
          <h2 className="sliced-title text-white text-xs md:text-sm font-black leading-tight truncate">
            {chomperLabel}
          </h2>
          <p className="text-[#4ade80] text-[10px] md:text-xs font-bold drop-shadow">
            {rarityLabel}
          </p>

          <div className="mt-1 border-2 border-dashed border-[#6b5344]/75 rounded-md p-1.5 md:p-2 bg-transparent">
            <p className="text-[8px] md:text-[9px] font-black text-[#5c4a32] uppercase mb-0.5 text-center tracking-wide">
              Your Multiplier Stat
            </p>
            <div className="divide-y divide-[#8b7355]/45">
              <StatRow
                icon={
                  <Image
                    src={SLICING.assets.plank}
                    alt=""
                    width={14}
                    height={14}
                    className="w-3.5 h-3.5 object-contain"
                    unoptimized
                  />
                }
                label="Quantity Boost"
                value={formatPercent(economy.quantityBoost)}
              />
              <StatRow
                icon={
                  <Image
                    src={SLICING.assets.ore}
                    alt=""
                    width={14}
                    height={14}
                    className="w-3.5 h-3.5 object-contain"
                    unoptimized
                  />
                }
                label="Rarity Boost"
                value={formatPercent(economy.rarityBoost)}
              />
              <StatRow
                icon={
                  <Image
                    src={SLICING.mainMenu.power}
                    alt=""
                    width={14}
                    height={14}
                    className="w-3.5 h-3.5 object-contain"
                    unoptimized
                  />
                }
                label="Power Stat"
                value={powerPct}
              />
            </div>
          </div>
        </div>
      </div>
    </SlicedPanel>
  );
}
