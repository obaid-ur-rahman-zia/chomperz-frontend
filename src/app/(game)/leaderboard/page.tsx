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
} from "@/components/sliced";
import { SLICING } from "@/lib/slicing-paths";

const BOARDS = [
  { id: "zCoins", label: "Tycoon Z Coin" },
  { id: "coins", label: "Grinder" },
  { id: "nfts", label: "Patron NFT" },
] as const;

type BoardId = (typeof BOARDS)[number]["id"];

function formatValue(board: BoardId, value: number) {
  if (board === "zCoins") return `${formatCoins(value)} Z`;
  if (board === "coins") return `${formatCoins(value)} S`;
  return String(value);
}

function scoreColor(rank: number, isMe: boolean): string {
  if (isMe) return "text-red-400";
  if (rank <= 3) return "text-[#4ade80]";
  return "text-[#facc15]";
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

  const myRow = rows.find((r) => r.userId === String(player.id));
  const listRows = rows.filter((r) => r.userId !== String(player.id)).slice(0, 10);

  return (
    <SlicedPage bg={SLICING.leaderboard.bg}>
      <div className="relative w-full max-w-2xl mx-auto">
        <Image
          src={SLICING.leaderboard.woodenPanel}
          alt=""
          width={600}
          height={500}
          className="w-full h-auto pointer-events-none"
          unoptimized
        />
        <div className="absolute inset-0 flex flex-col p-4 md:p-6">
          <h2 className="sliced-title text-center text-lg md:text-xl text-[#f5d76e] font-black mb-3">
            Leaderboard
          </h2>

          <SlicedLeaderboardTabs
            tabs={[...BOARDS]}
            active={board}
            onChange={(id) => setBoard(id as BoardId)}
            className="mb-4"
          />

          {loading ? (
            <LeaderboardRowsSkeleton />
          ) : (
            <div className="flex-1 overflow-auto hide-scrollbar space-y-1">
              {listRows.map((row) => (
                <div key={row.userId} className="relative h-10 md:h-11">
                  <Image src={SLICING.leaderboard.rowPanel} alt="" fill className="object-fill" unoptimized />
                  <div className="absolute inset-0 flex items-center gap-2 px-3 text-xs md:text-sm font-bold text-white">
                    <span className="w-8 text-[#c4b5a0]">#{row.rank}</span>
                    <div className="relative w-7 h-7 rounded overflow-hidden shrink-0">
                      <UserAvatar src={row.profilePicUrl || "/images/chomper.jpg"} alt="" />
                    </div>
                    <span className="flex-1 truncate">@{row.username}</span>
                    <span className={scoreColor(row.rank, false)}>{formatValue(board, row.value)}</span>
                  </div>
                </div>
              ))}
              {rows.length === 0 && (
                <p className="text-center text-sm text-white/60 font-bold py-6">No rankings yet.</p>
              )}
            </div>
          )}

          {myRow && (
            <div className="relative h-11 md:h-12 mt-2 shrink-0">
              <Image src={SLICING.leaderboard.ownRowPanel} alt="" fill className="object-fill" unoptimized />
              <div className="absolute inset-0 flex items-center gap-2 px-3 text-xs md:text-sm font-bold text-white">
                <span className="w-8">#{myRow.rank}</span>
                <div className="relative w-7 h-7 rounded overflow-hidden shrink-0">
                  <UserAvatar src={myRow.profilePicUrl || "/images/chomper.jpg"} alt="" />
                </div>
                <span className="flex-1 truncate">@{myRow.username}</span>
                <span className={scoreColor(myRow.rank, true)}>{formatValue(board, myRow.value)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </SlicedPage>
  );
}
