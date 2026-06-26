"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { SlicedPage, SlicedSubTabs } from "@/components/sliced";
import { SLICING, FURNITURE_IMAGES } from "@/lib/slicing-paths";
import { apiFetch, formatCoins, type FurnitureCost, type FurnitureItem } from "@/lib/api";
import { toast } from "@/lib/toast";
import { ShopSkeleton } from "@/components/Loading";

const TIERS = [
  { id: "wooden", label: "Wood" },
  { id: "iron", label: "Iron" },
  { id: "fancy", label: "Fancy" },
  { id: "special", label: "Special" },
] as const;

type CostLine = { icon: string; label: string };

function getCostLines(cost: FurnitureCost): CostLine[] {
  const lines: CostLine[] = [];
  if (cost.coins) {
    lines.push({
      icon: SLICING.mainMenu.simpleCoin,
      label: `${formatCoins(cost.coins)} Coins`,
    });
  }
  if (cost.zCoins) {
    lines.push({
      icon: SLICING.mainMenu.zCoin,
      label: `${formatCoins(cost.zCoins)} Z Coins`,
    });
  }
  if (cost.wood) {
    lines.push({ icon: SLICING.assets.woodLog, label: `${cost.wood} Wood` });
  }
  if (cost.plank) {
    lines.push({ icon: SLICING.assets.plank, label: `${cost.plank} Planks` });
  }
  if (cost.ore) {
    lines.push({ icon: SLICING.assets.ore, label: `${cost.ore} Ore` });
  }
  if (cost.ingot) {
    lines.push({ icon: SLICING.assets.ironBar, label: `${cost.ingot} Bars` });
  }
  return lines;
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
  const costLines = getCostLines(item.cost);

  return (
    <article className="relative w-full">
      <div className="relative w-full aspect-[5/8]">
        <Image
          src={SLICING.shop.woodenPanel}
          alt=""
          fill
          className="object-fill pointer-events-none select-none"
          sizes="(max-width: 768px) 45vw, 11rem"
          unoptimized
        />

        <div className="absolute inset-0 flex flex-col items-center text-center px-[8%] pt-[6%] pb-[4%]">
          <div className="relative w-[72%] aspect-square shrink-0">
            <Image
              src={SLICING.shop.assetBg}
              alt=""
              fill
              className="object-fill"
              unoptimized
            />
            <div className="absolute inset-[11%] flex items-center justify-center">
              {img ? (
                <Image
                  src={img}
                  alt={item.name}
                  width={96}
                  height={96}
                  className="w-full h-full object-contain drop-shadow-md"
                  unoptimized
                />
              ) : (
                <span className="font-black text-xl" style={{ color: item.color }}>
                  {item.shortLabel}
                </span>
              )}
            </div>
          </div>

          <h3 className="mt-1 w-full truncate text-[#f5d76e] text-[11px] sm:text-xs font-black leading-tight drop-shadow-sm">
            {item.name}
          </h3>

          <div className="relative mt-1 h-5 min-w-[3rem] px-2.5 shrink-0">
            <Image
              src={SLICING.shop.dimensionBar}
              alt=""
              fill
              className="object-fill"
              unoptimized
            />
            <span className="relative z-[1] flex h-full items-center justify-center text-[10px] font-black text-white tabular-nums">
              {item.w}x{item.h}
            </span>
          </div>

          <div className="mt-1 flex w-full flex-col items-center justify-start gap-0.5 shrink-0">
            {costLines.length === 0 ? (
              <p className="text-[#f5d76e] text-xs font-bold">Free</p>
            ) : (
              costLines.map((line) => (
                <p
                  key={line.label}
                  className="flex items-center justify-center gap-1.5 text-[#f5d76e] text-[11px] sm:text-xs font-bold leading-none"
                >
                  <Image
                    src={line.icon}
                    alt=""
                    width={18}
                    height={18}
                    className="w-[18px] h-[18px] shrink-0 object-contain"
                    unoptimized
                  />
                  <span>{line.label}</span>
                </p>
              ))
            )}
          </div>

          <button
            type="button"
            onClick={onBuy}
            disabled={isOwned}
            className="relative mt-1.5 w-full h-9 sm:h-10 shrink-0 disabled:opacity-55 disabled:cursor-not-allowed transition-transform active:scale-[0.98] active:disabled:scale-100"
          >
            <Image
              src={SLICING.shop.buyButton}
              alt=""
              fill
              className="object-fill pointer-events-none"
              unoptimized
            />
            <span className="relative z-[1] flex h-full items-center justify-center text-sm font-black text-[#1f1408] tracking-wide">
              {isOwned ? "Owned" : "Buy"}
            </span>
          </button>
        </div>
      </div>
    </article>
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

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-2.5 lg:gap-3 w-full">
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

      {/* <p className="text-center mt-4">
        <Link href="/crib" className="text-[#4ade80] text-sm font-bold no-underline hover:underline">
          Go to My Crib →
        </Link>
      </p> */}
    </SlicedPage>
  );
}
