"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRightIcon,
  HomeIcon,
  MapIcon,
  ShopIcon,
} from "@/components/Icons";

const NAV = [
  {
    href: "/crib",
    label: "My Crib",
    shortLabel: "Crib",
    icon: HomeIcon,
    variant: "secondary" as const,
  },
  {
    href: "/shop",
    label: "Furniture Shop",
    shortLabel: "Shop",
    icon: ShopIcon,
    variant: "secondary" as const,
  },
  {
    href: "/map",
    label: "Enter Map",
    shortLabel: "Map",
    icon: MapIcon,
    variant: "primary" as const,
  },
] as const;

export function GameNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Game navigation"
      className="sticky top-0 z-40 -mx-1 mb-4 grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-[#1a1f1c]/95 p-2 backdrop-blur-md sm:gap-3 sm:p-2.5"
    >
      {NAV.map(({ href, label, shortLabel, icon: Icon, variant }) => {
        const active = pathname === href;
        const btnClass = variant === "primary" ? "btn-primary" : "btn-secondary";

        return (
          <Link
            key={href}
            href={href}
            className={`${btnClass} py-2.5 sm:py-3 text-[11px] sm:text-sm no-underline justify-center min-w-0 ${
              active ? "ring-2 ring-white/25" : ""
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="truncate hidden min-[380px]:inline">{label}</span>
            <span className="truncate min-[380px]:hidden">{shortLabel}</span>
            {href === "/map" && (
              <ArrowRightIcon className="w-3.5 h-3.5 opacity-80 shrink-0 hidden sm:block" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
