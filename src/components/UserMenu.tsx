"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { UserAvatar } from "@/components/UserAvatar";
import { ChevronDownIcon, LogoutIcon, ProfileIcon } from "@/components/Icons";
import { apiFetch, clearToken } from "@/lib/api";

interface UserMenuProps {
  twitterHandle: string;
  profilePicUrl?: string | null;
  compact?: boolean;
  avatarOnly?: boolean;
  className?: string;
}

function formatHandle(handle: string) {
  return handle.startsWith("@") ? handle : `@${handle}`;
}

export function UserMenu({
  twitterHandle,
  profilePicUrl,
  compact = false,
  avatarOnly = false,
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
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={avatarOnly ? `${displayName} menu` : undefined}
        className={
          avatarOnly
            ? "relative shrink-0 w-8 h-8 rounded-full overflow-hidden border-2 border-[var(--green)] transition-[filter] hover:brightness-110"
            : `game-pill flex items-center gap-1.5 rounded-full w-full min-w-0 transition-[filter] hover:brightness-110 ${
                compact
                  ? "pl-0.5 pr-1.5 py-0.5 min-h-[32px] lg:min-h-[40px] lg:pl-1 lg:pr-2.5 lg:py-1"
                  : "pl-1 pr-2.5 py-1 min-h-[40px]"
              }`
        }
      >
        {avatarOnly ? (
          <UserAvatar src={avatar} alt={displayName} />
        ) : (
          <>
            <div
              className={`relative rounded-full overflow-hidden border-2 border-[var(--green)] shrink-0 ${
                compact ? "w-7 h-7 lg:w-8 lg:h-8" : "w-8 h-8"
              }`}
            >
              <UserAvatar src={avatar} alt={displayName} />
            </div>
            <span
              className={`font-extrabold truncate min-w-0 flex-1 text-left ${
                compact ? "text-[11px] lg:text-sm max-w-full" : "text-sm max-w-[120px]"
              }`}
            >
              {displayName}
            </span>
            <ChevronDownIcon
              className={`text-[var(--muted)] shrink-0 transition-transform ${open ? "rotate-180" : ""} ${
                compact ? "w-3.5 h-3.5 lg:w-4 lg:h-4" : "w-4 h-4"
              }`}
            />
          </>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-white/10 bg-[#2a2b2a] shadow-[0_8px_0_rgba(0,0,0,0.35),0_12px_32px_rgba(0,0,0,0.5)] z-50 overflow-hidden"
        >
          <div className="flex items-center gap-3 px-3 py-3 border-b border-white/10">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-[var(--green)] shrink-0">
              <UserAvatar src={avatar} alt={displayName} />
            </div>
            <p className="text-sm font-extrabold truncate min-w-0">{displayName}</p>
          </div>

          <Link
            href="/profile"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-3 text-sm font-bold text-white no-underline hover:bg-white/5 transition-colors"
          >
            <ProfileIcon className="w-4 h-4 text-[var(--blue)] shrink-0" />
            View Profile
          </Link>

          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 px-4 py-3 text-sm font-bold text-[var(--danger)] hover:bg-white/5 transition-colors"
          >
            <LogoutIcon className="w-4 h-4 shrink-0" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
