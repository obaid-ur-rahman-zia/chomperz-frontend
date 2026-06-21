"use client";

import { useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { toast } from "@/lib/toast";
import { Spinner } from "@/components/Loading";

export default function AdminGrantPage() {
  const [secret, setSecret] = useState("");
  const [handle, setHandle] = useState("");
  const [coins, setCoins] = useState("100");
  const [zCoins, setZCoins] = useState("100");
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setLastResult(null);
    try {
      const res = await apiFetch<{
        success: boolean;
        handle: string;
        granted: { coins: number; zCoins: number };
        balances: { coins: number | null; zCoins: number | null };
      }>("/api/admin/grant", {
        method: "POST",
        body: JSON.stringify({
          secret,
          handle,
          coins: Number(coins) || 0,
          zCoins: Number(zCoins) || 0,
        }),
      });
      const msg = `Granted to ${res.handle}: +${res.granted.coins} coins, +${res.granted.zCoins} Z-Coins`;
      setLastResult(msg);
      toast.success(msg);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Grant failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-[#0f1411]">
      <div className="card w-full max-w-md space-y-4">
        <div>
          <h1 className="text-xl font-black text-[var(--green)]">Admin Grant</h1>
          <p className="text-xs text-[var(--muted)] font-bold mt-1">
            Secret URL — grant coins / Z-Coins to any Twitter handle.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block">
            <span className="text-xs font-bold text-gray-400">Admin secret</span>
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              required
              className="mt-1 w-full bg-black/30 border-2 border-[#3a453d] rounded-xl px-4 py-2.5 font-bold text-white outline-none focus:border-[var(--gold)]"
            />
          </label>

          <label className="block">
            <span className="text-xs font-bold text-gray-400">Twitter handle</span>
            <input
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="@username"
              required
              className="mt-1 w-full bg-black/30 border-2 border-[#3a453d] rounded-xl px-4 py-2.5 font-bold text-white outline-none focus:border-[var(--gold)]"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-bold text-gray-400">Coins</span>
              <input
                type="number"
                min={0}
                step={1}
                value={coins}
                onChange={(e) => setCoins(e.target.value)}
                className="mt-1 w-full bg-black/30 border-2 border-[#3a453d] rounded-xl px-4 py-2.5 font-bold text-white outline-none focus:border-[var(--gold)]"
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold text-gray-400">Z-Coins</span>
              <input
                type="number"
                min={0}
                step={1}
                value={zCoins}
                onChange={(e) => setZCoins(e.target.value)}
                className="mt-1 w-full bg-black/30 border-2 border-[#3a453d] rounded-xl px-4 py-2.5 font-bold text-white outline-none focus:border-[var(--gold)]"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 disabled:opacity-50"
          >
            {loading ? <Spinner size="sm" /> : "Grant"}
          </button>
        </form>

        {lastResult && (
          <p className="text-sm font-bold text-[var(--green)] bg-black/25 rounded-xl p-3 border border-[var(--green)]/30">
            {lastResult}
          </p>
        )}

        <Link href="/dashboard" className="block text-center text-xs text-[var(--muted)] font-bold hover:text-white">
          Back to game
        </Link>
      </div>
    </main>
  );
}
