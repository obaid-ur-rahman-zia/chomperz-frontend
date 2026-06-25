"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  SlicedPage,
  SlicedActionButton,
  SlicedImageButton,
} from "@/components/sliced";
import { SLICING, FURNITURE_IMAGES } from "@/lib/slicing-paths";
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

interface PendingPlacement {
  itemId: string;
  x: number;
  y: number;
  rotated: boolean;
}

function getDims(item: FurnitureItem, rotated: boolean) {
  return rotated ? { w: item.h, h: item.w } : { w: item.w, h: item.h };
}

function overlaps(
  ax: number,
  ay: number,
  aw: number,
  ah: number,
  layout: LayoutEntry[],
  catalog: FurnitureItem[],
  excludeId?: string
): boolean {
  for (const entry of layout) {
    if (excludeId && entry.itemId === excludeId) continue;
    const item = catalog.find((c) => c.id === entry.itemId);
    if (!item) continue;
    const overlap =
      ax < entry.x + item.w &&
      ax + aw > entry.x &&
      ay < entry.y + item.h &&
      ay + ah > entry.y;
    if (overlap) return true;
  }
  return false;
}

function isValidPlacement(
  item: FurnitureItem,
  x: number,
  y: number,
  rotated: boolean,
  layout: LayoutEntry[],
  catalog: FurnitureItem[],
  excludeId?: string
): boolean {
  const { w, h } = getDims(item, rotated);
  if (x + w > GRID_COLS || y + h > GRID_ROWS || x < 0 || y < 0) return false;
  return !overlaps(x, y, w, h, layout, catalog, excludeId);
}

export default function CribPage() {
  const [catalog, setCatalog] = useState<FurnitureItem[]>([]);
  const [owned, setOwned] = useState<string[]>([]);
  const [layout, setLayout] = useState<LayoutEntry[]>([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingPlacement | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const data = await apiFetch<{
      catalog: FurnitureItem[];
      ownedFurniture: string[];
      layout: LayoutEntry[];
    }>("/api/player/crib");
    setCatalog(data.catalog);
    setOwned(data.ownedFurniture);
    setLayout(data.layout);
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
    setPending({ itemId: selectedPlaceId, x, y, rotated: false });
  }

  function confirmPlacement() {
    if (!pending) return;
    const item = getItem(pending.itemId);
    if (!item) return;
    const { w, h } = getDims(item, pending.rotated);
    if (!isValidPlacement(item, pending.x, pending.y, pending.rotated, layout, catalog, pending.itemId)) {
      toast.error("Invalid placement");
      return;
    }
    setLayout((prev) => [
      ...prev.filter((p) => p.itemId !== pending.itemId),
      { itemId: pending.itemId, x: pending.x, y: pending.y },
    ]);
    setPending(null);
    setSelectedPlaceId(null);
  }

  function cancelPlacement() {
    setPending(null);
  }

  function rotatePending() {
    if (!pending) return;
    setPending({ ...pending, rotated: !pending.rotated });
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

  if (loading) return <CribSkeleton />;

  const ownedItems = catalog.filter((c) => owned.includes(c.id));
  const pendingItem = pending ? getItem(pending.itemId) : null;
  const pendingValid = Boolean(
    pending &&
      pendingItem &&
      isValidPlacement(
        pendingItem,
        pending.x,
        pending.y,
        pending.rotated,
        layout,
        catalog,
        pending.itemId
      )
  );

  return (
    <SlicedPage bg={SLICING.mainMenu.bg}>
      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-3 md:gap-4">
        {/* Grid area */}
        <div className="relative">
          <Image
            src={SLICING.crib.mainPanel}
            alt=""
            width={600}
            height={400}
            className="w-full h-auto pointer-events-none"
            unoptimized
          />
          <div className="absolute inset-[8%]">
            <div
              className="relative w-full h-full rounded overflow-hidden"
              style={{
                backgroundImage: `url("${SLICING.assets.woodenFloor}")`,
                backgroundSize: "cover",
              }}
            >
              <div
                className="absolute inset-0 grid opacity-30"
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
                      className="border border-white/10"
                      aria-label={`Cell ${x},${y}`}
                      disabled={previewMode}
                    />
                  );
                })}
              </div>

              {layout.map((entry) => {
                const item = getItem(entry.itemId);
                if (!item || (pending && pending.itemId === entry.itemId)) return null;
                const img = FURNITURE_IMAGES[entry.itemId];
                return (
                  <div
                    key={entry.itemId}
                    className="absolute pointer-events-none flex items-center justify-center p-0.5"
                    style={{
                      left: `${(entry.x / GRID_COLS) * 100}%`,
                      top: `${(entry.y / GRID_ROWS) * 100}%`,
                      width: `${(item.w / GRID_COLS) * 100}%`,
                      height: `${(item.h / GRID_ROWS) * 100}%`,
                    }}
                  >
                    {img ? (
                      <Image src={img} alt={item.name} fill className="object-contain drop-shadow-lg" unoptimized />
                    ) : (
                      <span className="text-[10px] font-black" style={{ color: item.color }}>
                        {item.shortLabel}
                      </span>
                    )}
                  </div>
                );
              })}

              {pending && pendingItem && (
                <>
                  <div
                    className="absolute pointer-events-none"
                    style={{
                      left: `${(pending.x / GRID_COLS) * 100}%`,
                      top: `${(pending.y / GRID_ROWS) * 100}%`,
                      width: `${(getDims(pendingItem, pending.rotated).w / GRID_COLS) * 100}%`,
                      height: `${(getDims(pendingItem, pending.rotated).h / GRID_ROWS) * 100}%`,
                    }}
                  >
                    <Image
                      src={pendingValid ? SLICING.crib.correctPlacement : SLICING.crib.wrongPlacement}
                      alt=""
                      fill
                      className="object-fill opacity-80"
                      unoptimized
                    />
                    {FURNITURE_IMAGES[pending.itemId] && (
                      <Image
                        src={FURNITURE_IMAGES[pending.itemId]}
                        alt=""
                        fill
                        className="object-contain p-1"
                        unoptimized
                      />
                    )}
                  </div>
                  <div
                    className="absolute flex gap-1 z-10"
                    style={{
                      left: `${((pending.x + getDims(pendingItem, pending.rotated).w / 2) / GRID_COLS) * 100}%`,
                      top: `${((pending.y + getDims(pendingItem, pending.rotated).h) / GRID_ROWS) * 100}%`,
                      transform: "translate(-50%, 4px)",
                    }}
                  >
                    <SlicedImageButton src={SLICING.crib.cross} onClick={cancelPlacement} width={28} height={28} />
                    <SlicedImageButton
                      src={SLICING.crib.tick}
                      onClick={confirmPlacement}
                      disabled={!pendingValid}
                      width={28}
                      height={28}
                    />
                    <SlicedImageButton src={SLICING.crib.rotate} onClick={rotatePending} width={28} height={28} />
                  </div>
                </>
              )}

              <div className="absolute bottom-1 left-1 flex items-center gap-2 bg-black/70 rounded px-2 py-1 text-[8px] font-bold text-white">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-[#4ade80]/50 border border-[#4ade80]" /> Place items
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-red-500/50 border border-red-400" /> Invalid
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-white/20 border border-white/40" /> Empty
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Owned items panel */}
        <div className="relative">
          <Image
            src={SLICING.crib.innerPanel}
            alt=""
            width={300}
            height={400}
            className="w-full h-auto pointer-events-none"
            unoptimized
          />
          <div className="absolute inset-0 flex flex-col p-3 md:p-4">
            <div className="relative h-8 mb-2 shrink-0">
              <Image src={SLICING.crib.header} alt="" fill className="object-fill" unoptimized />
              <p className="absolute inset-0 flex items-center justify-center text-[10px] md:text-xs font-black text-[#f5d76e]">
                Owned Items - Tap to Place
              </p>
            </div>

            <div className="flex gap-2 overflow-x-auto hide-scrollbar flex-1 mb-3">
              {ownedItems.length === 0 ? (
                <p className="text-xs text-white/70 font-bold p-2">
                  No items yet.{" "}
                  <Link href="/shop" className="text-[#4ade80] no-underline">
                    Visit Shop
                  </Link>
                </p>
              ) : (
                ownedItems.map((item) => {
                  const img = FURNITURE_IMAGES[item.id];
                  const active = selectedPlaceId === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => !previewMode && setSelectedPlaceId(item.id)}
                      disabled={previewMode}
                      className={`relative shrink-0 w-14 h-14 md:w-16 md:h-16 transition-transform active:scale-95 ${
                        active ? "ring-2 ring-[#facc15]" : ""
                      }`}
                    >
                      <Image src={SLICING.crib.assetsBg} alt="" fill className="object-fill" unoptimized />
                      <div className="absolute inset-1.5 flex items-center justify-center">
                        {img ? (
                          <Image src={img} alt={item.name} width={40} height={40} className="object-contain" unoptimized />
                        ) : (
                          <span className="text-[10px] font-black" style={{ color: item.color }}>
                            {item.shortLabel}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            <SlicedActionButton
              src={SLICING.crib.buttons}
              onClick={handleSave}
              disabled={previewMode}
              className="w-full h-10 mb-2"
            >
              Save layout
            </SlicedActionButton>

            <div className="flex gap-2">
              <SlicedActionButton
                src={SLICING.shop.unselectedButton}
                onClick={() => {
                  setPreviewMode(false);
                  setPending(null);
                }}
                className="flex-1 h-9"
              >
                Modify Crib
              </SlicedActionButton>
              <SlicedActionButton
                src={SLICING.shop.unselectedButton}
                onClick={() => {
                  setPreviewMode((p) => !p);
                  setPending(null);
                  setSelectedPlaceId(null);
                }}
                className="flex-1 h-9"
              >
                {previewMode ? "Edit" : "Preview"}
              </SlicedActionButton>
            </div>
          </div>
        </div>
      </div>
    </SlicedPage>
  );
}
