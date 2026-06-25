"use client";

import { SLICING } from "@/lib/slicing-paths";
import Image from "next/image";

interface SubTab {
  id: string;
  label: string;
}

interface SlicedSubTabsProps {
  tabs: SubTab[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}

export function SlicedSubTabs({ tabs, active, onChange, className = "" }: SlicedSubTabsProps) {
  return (
    <div className={`flex flex-wrap justify-center gap-2 md:gap-3 ${className}`}>
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className="relative h-9 md:h-10 min-w-[5rem] md:min-w-[6.5rem] transition-transform active:scale-95"
          >
            <Image
              src={isActive ? SLICING.shop.selectedButton : SLICING.shop.unselectedButton}
              alt=""
              fill
              className="object-fill"
              unoptimized
            />
            <span
              className={`relative z-[1] flex items-center justify-center h-full px-3 text-[10px] md:text-xs font-black ${
                isActive ? "text-white" : "text-[#c4b5a0]"
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

interface SlicedLeaderboardTabsProps {
  tabs: SubTab[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}

export function SlicedLeaderboardTabs({
  tabs,
  active,
  onChange,
  className = "",
}: SlicedLeaderboardTabsProps) {
  return (
    <div className={`sliced-leaderboard-tabs flex flex-wrap justify-center gap-2 ${className}`}>
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className="relative h-9 md:h-10 min-w-[6.5rem] md:min-w-[8rem] transition-transform active:scale-95"
          >
            <Image
              src={isActive ? SLICING.shop.selectedButton : SLICING.shop.unselectedButton}
              alt=""
              fill
              className="object-fill"
              unoptimized
            />
            <span
              className={`relative z-[1] flex items-center justify-center h-full px-2 text-[9px] md:text-[10px] font-black ${
                isActive ? "text-white" : "text-[#c4b5a0]"
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
