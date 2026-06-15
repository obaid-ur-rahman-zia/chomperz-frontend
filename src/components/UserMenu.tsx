"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { UserAvatar } from "@/components/UserAvatar";
import { ChevronDownIcon, LogoutIcon, ProfileIcon } from "@/components/Icons";
import { apiFetch, clearToken } from "@/lib/api";

interface UserMenuProps {
  twitterHandle: string;
  profilePicUrl?: string | null;
}

function formatHandle(handle: string) {
  return handle.startsWith("@") ? handle : `@${handle}`;
}

export function UserMenu({ twitterHandle, profilePicUrl }: UserMenuProps) {
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
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-full border-2 border-[#3a453d] bg-black/30 pl-1 pr-2.5 py-1 min-h-[40px] transition-opacity hover:opacity-90"
      >
        <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-[var(--green)] shrink-0">
          <UserAvatar src={avatar} alt={displayName} />
        </div>
        <span className="text-sm font-extrabold max-w-[72px] sm:max-w-[120px] truncate">
          {displayName}
        </span>
        <ChevronDownIcon
          className={`w-4 h-4 text-[var(--muted)] shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-52 rounded-xl border-2 border-[#3a453d] bg-[var(--card)] shadow-xl z-50 overflow-hidden"
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
