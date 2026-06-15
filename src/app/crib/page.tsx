"use client";

import { useCallback, useEffect, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { CoinIcon, HomeIcon } from "@/components/Icons";
import { apiFetch, formatCoins, type FurnitureItem } from "@/lib/api";

const GRID_COLS = 8;
const GRID_ROWS = 5;
const CELL = 48;

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
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [selectedPlaced, setSelectedPlaced] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

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
    if (previewMode) return;

    if (selectedShopId) {
      const item = getItem(selectedShopId);
      if (!item || !owned.includes(item.id)) return;
      if (x + item.w > GRID_COLS || y + item.h > GRID_ROWS) return;
      setLayout((prev) => [
        ...prev.filter((p) => p.itemId !== item.id),
        { itemId: item.id, x, y },
      ]);
      setSelectedPlaced(item.id);
      setSelectedShopId(null);
      return;
    }

    const hit = layout.find((p) => {
      const item = getItem(p.itemId);
      if (!item) return false;
      return x >= p.x && x < p.x + item.w && y >= p.y && y < p.y + item.h;
    });
    setSelectedPlaced(hit?.itemId ?? null);
  }

  async function handleBuy(itemId: string) {
    setMsg(null);
    try {
      const data = await apiFetch<{ zCoins: number; ownedFurniture: string[] }>(
        "/api/player/crib/buy",
        { method: "POST", body: JSON.stringify({ itemId }) }
      );
      setZCoins(data.zCoins);
      setOwned(data.ownedFurniture);
      setSelectedShopId(itemId);
      setMsg("Purchased! Click the grid to place it.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Purchase failed");
    }
  }

  async function handleSave() {
    setMsg(null);
    try {
      await apiFetch("/api/player/crib/layout", {
        method: "POST",
        body: JSON.stringify({ layout }),
      });
      setMsg("Layout saved!");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Save failed");
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="font-bold text-[var(--muted)]">Loading your crib...</p>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto p-6">
      <AppHeader
        title="CHOMPERZ CRIB"
        icon={<HomeIcon className="w-7 h-7 text-[var(--green)] shrink-0" />}
        zCoins={zCoins}
        backHref="/dashboard"
      />

      <div className="card mb-6">
        <div
          className="relative mx-auto rounded-2xl bg-[#1a221c] border-2 border-[#3a453d] overflow-hidden"
          style={{
            width: GRID_COLS * CELL,
            height: GRID_ROWS * CELL,
            maxWidth: "100%",
          }}
        >
          <div
            className="absolute inset-0 grid gap-0"
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
                  className="border border-white/5 hover:bg-white/5 transition-colors"
                  aria-label={`Cell ${x},${y}`}
                />
              );
            })}
          </div>

          {layout.map((entry) => {
            const item = getItem(entry.itemId);
            if (!item) return null;
            const isSelected = selectedPlaced === entry.itemId;
            return (
              <div
                key={entry.itemId}
                className="absolute flex items-center justify-center font-black text-xs rounded-lg border-2 border-dashed pointer-events-none"
                style={{
                  left: entry.x * CELL,
                  top: entry.y * CELL,
                  width: item.w * CELL - 4,
                  height: item.h * CELL - 4,
                  margin: 2,
                  backgroundColor: `${item.color}33`,
                  borderColor: isSelected ? "#fff" : item.color,
                  color: item.color,
                }}
              >
                {item.shortLabel}
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-3 mt-4 justify-between">
          <button onClick={handleSave} className="btn-primary px-6" disabled={previewMode}>
            Save Layout
          </button>
          <button
            onClick={() => setPreviewMode((p) => !p)}
            className="btn-secondary px-6"
          >
            {previewMode ? "Edit Mode" : "Preview Mode"}
          </button>
        </div>
        {msg && (
          <p className="text-sm font-bold text-center mt-3 text-[var(--green)]">{msg}</p>
        )}
      </div>

      <div className="card">
        <h3 className="stat-label mb-4 flex items-center gap-2">
          Furniture Shop
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {catalog.map((item) => {
            const isOwned = owned.includes(item.id);
            const isSelected = selectedShopId === item.id;
            return (
              <div
                key={item.id}
                className={`rounded-2xl p-4 bg-black/20 border-2 transition-colors ${
                  isSelected ? "border-[var(--gold)]" : "border-transparent"
                }`}
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center font-black text-lg mb-3 mx-auto"
                  style={{ backgroundColor: `${item.color}44`, color: item.color }}
                >
                  {item.shortLabel}
                </div>
                <p className="font-extrabold text-sm text-center mb-1">{item.name}</p>
                <p className="text-[var(--gold)] text-xs font-bold text-center mb-3 flex items-center justify-center gap-1">
                  <CoinIcon className="w-3.5 h-3.5" />
                  {item.price} Z-Coins
                </p>
                <button
                  onClick={() =>
                    isOwned ? setSelectedShopId(item.id) : handleBuy(item.id)
                  }
                  className={`w-full py-2 rounded-xl font-extrabold text-sm ${
                    isOwned
                      ? "btn-secondary"
                      : isSelected
                        ? "bg-[var(--gold)] text-black"
                        : "btn-secondary"
                  }`}
                >
                  {isOwned
                    ? `Place (${item.w}x${item.h})`
                    : `Buy (${item.w}x${item.h})`}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
