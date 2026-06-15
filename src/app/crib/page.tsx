"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { GameShell } from "@/components/GameShell";
import { AppHeader } from "@/components/AppHeader";
import { CoinIcon, EditIcon, EyeIcon, HomeIcon, SaveIcon, ShopIcon } from "@/components/Icons";
import { apiFetch, type FurnitureItem } from "@/lib/api";
import { toast } from "@/lib/toast";
import { CribSkeleton } from "@/components/Loading";

const GRID_COLS = 8;
const GRID_ROWS = 5;

interface LayoutEntry {
  itemId: string;
  x: number;
  y: number;
}

export default function CribPage() {
  const [catalog, setCatalog] = useState<FurnitureItem[]>([]);
  const [owned, setOwned] = useState<string[]>([]);
  const [layout, setLayout] = useState<LayoutEntry[]>([]);
  const [zCoins, setZCoins] = useState(0);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const data = await apiFetch<{
      catalog: FurnitureItem[];
      ownedFurniture: string[];
      layout: LayoutEntry[];
      zCoins: number;
    }>("/api/player/crib");
    setCatalog(data.catalog);
    setOwned(data.ownedFurniture);
    setLayout(data.layout);
    setZCoins(data.zCoins);
    setLoading(false);
  }, []);

  useEffect(() => {
    load().catch(() => setLoading(false));
  }, [load]);

  function getItem(id: string) {
    return catalog.find((c) => c.id === id);
  }

  function handleCellClick(x: number, y: number) {
    if (previewMode || !selectedPlaceId) return;
    const item = getItem(selectedPlaceId);
    if (!item) return;
    if (x + item.w > GRID_COLS || y + item.h > GRID_ROWS) return;
    setLayout((prev) => [
      ...prev.filter((p) => p.itemId !== item.id),
      { itemId: item.id, x, y },
    ]);
    setSelectedPlaceId(null);
  }

  async function handleSave() {
    try {
      await apiFetch("/api/player/crib/layout", {
        method: "POST",
        body: JSON.stringify({ layout }),
      });
      toast.success("Layout saved!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    }
  }

  if (loading) {
    return <CribSkeleton />;
  }

  const ownedItems = catalog.filter((c) => owned.includes(c.id));

  return (
    <GameShell>
      <AppHeader
        title="MY CRIB"
        icon={<HomeIcon className="w-6 h-6 text-[var(--green)] shrink-0" />}
        zCoins={zCoins}
        backHref="/dashboard"
      />

      <div className="card mb-4">
        <div className="w-full max-w-md mx-auto aspect-[8/5] relative rounded-2xl bg-[#1a221c] border-2 border-[#3a453d] overflow-hidden">
          <div
            className="absolute inset-0 grid"
            style={{
              gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
              gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`,
            }}
          >
            {Array.from({ length: GRID_COLS * GRID_ROWS }, (_, i) => {
              const x = i % GRID_COLS;
              const y = Math.floor(i / GRID_COLS);
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleCellClick(x, y)}
                  className="border border-white/5 hover:bg-white/5"
                  aria-label={`Cell ${x},${y}`}
                />
              );
            })}
          </div>
          {layout.map((entry) => {
            const item = getItem(entry.itemId);
            if (!item) return null;
            return (
              <div
                key={entry.itemId}
                className="absolute flex items-center justify-center font-black text-[10px] sm:text-xs rounded-lg border-2 border-dashed pointer-events-none"
                style={{
                  left: `${(entry.x / GRID_COLS) * 100}%`,
                  top: `${(entry.y / GRID_ROWS) * 100}%`,
                  width: `${(item.w / GRID_COLS) * 100}%`,
                  height: `${(item.h / GRID_ROWS) * 100}%`,
                  backgroundColor: `${item.color}33`,
                  borderColor: item.color,
                  color: item.color,
                }}
              >
                {item.shortLabel}
              </div>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 mt-4">
          <button
            onClick={handleSave}
            disabled={previewMode}
            className="btn-primary flex-1 disabled:opacity-50"
          >
            <SaveIcon className="w-4 h-4" />
            Save Layout
          </button>
          <button
            onClick={() => setPreviewMode((p) => !p)}
            className="btn-secondary flex-1"
          >
            {previewMode ? (
              <>
                <EditIcon className="w-4 h-4" />
                Edit Mode
              </>
            ) : (
              <>
                <EyeIcon className="w-4 h-4" />
                Preview
              </>
            )}
          </button>
        </div>
      </div>

      <div className="card">
        <p className="stat-label mb-3">Place Owned Items</p>
        {ownedItems.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-[var(--muted)] font-bold mb-4">
              No furniture yet. Visit the shop to buy items.
            </p>
            <Link href="/shop" className="btn-secondary inline-flex no-underline">
              <ShopIcon className="w-4 h-4" />
              Furniture Shop
            </Link>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {ownedItems.map((item) => (
              <button
                key={item.id}
                onClick={() => !previewMode && setSelectedPlaceId(item.id)}
                className={`px-3 py-2 rounded-xl font-extrabold text-xs border-2 transition-colors ${
                  selectedPlaceId === item.id
                    ? "border-white bg-white/10"
                    : "border-transparent bg-black/20"
                }`}
                style={{ color: item.color }}
              >
                {item.name} ({item.w}x{item.h})
              </button>
            ))}
          </div>
        )}
        {selectedPlaceId && !previewMode && (
          <p className="text-xs text-[var(--muted)] font-bold mt-3 text-center">
            Tap a cell on the grid to place selected item
          </p>
        )}
      </div>
    </GameShell>
  );
}
