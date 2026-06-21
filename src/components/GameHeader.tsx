"use client";

import { CoinIcon } from "@/components/Icons";
import { UserMenu } from "@/components/UserMenu";
import { WalletConnect } from "@/components/WalletConnect";
import { Skeleton } from "@/components/Loading";
import { usePlayerContext } from "@/context/PlayerContext";
import { formatCoins, formatCoinsCompact } from "@/lib/api";

function HeaderSkeleton() {
  return (
    <header className="mb-5 max-w-full" aria-busy="true" aria-label="Loading header">
      <div className="flex items-center justify-between gap-2 mb-2 lg:mb-0">
        <Skeleton className="h-6 w-36 lg:hidden" />
        <Skeleton className="h-8 w-8 rounded-full shrink-0 lg:hidden" />
      </div>

      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-2">
        <Skeleton className="h-8 w-48 hidden lg:block" />

        <div className="flex flex-wrap items-center gap-1.5 w-full lg:w-auto min-w-0">
          <Skeleton className="h-8 w-[4.25rem] rounded-full shrink-0" />
          <Skeleton className="h-8 w-[4.25rem] rounded-full shrink-0" />
          <Skeleton className="h-8 w-[3.75rem] rounded-lg shrink-0" />
          <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
          <Skeleton className="h-8 w-28 rounded-full shrink-0 hidden lg:block" />
        </div>
      </div>
    </header>
  );
}

function CoinPill({
  value,
  gold,
}: {
  value: number;
  gold?: boolean;
}) {
  return (
    <div
      className={`game-pill px-1.5 py-1 sm:px-2 lg:px-3 lg:py-1.5 rounded-full text-[10px] sm:text-[11px] lg:text-sm font-semibold flex items-center gap-0.5 sm:gap-1 shrink-0 min-w-0 ${
        gold ? "game-pill-gold text-[var(--gold)]" : "text-gray-200"
      }`}
      title={formatCoins(value)}
    >
      <CoinIcon
        className={`w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 shrink-0 ${
          gold ? "text-[var(--gold)]" : "text-gray-300"
        }`}
      />
      <span className="tabular-nums sm:hidden">{formatCoinsCompact(value)}</span>
      <span className="tabular-nums hidden sm:inline">{formatCoins(value)}</span>
    </div>
  );
}

export function GameHeader() {
  const { player, loading, refresh } = usePlayerContext();

  if (loading) {
    return <HeaderSkeleton />;
  }

  if (!player) return null;

  return (
    <header className="mb-5 max-w-full">
      <div className="flex items-center justify-between gap-2 mb-2 lg:mb-0">
        <h1 className="text-lg lg:text-2xl font-black tracking-wide uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] lg:hidden truncate min-w-0">
          ChomperZ Idle
        </h1>
        <UserMenu
          twitterHandle={player.twitterHandle}
          profilePicUrl={player.profilePicUrl}
          avatarOnly
          className="shrink-0 lg:hidden"
        />
      </div>

      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-2 min-w-0">
        <h1 className="hidden lg:block text-2xl font-black tracking-wide uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] shrink-0">
          ChomperZ Idle
        </h1>

        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full lg:w-auto min-w-0">
          <CoinPill value={player.coins ?? 0} />
          <CoinPill value={player.zCoins} gold />

          <WalletConnect
            variant="header"
            walletAddress={player.walletAddress}
            nftCount={player.nftCount}
            onLinked={() => refresh({ silent: true })}
          />

          <UserMenu
            twitterHandle={player.twitterHandle}
            profilePicUrl={player.profilePicUrl}
            compact
            className="hidden lg:block lg:max-w-[160px]"
          />
        </div>
      </div>
    </header>
  );
}
