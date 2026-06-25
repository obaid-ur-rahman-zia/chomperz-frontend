"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { UserAvatar } from "@/components/UserAvatar";
import { ChevronDownIcon, LogoutIcon, ProfileIcon } from "@/components/Icons";
import { SlicedActionButton } from "@/components/sliced";
import { SLICING } from "@/lib/slicing-paths";
import { apiFetch, clearToken } from "@/lib/api";

interface UserMenuProps {
  twitterHandle: string;
  profilePicUrl?: string | null;
  compact?: boolean;
  avatarOnly?: boolean;
  /** Reference header: square avatar + separate username pill */
  headerSplit?: boolean;
  className?: string;
}

function formatHandle(handle: string) {
  return handle.startsWith("@") ? handle : `@${handle}`;
}

function ProfileDropdown({
  avatar,
  displayName,
  onClose,
  onLogout,
}: {
  avatar: string;
  displayName: string;
  onClose: () => void;
  onLogout: () => void;
}) {
  return (
    <div
      role="menu"
      className="absolute right-0 top-full mt-1.5 w-[13.5rem] md:w-56 z-[200]"
    >
      <div className="relative overflow-hidden rounded-xl border-2 border-[#6b4a2e] shadow-[0_8px_20px_rgba(0,0,0,0.55)] bg-[#1a1008] min-h-[11.5rem]">
        <Image
          src={SLICING.crib.mainPanel}
          alt=""
          fill
          className="object-fill pointer-events-none select-none opacity-95"
          unoptimized
        />

        <div className="relative z-[1] flex flex-col p-2.5 gap-2">
          <div className="relative h-8 shrink-0">
            <Image
              src={SLICING.crib.header}
              alt=""
              fill
              className="object-fill"
              unoptimized
            />
            <p className="absolute inset-0 flex items-center justify-center px-2 text-[10px] md:text-[11px] font-black text-[#f5d76e] sliced-title truncate">
              {displayName}
            </p>
          </div>

          <div className="flex items-center gap-2.5 px-1 py-1">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-[#6b5344] shrink-0 sliced-wood-inset">
              <UserAvatar key={avatar} src={avatar} alt={displayName} />
            </div>
            <p className="text-[11px] md:text-xs font-bold text-[#c4b5a0] leading-tight">
              Manage your profile and session
            </p>
          </div>

          <div className="flex flex-col gap-1.5 pt-0.5">
            <Link href="/profile" role="menuitem" onClick={onClose} className="block no-underline">
              <SlicedActionButton
                src={SLICING.shop.unselectedButton}
                className="w-full h-9 text-xs md:text-sm"
              >
                <span className="flex items-center gap-2">
                  <ProfileIcon className="w-4 h-4 text-[#7dd3fc] shrink-0" />
                  View Profile
                </span>
              </SlicedActionButton>
            </Link>

            <SlicedActionButton
              src={SLICING.shop.unselectedButton}
              onClick={onLogout}
              className="w-full h-9 text-xs md:text-sm"
            >
              <span className="flex items-center gap-2">
                <LogoutIcon className="w-4 h-4 text-[#fbbf24] shrink-0" />
                Logout
              </span>
            </SlicedActionButton>
          </div>
        </div>
      </div>
    </div>
  );
}

export function UserMenu({
  twitterHandle,
  profilePicUrl,
  compact = false,
  avatarOnly = false,
  headerSplit = false,
  className = "",
}: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const avatar = profilePicUrl || "/images/chomper.jpg";
  const displayName = formatHandle(twitterHandle);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  async function handleLogout() {
    setOpen(false);
    await apiFetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    clearToken();
    window.location.href = "/login";
  }

  return (
    <div className={`relative min-w-0 ${className}`} ref={ref}>
      {avatarOnly ? (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-haspopup="menu"
          aria-label={`${displayName} menu`}
          className="relative shrink-0 w-7 h-7 sm:w-8 sm:h-8 transition-transform active:scale-95"
        >
          <Image
            src={SLICING.navbar.profileImage}
            alt=""
            fill
            className="object-fill pointer-events-none"
            unoptimized
          />
          <div className="absolute inset-[3px] rounded-sm overflow-hidden">
            <UserAvatar key={avatar} src={avatar} alt={displayName} />
          </div>
        </button>
      ) : headerSplit ? (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-haspopup="menu"
          aria-label={`${displayName} menu`}
          className="flex items-center gap-1.5 lg:gap-2 min-w-0 transition-transform active:scale-[0.98]"
        >
          <span className="relative shrink-0 w-9 h-9 lg:w-10 lg:h-10">
            <Image
              src={SLICING.navbar.profileImage}
              alt=""
              fill
              className="object-fill pointer-events-none"
              unoptimized
            />
            <span className="absolute inset-[3px] lg:inset-1 overflow-hidden rounded-sm block">
              <UserAvatar key={avatar} src={avatar} alt={displayName} className="object-cover" />
            </span>
          </span>

          <span className="relative h-9 lg:h-10 min-w-[6.5rem] max-w-[10rem] lg:max-w-[11rem] flex-1">
            <Image
              src={SLICING.navbar.profileNameBar}
              alt=""
              fill
              className="object-fill pointer-events-none"
              unoptimized
            />
            <span className="absolute inset-0 flex items-center px-2.5 lg:px-3 min-w-0">
              <span className="font-black truncate text-left text-white sliced-btn-text text-xs lg:text-sm">
                {displayName}
              </span>
            </span>
          </span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-haspopup="menu"
          className={`relative w-full min-w-0 transition-transform active:scale-[0.98] ${
            compact ? "h-8 md:h-9" : "h-10"
          }`}
        >
          <Image
            src={SLICING.navbar.profileNameBar}
            alt=""
            fill
            className="object-fill pointer-events-none"
            unoptimized
          />
          <span
            className={`absolute inset-0 flex items-center gap-1 min-w-0 ${
              compact ? "px-1 md:px-1.5" : "px-2"
            }`}
          >
            <div
              className={`relative shrink-0 overflow-hidden rounded-full border border-[#5c4030] ${
                compact ? "w-6 h-6 md:w-7 md:h-7" : "w-8 h-8"
              }`}
            >
              <UserAvatar key={avatar} src={avatar} alt={displayName} />
            </div>
            <span
              className={`font-black truncate min-w-0 flex-1 text-left text-white sliced-btn-text ${
                compact ? "text-[10px] md:text-xs" : "text-sm"
              }`}
            >
              {displayName}
            </span>
            <ChevronDownIcon
              className={`text-[#d4c4a8] shrink-0 transition-transform ${open ? "rotate-180" : ""} ${
                compact ? "w-3 h-3 md:w-3.5 md:h-3.5" : "w-4 h-4"
              }`}
            />
          </span>
        </button>
      )}

      {open && (
        <ProfileDropdown
          avatar={avatar}
          displayName={displayName}
          onClose={() => setOpen(false)}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}
