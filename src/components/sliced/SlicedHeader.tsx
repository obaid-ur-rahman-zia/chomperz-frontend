"use client";

import Image from "next/image";
import { Skeleton } from "@/components/Loading";
import { UserMenu } from "@/components/UserMenu";
import { SlicedCoinDisplay } from "./SlicedCoinDisplay";
import { SLICING } from "@/lib/slicing-paths";
import { usePlayerContext } from "@/context/PlayerContext";

function HeaderSkeleton() {
  return (
    <header className="mb-3 md:mb-4" aria-busy="true">
      <Skeleton className="h-14 md:h-16 w-full rounded-xl" />
    </header>
  );
}

export function SlicedHeader() {
  const { player, loading } = usePlayerContext();

  if (loading) return <HeaderSkeleton />;
  if (!player) return null;

  const avatar = player.displayAvatarUrl ?? "/images/chomper.jpg";

  return (
    <header className="relative w-full mb-3 md:mb-0">
      <div className="relative w-full min-h-[3.25rem] md:min-h-[4rem]">
        <Image
          src={SLICING.navbar.bar}
          alt=""
          width={1200}
          height={80}
          className="w-full h-auto pointer-events-none select-none"
          priority
          unoptimized
        />

        <div className="absolute inset-0 flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-1">
          {/* Logo */}
          <div className="shrink-0 w-[5.5rem] sm:w-[7rem] md:w-[9rem]">
            <Image
              src={SLICING.logo}
              alt="ChomperZ Idle"
              width={180}
              height={60}
              className="w-full h-auto object-contain"
              priority
              unoptimized
            />
          </div>

          {/* Search — decorative */}
          <div className="hidden md:flex flex-1 justify-center max-w-xs lg:max-w-sm mx-2">
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

          {/* Currency + profile */}
          <div className="flex items-center gap-1 sm:gap-1.5 ml-auto shrink-0">
            <SlicedCoinDisplay value={player.coins ?? 0} variant="coin" compact />
            <SlicedCoinDisplay value={player.zCoins} variant="zcoin" compact />

            <div className="hidden lg:block">
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
