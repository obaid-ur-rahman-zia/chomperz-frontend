"use client";

import Image from "next/image";
import { Skeleton } from "@/components/Loading";
import { UserMenu } from "@/components/UserMenu";
import { SlicedCoinDisplay } from "./SlicedCoinDisplay";
import { SLICING } from "@/lib/slicing-paths";
import { usePlayerContext } from "@/context/PlayerContext";

function HeaderSkeleton() {
  return (
    <header className="mb-2 sm:mb-3 md:mb-4 max-w-full" aria-busy="true">
      <Skeleton className="h-12 sm:h-14 md:h-[4.5rem] w-full rounded-xl" />
    </header>
  );
}

export function SlicedHeader() {
  const { player, loading } = usePlayerContext();

  if (loading) return <HeaderSkeleton />;
  if (!player) return null;

  const avatar = player.displayAvatarUrl ?? "/images/chomper.jpg";

  return (
    <header className="sliced-header sticky top-0 z-40 isolate w-full max-w-full mb-2 sm:mb-3 md:mb-3">
      <div className="relative w-full h-12 sm:h-14 md:h-[4.5rem] lg:h-[4.75rem]">
        <Image
          src={SLICING.navbar.bar}
          alt=""
          fill
          className="object-fill pointer-events-none select-none z-0"
          priority
          unoptimized
        />

        <div className="absolute inset-0 z-10 flex items-center gap-1.5 sm:gap-2 md:gap-3 px-2 sm:px-3 md:px-4 lg:px-5 min-w-0 pointer-events-none [&>*]:pointer-events-auto">
          {/* Logo */}
          <div className="relative z-20 shrink-0 h-[76%] md:h-[82%] w-[4.5rem] sm:w-[6.5rem] md:w-[8.5rem] lg:w-[9.5rem] min-w-0">
            <Image
              src={SLICING.logo}
              alt="ChomperZ Idle"
              fill
              className="object-contain object-left"
              priority
              unoptimized
            />
          </div>

          {/* Search — tablet/desktop */}
          <div className="hidden md:flex relative z-20 flex-1 min-w-0 max-w-lg mx-1 lg:mx-3">
            <div className="relative w-full h-9 lg:h-10">
              <Image
                src={SLICING.navbar.searchBar}
                alt=""
                fill
                className="object-fill"
                unoptimized
              />
              <div className="absolute inset-0 flex items-center px-3 lg:px-4 gap-2">
                <Image
                  src={SLICING.navbar.searchIcon}
                  alt=""
                  width={18}
                  height={18}
                  className="w-4 h-4 lg:w-[18px] lg:h-[18px] opacity-80 shrink-0"
                  unoptimized
                />
                <span className="text-xs lg:text-sm text-[#b8b0a4] font-bold truncate">
                  Search...
                </span>
              </div>
            </div>
          </div>

          {/* Mobile spacer */}
          <div className="flex-1 min-w-0 md:hidden" aria-hidden />

          {/* Currency + profile */}
          <div className="relative z-20 flex items-center gap-1 sm:gap-1.5 md:gap-2 shrink-0 min-w-0">
            <SlicedCoinDisplay
              value={player.coins ?? 0}
              variant="coin"
              compact
              headerStyle
              className="md:!min-w-[5rem] md:!h-9 lg:!h-10 lg:!min-w-[5.5rem]"
            />
            <SlicedCoinDisplay
              value={player.zCoins}
              variant="zcoin"
              compact
              headerStyle
              className="md:!min-w-[5rem] md:!h-9 lg:!h-10 lg:!min-w-[5.5rem]"
            />

            <UserMenu
              twitterHandle={player.twitterHandle}
              profilePicUrl={avatar}
              headerSplit
              className="hidden md:flex shrink-0 min-w-0"
            />

            <UserMenu
              twitterHandle={player.twitterHandle}
              profilePicUrl={avatar}
              avatarOnly
              className="md:hidden shrink-0"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
