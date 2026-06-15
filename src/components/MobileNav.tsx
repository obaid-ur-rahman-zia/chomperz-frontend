"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  MapIcon,
  ProfileIcon,
  ShopIcon,
} from "@/components/Icons";

const NAV = [
  { href: "/dashboard", label: "Camp", icon: HomeIcon },
  { href: "/map", label: "Map", icon: MapIcon },
  { href: "/crib", label: "Crib", icon: HomeIcon },
  { href: "/shop", label: "Shop", icon: ShopIcon },
  { href: "/profile", label: "Profile", icon: ProfileIcon },
] as const;

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 border-t border-white/10 bg-[#1a1f1c]/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="flex justify-around items-stretch max-w-lg mx-auto">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-2.5 text-[10px] font-extrabold no-underline transition-colors ${
                active ? "text-[var(--green)]" : "text-[var(--muted)]"
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
