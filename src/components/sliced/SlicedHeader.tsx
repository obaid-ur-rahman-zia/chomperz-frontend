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
      <Skeleton className="h-12 sm:h-14 md:h-16 w-full rounded-xl" />
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
      <div className="relative w-full h-12 sm:h-14 md:h-16">
        <Image
          src={SLICING.navbar.bar}
          alt=""
          fill
          className="object-fill pointer-events-none select-none z-0"
          priority
          unoptimized
        />

        <div className="absolute inset-0 z-10 flex items-center gap-1 sm:gap-2 px-1.5 sm:px-3 md:px-4 min-w-0 pointer-events-none [&>*]:pointer-events-auto">
          {/* Logo — height-bound so it stays inside the bar on narrow screens */}
          <div className="relative z-20 shrink-0 h-[78%] w-[4.25rem] min-[375px]:w-[4.75rem] sm:w-[6.5rem] md:w-[9rem] min-w-0">
            <Image
              src={SLICING.logo}
              alt="ChomperZ Idle"
              fill
              className="object-contain object-left"
              priority
              unoptimized
            />
          </div>

          {/* Search — desktop only */}
          <div className="hidden md:flex relative z-20 flex-1 justify-center max-w-xs lg:max-w-sm mx-2 min-w-0">
            <div className="relative w-full h-8 lg:h-9">
              <Image
                src={SLICING.navbar.searchBar}
                alt=""
                fill
                className="object-fill"
                unoptimized
              />
              <div className="absolute inset-0 flex items-center px-3 gap-2">
                <Image
                  src={SLICING.navbar.searchIcon}
                  alt=""
                  width={16}
                  height={16}
                  className="w-4 h-4 opacity-70 shrink-0"
                  unoptimized
                />
                <span className="text-xs text-[#8a8070] font-bold">Search...</span>
              </div>
            </div>
          </div>

          {/* Spacer on mobile/tablet — keeps coins + avatar on the right */}
          <div className="flex-1 min-w-0 md:hidden" aria-hidden />

          {/* Currency + profile */}
          <div className="relative z-20 flex items-center gap-0.5 sm:gap-1 md:gap-1.5 shrink-0 min-w-0">
            <SlicedCoinDisplay value={player.coins ?? 0} variant="coin" compact />
            <SlicedCoinDisplay value={player.zCoins} variant="zcoin" compact />

            <div className="hidden lg:block min-w-0">
              <UserMenu
                twitterHandle={player.twitterHandle}
                profilePicUrl={avatar}
                compact
                className="max-w-[10rem]"
              />
            </div>

            <UserMenu
              twitterHandle={player.twitterHandle}
              profilePicUrl={avatar}
              avatarOnly
              className="lg:hidden shrink-0"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
