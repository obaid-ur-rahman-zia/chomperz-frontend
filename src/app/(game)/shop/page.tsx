"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CoinIcon, HomeIcon, ShopIcon } from "@/components/Icons";
import { apiFetch, formatCoins, type FurnitureItem } from "@/lib/api";
import { toast } from "@/lib/toast";
import { ShopSkeleton } from "@/components/Loading";

const TIER_LABELS: Record<string, string> = {
  wooden: "Wooden Items",
  iron: "Iron Items",
  fancy: "Fancy Items",
};

function CostLine({ item }: { item: FurnitureItem }) {
  const parts: string[] = [];
  const { cost } = item;
  if (cost.coins) parts.push(`${formatCoins(cost.coins)} Coins`);
  if (cost.zCoins) parts.push(`${formatCoins(cost.zCoins)} Z-Coins`);
  if (cost.plank) parts.push(`${cost.plank} Planks`);
  if (cost.ingot) parts.push(`${cost.ingot} Iron Bars`);
  if (cost.wood) parts.push(`${cost.wood} Wood`);
  if (cost.ore) parts.push(`${cost.ore} Ore`);

  return (
    <div className="flex flex-col gap-0.5">
      {parts.map((p) => (
        <p key={p} className="text-[var(--gold)] text-sm font-bold flex items-center gap-1">
          <CoinIcon className="w-3.5 h-3.5 shrink-0" />
          {p}
        </p>
      ))}
    </div>
  );
}

export default function ShopPage() {
  const [catalog, setCatalog] = useState<FurnitureItem[]>([]);
  const [owned, setOwned] = useState<string[]>([]);
  const [zCoins, setZCoins] = useState(0);
  const [coins, setCoins] = useState(0);
  const [inventory, setInventory] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const data = await apiFetch<{
      catalog: FurnitureItem[];
      ownedFurniture: string[];
      zCoins: number;
      coins: number;
      inventory: Record<string, number>;
    }>("/api/player/crib");
    setCatalog(data.catalog);
    setOwned(data.ownedFurniture);
    setZCoins(data.zCoins);
    setCoins(data.coins);
    setInventory(data.inventory ?? {});
    setLoading(false);
  }, []);

  useEffect(() => {
    load().catch(() => setLoading(false));
  }, [load]);

  async function handleBuy(itemId: string) {
    try {
      const data = await apiFetch<{
        zCoins: number;
        coins: number;
        inventory: Record<string, number>;
        ownedFurniture: string[];
      }>("/api/player/crib/buy", {
        method: "POST",
        body: JSON.stringify({ itemId }),
      });
      setZCoins(data.zCoins);
      setCoins(data.coins);
      setInventory(data.inventory ?? {});
      setOwned(data.ownedFurniture);
      toast.success("Purchased! Place it in your crib.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Purchase failed");
    }
  }

  if (loading) {
    return <ShopSkeleton />;
  }

  const tiers = ["wooden", "iron", "fancy"] as const;

  return (
    <>
      <h2 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2">
        <ShopIcon className="w-6 h-6 text-[var(--gold)] shrink-0" />
        Furniture Shop
      </h2>

      {tiers.map((tier) => {
        const items = catalog.filter((i) => i.tier === tier);
        if (items.length === 0) return null;
        return (
          <section key={tier} className="mb-8">
            <h3 className="stat-label mb-3">{TIER_LABELS[tier]}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {items.map((item) => {
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
                        <CostLine item={item} />
                        <p className="text-xs text-[var(--muted)] font-bold mt-1">
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
          </section>
        );
      })}

      <p className="text-xs text-[var(--muted)] font-bold mb-4">
        Balance: {formatCoins(coins)} Coins · {formatCoins(zCoins)} Z-Coins ·{" "}
        {inventory.plank ?? 0} Planks · {inventory.ingot ?? 0} Iron Bars
      </p>

      <Link href="/crib" className="btn-secondary flex items-center justify-center gap-2 mt-2 no-underline w-full">
        <HomeIcon className="w-4 h-4" />
        Go to My Crib
      </Link>
    </>
  );
}
