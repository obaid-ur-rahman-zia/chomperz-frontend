"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, SLICING } from "@/lib/slicing-paths";

function NavTab({
  href,
  label,
  icon,
  active,
  shortLabel,
  mobile,
}: {
  href: string;
  label: string;
  icon: string;
  active: boolean;
  shortLabel?: string;
  mobile?: boolean;
}) {
  const displayLabel = mobile ? (shortLabel ?? label) : label;

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`relative flex flex-col items-center justify-center no-underline transition-transform active:scale-95 ${
        mobile ? "flex-1 min-w-0 py-1" : "min-w-0"
      }`}
    >
      <div className={`relative ${mobile ? "w-full h-12" : "w-full h-14 md:h-16"}`}>
        <Image
          src={active ? SLICING.buttons.tabSelected : SLICING.buttons.tabUnselected}
          alt=""
          fill
          className="object-fill"
          unoptimized
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 px-1">
          <Image
            src={icon}
            alt=""
            width={28}
            height={28}
            className={`${mobile ? "w-5 h-5" : "w-6 h-6 md:w-7 md:h-7"} object-contain`}
            unoptimized
          />
          <span
            className={`font-black leading-none truncate w-full text-center ${
              mobile ? "text-[8px]" : "text-[9px] md:text-[10px]"
            } ${active ? "text-white" : "text-[#d4c4a8]"}`}
          >
            {displayLabel}
          </span>
        </div>
      </div>
    </Link>
  );
}

export function SlicedNavDesktop() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Game navigation"
      className="hidden lg:grid lg:grid-cols-6 gap-2 mb-4 md:mb-5"
    >
      {NAV_ITEMS.map(({ href, label, icon }) => (
        <NavTab
          key={href}
          href={href}
          label={label}
          icon={icon}
          active={pathname === href}
        />
      ))}
    </nav>
  );
}

export function SlicedNavMobile() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile game navigation"
      className="fixed bottom-0 left-0 right-0 z-[100] px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] lg:hidden pointer-events-none"
    >
      <div className="pointer-events-auto max-w-lg mx-auto bg-[#2a1f14]/90 rounded-xl border border-[#5c4030] p-1 shadow-2xl">
        <div className="flex items-stretch">
          {NAV_ITEMS.map(({ href, label, shortLabel, icon }) => (
            <NavTab
              key={href}
              href={href}
              label={label}
              shortLabel={shortLabel}
              icon={icon}
              active={pathname === href}
              mobile
            />
          ))}
        </div>
      </div>
    </nav>
  );
}
