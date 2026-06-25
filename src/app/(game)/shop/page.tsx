"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  SlicedPage,
  SlicedSubTabs,
  SlicedActionButton,
} from "@/components/sliced";
import { SLICING, FURNITURE_IMAGES } from "@/lib/slicing-paths";
import { apiFetch, formatCoins, type FurnitureItem } from "@/lib/api";
import { toast } from "@/lib/toast";
import { ShopSkeleton } from "@/components/Loading";

const TIERS = [
  { id: "wooden", label: "Wood" },
  { id: "iron", label: "Iron" },
  { id: "fancy", label: "Fancy" },
  { id: "special", label: "Special" },
] as const;

function formatCost(item: FurnitureItem): string {
  const { cost } = item;
  if (cost.zCoins) return `${formatCoins(cost.zCoins)} Z Coins`;
  if (cost.coins) return `${formatCoins(cost.coins)} Coins`;
  const parts: string[] = [];
  if (cost.plank) parts.push(`${cost.plank} Planks`);
  if (cost.ingot) parts.push(`${cost.ingot} Bars`);
  if (cost.wood) parts.push(`${cost.wood} Wood`);
  if (cost.ore) parts.push(`${cost.ore} Ore`);
  return parts.join(" + ") || "Free";
}

function ShopItemCard({
  item,
  isOwned,
  onBuy,
}: {
  item: FurnitureItem;
  isOwned: boolean;
  onBuy: () => void;
}) {
  const img = FURNITURE_IMAGES[item.id];

  return (
    <div className="relative w-full">
      <Image
        src={SLICING.shop.woodenPanel}
        alt=""
        width={200}
        height={320}
        className="w-full h-auto pointer-events-none"
        unoptimized
      />
      <div className="absolute inset-0 flex flex-col p-3 md:p-4">
        <div className="relative mx-auto w-20 h-20 md:w-24 md:h-24 mb-2 shrink-0">
          <Image src={SLICING.shop.assetBg} alt="" fill className="object-fill" unoptimized />
          <div className="absolute inset-2 flex items-center justify-center">
            {img ? (
              <Image src={img} alt={item.name} width={64} height={64} className="object-contain max-h-full" unoptimized />
            ) : (
              <span className="font-black text-lg" style={{ color: item.color }}>
                {item.shortLabel}
              </span>
            )}
          </div>
        </div>
        <p className="text-white text-xs md:text-sm font-black text-center truncate">{item.name}</p>
        <div className="flex justify-center my-1.5">
          <div className="relative h-5 min-w-[2.5rem] px-2">
            <Image src={SLICING.shop.dimensionBar} alt="" fill className="object-fill" unoptimized />
            <span className="relative z-[1] flex items-center justify-center h-full text-[9px] font-black text-white">
              {item.w}x{item.h}
            </span>
          </div>
        </div>
        <p className="text-[#facc15] text-[10px] md:text-xs font-bold text-center flex items-center justify-center gap-1 mb-2">
          {item.cost.zCoins ? (
            <Image src={SLICING.mainMenu.zCoin} alt="" width={14} height={14} className="w-3.5 h-3.5" unoptimized />
          ) : (
            <Image src={SLICING.mainMenu.simpleCoin} alt="" width={14} height={14} className="w-3.5 h-3.5" unoptimized />
          )}
          {formatCost(item)}
        </p>
        <SlicedActionButton
          src={SLICING.shop.buyButton}
          onClick={onBuy}
          disabled={isOwned}
          className="w-full h-9 mt-auto"
        >
          {isOwned ? "Owned" : "Buy"}
        </SlicedActionButton>
      </div>
    </div>
  );
}

export default function ShopPage() {
  const [catalog, setCatalog] = useState<FurnitureItem[]>([]);
  const [owned, setOwned] = useState<string[]>([]);
  const [tier, setTier] = useState<string>("wooden");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const data = await apiFetch<{
      catalog: FurnitureItem[];
      ownedFurniture: string[];
    }>("/api/player/crib");
    setCatalog(data.catalog);
    setOwned(data.ownedFurniture);
    setLoading(false);
  }, []);

  useEffect(() => {
    load().catch(() => setLoading(false));
  }, [load]);

  async function handleBuy(itemId: string) {
    try {
      const data = await apiFetch<{ ownedFurniture: string[] }>("/api/player/crib/buy", {
        method: "POST",
        body: JSON.stringify({ itemId }),
      });
      setOwned(data.ownedFurniture);
      toast.success("Purchased! Place it in your crib.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Purchase failed");
    }
  }

  if (loading) return <ShopSkeleton />;

  const filtered =
    tier === "special"
      ? catalog.filter((i) => i.id === "fancy_statue")
      : catalog.filter((i) => i.tier === tier);

  return (
    <SlicedPage bg={SLICING.shop.bg}>
      <SlicedSubTabs tabs={[...TIERS]} active={tier} onChange={setTier} className="mb-4" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {filtered.map((item) => (
          <ShopItemCard
            key={item.id}
            item={item}
            isOwned={owned.includes(item.id)}
            onBuy={() => handleBuy(item.id)}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-sm text-white/70 font-bold py-8">No items in this category.</p>
      )}

      <p className="text-center mt-4">
        <Link href="/crib" className="text-[#4ade80] text-sm font-bold no-underline hover:underline">
          Go to My Crib →
        </Link>
      </p>
    </SlicedPage>
  );
}
