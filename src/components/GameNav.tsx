"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CrownIcon,
  EditIcon,
  HomeIcon,
  MapIcon,
  PinIcon,
  ShopIcon,
} from "@/components/Icons";

const NAV = [
  { href: "/dashboard", label: "Home", shortLabel: "Home", icon: HomeIcon },
  { href: "/crib", label: "Crib", shortLabel: "Crib", icon: PinIcon },
  { href: "/shop", label: "Shop", shortLabel: "Shop", icon: ShopIcon },
  { href: "/inventory", label: "Inventory", shortLabel: "Inv", icon: EditIcon },
  { href: "/map", label: "Map", shortLabel: "Map", icon: MapIcon },
  {
    href: "/leaderboard",
    label: "Leaderboard",
    shortLabel: "Rank",
    icon: CrownIcon,
  },
] as const;

/** Top tab bar — desktop only */
export function GameNavDesktop() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Game navigation"
      className="hidden lg:grid lg:grid-cols-6 gap-3 mb-6"
    >
      {NAV.map(({ href, label }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`btn-nav py-2 px-3 text-sm shadow-lg no-underline ${
              active ? "ring-2 ring-white/25" : ""
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

/** Fixed bottom bar — render outside scroll/transform containers (see GameShell) */
export function GameNavMobile() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile game navigation"
      className="game-bottom-nav fixed bottom-0 left-0 right-0 z-[100] px-3 pb-[max(0.625rem,env(safe-area-inset-bottom))] lg:hidden pointer-events-none"
    >
      <div className="game-bottom-nav-glass pointer-events-auto max-w-lg mx-auto">
        <div className="game-bottom-nav-inner">
          {NAV.map(({ href, shortLabel, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`game-bottom-nav-item no-underline ${
                  active ? "game-bottom-nav-item-active" : ""
                }`}
              >
                {active ? <span className="game-bottom-nav-pill" aria-hidden /> : null}
                <Icon className="game-bottom-nav-icon w-5 h-5 shrink-0" />
                <span className="game-bottom-nav-label truncate w-full text-center">
                  {shortLabel}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

/** @deprecated Use GameNavDesktop + GameNavMobile in GameShell */
export function GameNav() {
  return (
    <>
      <GameNavDesktop />
      <GameNavMobile />
    </>
  );
}
