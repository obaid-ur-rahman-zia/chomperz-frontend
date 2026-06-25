"use client";

import Image from "next/image";
import { SLICING } from "@/lib/slicing-paths";
import { formatCoins } from "@/lib/api";
import { SlicedActionButton } from "./SlicedActionButton";

interface WalletEarningRowProps {
  variant: "coin" | "zcoin";
  balance: number;
  rate: number;
  pending: number;
  onAction: () => void;
  actionDisabled?: boolean;
  actionLabel?: string;
  actionBusy?: boolean;
}

export function WalletEarningRow({
  variant,
  balance,
  rate,
  pending,
  onAction,
  actionDisabled,
  actionLabel = "Claim",
  actionBusy,
}: WalletEarningRowProps) {
  const icon = variant === "zcoin" ? SLICING.mainMenu.zCoin : SLICING.mainMenu.simpleCoin;

  return (
    <div className="flex items-center gap-2 py-1.5 min-h-[2.75rem]">
      <Image
        src={icon}
        alt=""
        width={36}
        height={36}
        className="w-8 h-8 md:w-9 md:h-9 shrink-0 drop-shadow"
        unoptimized
      />
      <div className="flex-1 min-w-0 leading-tight">
        <p className="text-white font-black text-sm md:text-base tabular-nums drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
          {formatCoins(balance)}
        </p>
        <p className="text-[9px] md:text-[10px] font-bold">
          <span className="text-[#4ade80]">+{formatCoins(rate)}/Day</span>
          <span className="text-white/80"> (Pen {pending.toFixed(4)})</span>
        </p>
      </div>
      <SlicedActionButton
        src={SLICING.mainMenu.button}
        onClick={onAction}
        disabled={actionDisabled || actionBusy}
        className="h-7 md:h-8 min-w-[4.25rem] shrink-0"
      >
        {actionBusy ? "..." : actionLabel}
      </SlicedActionButton>
    </div>
  );
}
