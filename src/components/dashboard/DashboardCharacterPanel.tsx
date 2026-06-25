"use client";

import { useState } from "react";
import Image from "next/image";
import { ProfileAvatarPicker } from "@/components/ProfileAvatarPicker";
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
    <div className="flex items-center justify-between gap-2 py-1 text-[10px] md:text-[11px] font-semibold text-[#4a2f1a] border-b border-[#8b7355]/55 last:border-b-0">
      <span className="flex items-center gap-1.5 min-w-0">
        {icon}
        <span className="truncate">{label}</span>
      </span>
      <span className="shrink-0 tabular-nums font-bold">{value}</span>
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
  const { economy } = player;
  const powerPct = formatPercent(Math.max(0, economy.powerMultiplier - 1));

  return (
    <SlicedPanel
      src={SLICING.mainMenu.characterPanel}
      padding={SLICING.dashboardInsets.character}
      fit="content"
    >
      <div className="flex items-stretch gap-2 sm:gap-2">
        <div className="relative flex-[0_0_42%] min-w-0 shrink-0 h-[8.25rem] sm:h-[9rem] md:h-[10rem]">
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="relative w-full h-full group"
            aria-label="Change profile picture"
          >
            <div className="relative w-full h-full">
              <Image
                src={SLICING.assets.chomperFront}
                alt="Chomper"
                fill
                className="object-contain object-bottom drop-shadow-[0_3px_6px_rgba(0,0,0,0.35)]"
                priority
                unoptimized
              />
            </div>
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

        <div className="flex-1 min-w-0 flex flex-col justify-start gap-0 sm:gap-0.5 pt-0.5">
          <p className="text-[#76B852] text-[10px] md:text-[11px] font-bold flex items-center gap-1.5 shrink-0">
            <span
              className="inline-block w-2 h-2 rounded-full bg-[#76B852] shrink-0"
              aria-hidden
            />
            Actively Farming
          </p>

          <h2 className="dashboard-character-name text-lg sm:text-xl md:text-2xl shrink-0">
            {chomperLabel}
          </h2>

          <p className="text-[#76B852] text-xs md:text-sm font-bold shrink-0">{rarityLabel}</p>

          <div className="dashboard-character-stat-box mt-0.5 p-1.5 md:p-2 shrink-0">
            <p className="text-[10px] md:text-[11px] font-bold text-[#4a2f1a] mb-0.5">
              Your Multiplier Stat
            </p>
            <div>
              <StatRow
                icon={
                  <Image
                    src={SLICING.assets.plank}
                    alt=""
                    width={16}
                    height={16}
                    className="w-4 h-4 object-contain shrink-0"
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
                    width={16}
                    height={16}
                    className="w-4 h-4 object-contain shrink-0"
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
                    width={16}
                    height={16}
                    className="w-4 h-4 object-contain shrink-0"
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
