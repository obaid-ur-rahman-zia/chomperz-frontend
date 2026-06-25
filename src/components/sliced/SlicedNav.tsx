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
      className={`relative flex items-center justify-center no-underline transition-transform active:scale-[0.98] ${
        mobile ? "flex-1 min-w-0 py-1" : "min-w-0 w-full"
      }`}
    >
      <div
        className={`relative w-full ${
          mobile ? "h-12" : "aspect-[2.35/1] max-h-[4.5rem]"
        }`}
      >
        <Image
          src={active ? SLICING.buttons.tabSelected : SLICING.buttons.tabUnselected}
          alt=""
          fill
          className="object-fill"
          unoptimized
        />
        <div
          className={`absolute inset-0 flex items-center justify-center px-2 md:px-2.5 ${
            mobile ? "flex-col gap-0.5" : "flex-row gap-1.5"
          }`}
        >
          <Image
            src={icon}
            alt=""
            width={28}
            height={28}
            className={`shrink-0 object-contain ${
              mobile ? "w-5 h-5" : "w-6 h-6 md:w-7 md:h-7"
            }`}
            unoptimized
          />
          <span
            className={`font-black leading-none truncate sliced-btn-text ${
              mobile ? "text-[8px] w-full text-center" : "text-[10px] md:text-[11px]"
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
      className="hidden lg:block mb-3 relative rounded-xl overflow-hidden"
    >
      <div className="relative z-[1] grid grid-cols-6 gap-1.5 md:gap-2 p-1.5">
        {NAV_ITEMS.map(({ href, label, icon }) => (
          <NavTab
            key={href}
            href={href}
            label={label}
            icon={icon}
            active={pathname === href}
          />
        ))}
      </div>
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
      <div className="pointer-events-auto max-w-lg mx-auto relative">
        <div className="relative rounded-xl overflow-hidden border-2 border-[#6b4a2e] shadow-[0_4px_16px_rgba(0,0,0,0.5)]">
          <Image
            src={SLICING.navbar.bar}
            alt=""
            width={600}
            height={72}
            className="absolute inset-0 w-full h-full object-fill opacity-95"
            unoptimized
          />
          <div className="relative z-[1] flex items-stretch p-1">
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
      </div>
    </nav>
  );
}
