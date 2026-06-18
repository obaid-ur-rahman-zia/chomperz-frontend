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

export function GameNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop: top tab bar */}
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

      {/* Mobile: fixed bottom nav */}
      <nav
        aria-label="Mobile game navigation"
        className="game-bottom-nav fixed bottom-0 inset-x-0 z-50 pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        <div className="flex justify-around items-stretch max-w-lg mx-auto">
          {NAV.map(({ href, shortLabel, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-2.5 text-[10px] font-extrabold no-underline transition-all min-w-0 px-0.5 ${
                  active
                    ? "game-bottom-nav-item-active text-[var(--green)]"
                    : "text-[var(--muted)]"
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="truncate w-full text-center">{shortLabel}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
