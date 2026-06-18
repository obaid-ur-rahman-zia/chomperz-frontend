"use client";

import { CoinIcon } from "@/components/Icons";
import { UserMenu } from "@/components/UserMenu";
import { WalletConnect } from "@/components/WalletConnect";
import { Skeleton } from "@/components/Loading";
import { usePlayerContext } from "@/context/PlayerContext";
import { formatCoins } from "@/lib/api";

function HeaderSkeleton() {
  return (
    <header className="mb-5">
      <Skeleton className="h-7 w-40 mx-auto lg:mx-0 mb-2 lg:mb-0 lg:hidden" />
      <Skeleton className="h-8 w-28 mx-auto mb-2 lg:hidden" />
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-2">
        <Skeleton className="h-8 w-48 hidden lg:block" />
        <div className="flex items-center gap-1.5 w-full lg:w-auto flex-nowrap">
          <Skeleton className="h-8 w-[4.5rem] rounded-full shrink-0" />
          <Skeleton className="h-8 w-[4.5rem] rounded-full shrink-0" />
          <Skeleton className="h-8 w-20 rounded-lg shrink-0" />
          <Skeleton className="h-8 flex-1 min-w-0 rounded-full" />
        </div>
      </div>
    </header>
  );
}

export function GameHeader() {
  const { player, loading, refresh } = usePlayerContext();

  if (loading) {
    return <HeaderSkeleton />;
  }

  if (!player) return null;

  return (
    <header className="mb-5">
      <div className="flex items-center justify-between gap-2 mb-2 lg:mb-0">
        <h1 className="text-lg lg:text-2xl font-black tracking-wide uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] lg:hidden">
          ChomperZ Idle
        </h1>
        <div className="lg:hidden shrink-0">
          <WalletConnect
            variant="header"
            walletAddress={player.walletAddress}
            onLinked={() => refresh({ silent: true })}
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-2">
        <h1 className="hidden lg:block text-2xl font-black tracking-wide uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
          ChomperZ Idle
        </h1>

        <div className="flex items-center gap-1.5 sm:gap-2 w-full lg:w-auto flex-nowrap min-w-0">
          <div className="game-pill px-2 py-1 lg:px-3 lg:py-1.5 rounded-full text-gray-200 text-[11px] lg:text-sm font-semibold flex items-center gap-1 shrink-0">
            <CoinIcon className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-gray-300 shrink-0" />
            <span className="tabular-nums">{formatCoins(player.coins ?? 0)}</span>
          </div>

          <div className="game-pill game-pill-gold px-2 py-1 lg:px-3 lg:py-1.5 rounded-full text-[var(--gold)] text-[11px] lg:text-sm font-semibold flex items-center gap-1 shrink-0">
            <CoinIcon className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-[var(--gold)] shrink-0" />
            <span className="tabular-nums">{formatCoins(player.zCoins)}</span>
          </div>

          <div className="hidden lg:flex shrink-0">
            <WalletConnect
              variant="header"
              walletAddress={player.walletAddress}
              onLinked={() => refresh({ silent: true })}
            />
          </div>

          <UserMenu
            twitterHandle={player.twitterHandle}
            profilePicUrl={player.profilePicUrl}
            compact
            className="flex-1 min-w-0 lg:flex-none lg:max-w-[160px]"
          />
        </div>
      </div>
    </header>
  );
}
