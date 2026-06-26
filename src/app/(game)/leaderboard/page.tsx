"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { UserAvatar } from "@/components/UserAvatar";
import { LeaderboardRowsSkeleton, LeaderboardSkeleton } from "@/components/Loading";
import { usePlayer } from "@/hooks/usePlayer";
import { apiFetch, formatCoins, type LeaderboardEntry } from "@/lib/api";
import {
  SlicedPage,
  SlicedLeaderboardTabs,
  SlicedPanel,
} from "@/components/sliced";
import { SLICING } from "@/lib/slicing-paths";
import { formatHandle } from "@/lib/handle";

const BOARDS = [
  { id: "zCoins", label: "Tycoon Z Coin" },
  { id: "coins", label: "Grinder" },
  { id: "nfts", label: "Patron NFT" },
] as const;

type BoardId = (typeof BOARDS)[number]["id"];

const FALLBACK_AVATAR = "/images/chomper.jpg";

function formatValue(board: BoardId, value: number) {
  if (board === "zCoins") return `${formatCoins(value)} Z`;
  if (board === "coins") return `${formatCoins(value)} S`;
  return String(value);
}

function scoreColor(rank: number, isMe: boolean): string {
  if (isMe) return "text-red-400";
  if (rank <= 3) return "text-[#4ade80]";
  if (rank <= 5) return "text-[#facc15]";
  return "text-[#facc15]";
}

function rowAvatar(row: LeaderboardEntry): string {
  return row.displayAvatarUrl || row.profilePicUrl || FALLBACK_AVATAR;
}

export default function LeaderboardPage() {
  return <LeaderboardContent />;
}

function LeaderboardContent() {
  const { player, loading: playerLoading } = usePlayer();
  const [board, setBoard] = useState<BoardId>("zCoins");
  const [rows, setRows] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiFetch<{ rows: LeaderboardEntry[] }>(`/api/leaderboard?board=${board}`)
      .then((data) => setRows(data.rows))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [board]);

  if (playerLoading || !player) return <LeaderboardSkeleton />;

  const playerId = String(player.id);
  const myRow = rows.find((r) => r.userId === playerId);
  const topRows = rows.slice(0, 10);

  return (
    <SlicedPage>
      <SlicedPanel
        src={SLICING.mainMenu.statEarningPanel}
        padding={SLICING.leaderboardInsets.panel}
        className="w-full max-w-3xl mx-auto min-h-[28rem] md:min-h-[32rem]"
      >
        <div className="flex flex-col h-full min-h-0">
          <h2 className="sliced-title text-center text-base md:text-lg text-[#f5d76e] font-black mb-2 shrink-0">
            Leaderboard
          </h2>

          <SlicedLeaderboardTabs
            tabs={[...BOARDS]}
            active={board}
            onChange={(id) => setBoard(id as BoardId)}
            className="mb-3 shrink-0"
          />

          {loading ? (
            <LeaderboardRowsSkeleton />
          ) : (
            <div className="flex-1 overflow-auto hide-scrollbar space-y-1 min-h-0">
              {topRows.map((row) => {
                const isMe = row.userId === playerId;
                return (
                  <div key={row.userId} className="relative h-10 md:h-11 shrink-0">
                    <Image
                      src={isMe ? SLICING.leaderboard.ownRowPanel : SLICING.leaderboard.rowPanel}
                      alt=""
                      fill
                      className="object-fill"
                      unoptimized
                    />
                    <div className="absolute inset-0 flex items-center gap-2 px-3 text-xs md:text-sm font-bold text-white">
                      <span
                        className={`w-8 tabular-nums ${isMe ? "text-red-300" : "text-[#c4b5a0]"}`}
                      >
                        #{row.rank}
                      </span>
                      <div
                        className={`relative w-7 h-7 rounded overflow-hidden shrink-0 border ${
                          isMe ? "border-red-400/50" : "border-[#4ade80]/40"
                        }`}
                      >
                        <UserAvatar src={rowAvatar(row)} alt="" />
                      </div>
                      <span className={`flex-1 truncate ${isMe ? "text-red-200" : ""}`}>
                        {formatHandle(row.username)}
                      </span>
                      <span className={`tabular-nums ${scoreColor(row.rank, isMe)}`}>
                        {formatValue(board, row.value)}
                      </span>
                    </div>
                  </div>
                );
              })}
              {rows.length === 0 && (
                <p className="text-center text-sm text-white/60 font-bold py-6">
                  No rankings yet.
                </p>
              )}
            </div>
          )}

          {myRow && (
            <div className="relative h-11 md:h-12 mt-2 shrink-0 border-t border-[#4ade80]/20 pt-2">
              <p className="text-[9px] font-black text-[#c4b5a0] uppercase mb-1 px-1">Your rank</p>
              <div className="relative h-10 md:h-11">
              <Image
                src={SLICING.leaderboard.ownRowPanel}
                alt=""
                fill
                className="object-fill"
                unoptimized
              />
              <div className="absolute inset-0 flex items-center gap-2 px-3 text-xs md:text-sm font-bold text-white">
                <span className="w-8 tabular-nums text-red-300">#{myRow.rank}</span>
                <div className="relative w-7 h-7 rounded overflow-hidden shrink-0 border border-red-400/50">
                  <UserAvatar src={rowAvatar(myRow)} alt="" />
                </div>
                <span className="flex-1 truncate text-red-200">{formatHandle(myRow.username)}</span>
                <span className={`tabular-nums ${scoreColor(myRow.rank, true)}`}>
                  {formatValue(board, myRow.value)}
                </span>
              </div>
              </div>
            </div>
          )}
        </div>
      </SlicedPanel>
    </SlicedPage>
  );
}
