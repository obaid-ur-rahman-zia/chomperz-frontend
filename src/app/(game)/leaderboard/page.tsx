"use client";

import { useEffect, useState } from "react";
import { UserAvatar } from "@/components/UserAvatar";
import { usePlayer } from "@/hooks/usePlayer";
import { apiFetch, formatCoins, type LeaderboardEntry } from "@/lib/api";

const BOARDS = [
  { id: "zCoins", label: "Z-Coins" },
  { id: "coins", label: "Coins" },
  { id: "power", label: "Power" },
  { id: "nfts", label: "NFTs" },
] as const;

type BoardId = (typeof BOARDS)[number]["id"];

function formatValue(board: BoardId, value: number) {
  if (board === "zCoins" || board === "coins") return formatCoins(value);
  if (board === "power") return `Lvl ${value}`;
  return String(value);
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

  if (playerLoading || !player) {
    return <p className="text-sm text-[var(--muted)]">Loading...</p>;
  }

  return (
    <>
      <h2 className="text-lg md:text-xl font-bold mb-4">Leaderboard</h2>

      <div className="flex flex-wrap gap-2 mb-4">
        {BOARDS.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => setBoard(b.id)}
            className={`btn-nav text-xs md:text-sm py-2 px-3 ${
              board === b.id ? "ring-2 ring-white/25" : "opacity-80"
            }`}
          >
            {b.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-[var(--muted)] font-bold">Loading rankings...</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-[var(--muted)] font-bold">No rankings yet.</p>
      ) : (
        <div className="card divide-y divide-gray-700/50 p-0 overflow-hidden">
          {rows.map((row) => {
            const isMe = row.userId === String(player.id);
            return (
              <div
                key={row.userId}
                className={`flex items-center gap-3 px-4 py-3 ${isMe ? "bg-[var(--green)]/10" : ""}`}
              >
                <span className="font-black text-[var(--muted)] w-8 text-sm">#{row.rank}</span>
                <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-gray-700 shrink-0">
                  <UserAvatar
                    src={row.profilePicUrl || "/images/chomper.jpg"}
                    alt={row.username}
                  />
                </div>
                <span className="font-bold text-sm flex-1 truncate">
                  {row.username.startsWith("@") ? row.username : `@${row.username}`}
                </span>
                <span className="font-black text-sm text-[var(--gold)] shrink-0">
                  {formatValue(board, row.value)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
