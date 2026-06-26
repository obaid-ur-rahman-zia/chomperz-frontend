"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { UserAvatar } from "@/components/UserAvatar";
import { Skeleton } from "@/components/Loading";
import { UserMenu } from "@/components/UserMenu";
import { SlicedCoinDisplay } from "./SlicedCoinDisplay";
import { SLICING } from "@/lib/slicing-paths";
import { usePlayerContext } from "@/context/PlayerContext";
import { apiFetch } from "@/lib/api";
import { formatHandle } from "@/lib/handle";
import { toast } from "@/lib/toast";

interface PlayerSuggestion {
  userId: string;
  username: string;
  displayAvatarUrl: string;
}

function HeaderSkeleton() {
  return (
    <header className="mb-2 sm:mb-3 md:mb-4 max-w-full" aria-busy="true">
      <Skeleton className="h-12 sm:h-14 md:h-[4.5rem] w-full rounded-xl" />
    </header>
  );
}

export function SlicedHeader() {
  const { player, loading } = usePlayerContext();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<PlayerSuggestion[]>([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const searchWrapRef = useRef<HTMLDivElement>(null);

  const navigateToHandle = useCallback(
    (raw: string) => {
      const handle = formatHandle(raw);
      setSearchQuery(handle);
      setSuggestionsOpen(false);
      router.push(`/crib/view?handle=${encodeURIComponent(handle)}`);
    },
    [router]
  );

  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 1) {
      setSuggestions([]);
      setLoadingSuggestions(false);
      return;
    }

    setLoadingSuggestions(true);
    const timer = setTimeout(() => {
      apiFetch<{ suggestions: PlayerSuggestion[] }>(
        `/api/players/search?q=${encodeURIComponent(q)}`
      )
        .then((data) => {
          setSuggestions(data.suggestions);
          setSuggestionsOpen(true);
        })
        .catch(() => setSuggestions([]))
        .finally(() => setLoadingSuggestions(false));
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (!searchWrapRef.current?.contains(e.target as Node)) {
        setSuggestionsOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    const raw = searchQuery.trim();
    if (!raw) return;
    setSearching(true);
    try {
      const handle = formatHandle(raw);
      await apiFetch<{ userId: string; username: string }>(
        `/api/players/by-handle/${encodeURIComponent(handle)}`
      );
      navigateToHandle(handle);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Player not found");
    } finally {
      setSearching(false);
    }
  }

  if (loading) return <HeaderSkeleton />;
  if (!player) return null;

  const avatar = player.displayAvatarUrl ?? "/images/chomper.jpg";
  const showDropdown =
    suggestionsOpen && searchQuery.trim().length > 0 && (loadingSuggestions || suggestions.length > 0);

  return (
    <header className="sliced-header sticky top-0 z-40 isolate w-full max-w-full mb-2 sm:mb-3 md:mb-3">
      <div className="relative w-full h-12 sm:h-14 md:h-[4.5rem] lg:h-[4.75rem]">
        <Image
          src={SLICING.navbar.bar}
          alt=""
          fill
          className="object-fill pointer-events-none select-none z-0"
          priority
          unoptimized
        />

        <div className="absolute inset-0 z-10 flex items-center gap-1.5 sm:gap-2 md:gap-3 px-2 sm:px-3 md:px-4 lg:px-5 min-w-0 pointer-events-none [&>*]:pointer-events-auto">
          <div className="relative z-20 shrink-0 h-[76%] md:h-[82%] w-[4.5rem] sm:w-[6.5rem] md:w-[8.5rem] lg:w-[9.5rem] min-w-0">
            <Image
              src={SLICING.logo}
              alt="ChomperZ Idle"
              fill
              className="object-contain object-left"
              priority
              unoptimized
            />
          </div>

          <form
            onSubmit={handleSearch}
            className="hidden md:flex relative z-20 flex-1 min-w-0 max-w-lg mx-1 lg:mx-3"
          >
            <div ref={searchWrapRef} className="relative w-full h-9 lg:h-10">
              <Image
                src={SLICING.navbar.searchBar}
                alt=""
                fill
                className="object-fill pointer-events-none"
                unoptimized
              />
              <div className="absolute inset-0 flex items-center px-3 lg:px-4 gap-2">
                <button
                  type="submit"
                  disabled={searching}
                  className="shrink-0 disabled:opacity-50"
                  aria-label="Search player"
                >
                  <Image
                    src={SLICING.navbar.searchIcon}
                    alt=""
                    width={18}
                    height={18}
                    className="w-4 h-4 lg:w-[18px] lg:h-[18px] opacity-80"
                    unoptimized
                  />
                </button>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSuggestionsOpen(true);
                  }}
                  onFocus={() => {
                    if (searchQuery.trim()) setSuggestionsOpen(true);
                  }}
                  placeholder="Search handle..."
                  disabled={searching}
                  autoComplete="off"
                  className="flex-1 min-w-0 bg-transparent text-xs lg:text-sm text-white font-bold placeholder:text-[#b8b0a4] outline-none"
                />
              </div>

              {showDropdown && (
                <ul
                  className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 max-h-56 overflow-auto rounded-lg border border-[#5c4030]/80 bg-[#2a2218]/95 shadow-lg backdrop-blur-sm py-1"
                  role="listbox"
                >
                  {loadingSuggestions && suggestions.length === 0 ? (
                    <li className="px-3 py-2 text-xs font-bold text-[#c4b5a0]">Searching...</li>
                  ) : (
                    suggestions.map((s) => (
                      <li key={s.userId} role="option">
                        <button
                          type="button"
                          onClick={() => navigateToHandle(s.username)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-white/10 transition-colors"
                        >
                          <div className="relative w-7 h-7 rounded overflow-hidden shrink-0 border border-[#4ade80]/30">
                            <UserAvatar
                              src={s.displayAvatarUrl || "/images/chomper.jpg"}
                              alt=""
                              size={28}
                            />
                          </div>
                          <span className="text-xs font-bold text-white truncate">
                            {formatHandle(s.username)}
                          </span>
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              )}
            </div>
          </form>

          <div className="flex-1 min-w-0 md:hidden" aria-hidden />

          <div className="relative z-20 flex items-center gap-1 sm:gap-1.5 md:gap-2 shrink-0 min-w-0">
            <SlicedCoinDisplay
              value={player.coins ?? 0}
              variant="coin"
              compact
              headerStyle
              className="md:!min-w-[5rem] md:!h-9 lg:!h-10 lg:!min-w-[5.5rem]"
            />
            <SlicedCoinDisplay
              value={player.zCoins}
              variant="zcoin"
              compact
              headerStyle
              className="md:!min-w-[5rem] md:!h-9 lg:!h-10 lg:!min-w-[5.5rem]"
            />

            <UserMenu
              twitterHandle={player.twitterHandle}
              profilePicUrl={avatar}
              headerSplit
              className="hidden md:flex shrink-0 min-w-0"
            />

            <UserMenu
              twitterHandle={player.twitterHandle}
              profilePicUrl={avatar}
              avatarOnly
              className="md:hidden shrink-0"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
