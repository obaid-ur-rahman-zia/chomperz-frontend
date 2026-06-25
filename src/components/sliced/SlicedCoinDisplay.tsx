"use client";

import Image from "next/image";
import { SLICING } from "@/lib/slicing-paths";
import { formatCoins, formatCoinsCompact } from "@/lib/api";

interface SlicedCoinDisplayProps {
  value: number;
  variant: "coin" | "zcoin";
  compact?: boolean;
  /** Reference header: both balances in white on currency pills */
  headerStyle?: boolean;
  className?: string;
}

export function SlicedCoinDisplay({
  value,
  variant,
  compact,
  headerStyle,
  className = "",
}: SlicedCoinDisplayProps) {
  const icon = variant === "zcoin" ? SLICING.mainMenu.zCoin : SLICING.mainMenu.simpleCoin;
  const display = compact ? formatCoinsCompact(value) : formatCoins(value);

  return (
    <div
      className={`relative flex items-center shrink-0 ${
        compact
          ? "min-w-[3.25rem] sm:min-w-[4.5rem] h-7 sm:h-8 md:h-9"
          : "min-w-[4.5rem] h-8 md:h-9"
      } ${className}`}
    >
      <Image
        src={SLICING.navbar.currencyBar}
        alt=""
        fill
        className="object-fill"
        unoptimized
      />
      <div
        className={`relative z-[1] flex items-center w-full ${
          compact ? "gap-0.5 px-1 sm:gap-1 sm:px-2" : "gap-1 px-2"
        }`}
      >
        <Image
          src={icon}
          alt=""
          width={20}
          height={20}
          className={`shrink-0 ${
            compact ? "w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" : "w-4 h-4 md:w-5 md:h-5"
          }`}
          unoptimized
        />
        <span
          className={`font-black tabular-nums truncate ${
            compact ? "text-[9px] sm:text-[10px] md:text-xs" : "text-[10px] md:text-xs"
          } ${headerStyle ? "text-white" : variant === "zcoin" ? "text-[#facc15]" : "text-white"}`}
        >
          {display}
        </span>
      </div>
    </div>
  );
}

interface SlicedCoinRowProps {
  variant: "coin" | "zcoin";
  balance: number;
  rate: number;
  pending: number;
  action?: React.ReactNode;
  className?: string;
}

export function SlicedCoinRow({
  variant,
  balance,
  rate,
  pending,
  action,
  className = "",
}: SlicedCoinRowProps) {
  const icon = variant === "zcoin" ? SLICING.mainMenu.zCoin : SLICING.mainMenu.simpleCoin;
  const label = variant === "zcoin" ? "Z-Coin" : "S-Coin";

  return (
    <div className={`flex items-center gap-2 md:gap-3 py-2 ${className}`}>
      <Image src={icon} alt="" width={32} height={32} className="w-7 h-7 md:w-8 md:h-8 shrink-0" unoptimized />
      <div className="flex-1 min-w-0">
        <div className="text-white font-black text-sm md:text-base tabular-nums">
          {formatCoins(balance)}
        </div>
        <div className="text-[10px] md:text-xs text-[#a4b0af] font-bold">
          +{formatCoins(rate)}/Day (Pen {pending.toFixed(4)})
        </div>
      </div>
      {action}
    </div>
  );
}
