"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CoinIcon, HomeIcon, ShopIcon } from "@/components/Icons";
import { apiFetch, formatCoins, type FurnitureItem } from "@/lib/api";
import { toast } from "@/lib/toast";
import { ShopSkeleton } from "@/components/Loading";

export default function ShopPage() {
  const [catalog, setCatalog] = useState<FurnitureItem[]>([]);
  const [owned, setOwned] = useState<string[]>([]);
  const [zCoins, setZCoins] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const data = await apiFetch<{
      catalog: FurnitureItem[];
      ownedFurniture: string[];
      zCoins: number;
    }>("/api/player/crib");
    setCatalog(data.catalog);
    setOwned(data.ownedFurniture);
    setZCoins(data.zCoins);
    setLoading(false);
  }, []);

  useEffect(() => {
    load().catch(() => setLoading(false));
  }, [load]);

  async function handleBuy(itemId: string) {
    try {
      const data = await apiFetch<{ zCoins: number; ownedFurniture: string[] }>(
        "/api/player/crib/buy",
        { method: "POST", body: JSON.stringify({ itemId }) }
      );
      setZCoins(data.zCoins);
      setOwned(data.ownedFurniture);
      toast.success("Purchased! Place it in your crib.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Purchase failed");
    }
  }

  if (loading) {
    return <ShopSkeleton />;
  }

  return (
    <>
      <h2 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2">
        <ShopIcon className="w-6 h-6 text-[var(--gold)] shrink-0" />
        Furniture Shop
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {catalog.map((item) => {
          const isOwned = owned.includes(item.id);
          return (
            <div key={item.id} className="card flex flex-col">
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center font-black text-lg shrink-0"
                  style={{ backgroundColor: `${item.color}44`, color: item.color }}
                >
                  {item.shortLabel}
                </div>
                <div className="min-w-0">
                  <p className="font-extrabold truncate">{item.name}</p>
                  <p className="text-[var(--gold)] text-sm font-bold flex items-center gap-1">
                    <CoinIcon className="w-3.5 h-3.5" />
                    {formatCoins(item.price)} Z-Coins
                  </p>
                  <p className="text-xs text-[var(--muted)] font-bold">
                    Size {item.w}×{item.h}
                  </p>
                </div>
              </div>
              <button
                onClick={() => !isOwned && handleBuy(item.id)}
                disabled={isOwned}
                className={`w-full mt-auto ${isOwned ? "btn-secondary opacity-60" : "btn-primary"}`}
              >
                <ShopIcon className="w-4 h-4" />
                {isOwned ? "Owned" : "Buy"}
              </button>
            </div>
          );
        })}
      </div>

      <Link href="/crib" className="btn-secondary flex items-center justify-center gap-2 mt-6 no-underline w-full">
        <HomeIcon className="w-4 h-4" />
        Go to My Crib
      </Link>
    </>
  );
}
