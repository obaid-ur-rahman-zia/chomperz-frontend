"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { SlicedPage, SlicedActionButton, SlicedImageButton } from "@/components/sliced";
import { CribOwnedItemsPanel } from "@/components/crib/CribOwnedItemsPanel";
import {
  SLICING,
  FLOOR_BACKGROUNDS,
  FLOOR_ITEM_IDS,
  isFloorItemId,
  getFurnitureImage,
  isSideRotation,
  normalizeRotation,
  type FurnitureRotation,
} from "@/lib/slicing-paths";
import { apiFetch, type FurnitureItem } from "@/lib/api";
import { toast } from "@/lib/toast";
import { CribSkeleton } from "@/components/Loading";

const DEFAULT_FLOOR = SLICING.assets.woodenFloor;
const GRID_COLS = 8;
const GRID_ROWS = 5;

interface LayoutEntry {
  instanceId: string;
  itemId: string;
  x: number;
  y: number;
  rotation: FurnitureRotation;
}

interface PendingPlacement {
  itemId: string;
  x: number;
  y: number;
  rotation: FurnitureRotation;
}

function resolveFloorTexture(floorId: string | null, owned: string[]): string {
  if (floorId && isFloorItemId(floorId) && owned.includes(floorId)) {
    return FLOOR_BACKGROUNDS[floorId];
  }
  const ownedFloor = FLOOR_ITEM_IDS.find((id) => owned.includes(id));
  if (ownedFloor) return FLOOR_BACKGROUNDS[ownedFloor];
  return DEFAULT_FLOOR;
}

function getDims(item: FurnitureItem, rotation: number) {
  if (isSideRotation(rotation)) return { w: item.h, h: item.w };
  return { w: item.w, h: item.h };
}

function entryDims(entry: LayoutEntry, catalog: FurnitureItem[]) {
  const item = catalog.find((c) => c.id === entry.itemId);
  if (!item) return { w: 1, h: 1 };
  return getDims(item, entry.rotation);
}

function rectsOverlap(
  ax: number,
  ay: number,
  aw: number,
  ah: number,
  bx: number,
  by: number,
  bw: number,
  bh: number
) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

function overlapsPlacement(
  ax: number,
  ay: number,
  aw: number,
  ah: number,
  layout: LayoutEntry[],
  catalog: FurnitureItem[],
  excludeInstanceId?: string
): boolean {
  for (const entry of layout) {
    if (excludeInstanceId && entry.instanceId === excludeInstanceId) continue;
    const { w, h } = entryDims(entry, catalog);
    if (rectsOverlap(ax, ay, aw, ah, entry.x, entry.y, w, h)) return true;
  }
  return false;
}

function isValidPlacement(
  item: FurnitureItem,
  x: number,
  y: number,
  rotation: number,
  layout: LayoutEntry[],
  catalog: FurnitureItem[],
  excludeInstanceId?: string
): boolean {
  const { w, h } = getDims(item, rotation);
  if (x + w > GRID_COLS || y + h > GRID_ROWS || x < 0 || y < 0) return false;
  return !overlapsPlacement(x, y, w, h, layout, catalog, excludeInstanceId);
}

function findEntryAtCell(layout: LayoutEntry[], catalog: FurnitureItem[], x: number, y: number) {
  return layout.find((entry) => {
    const { w, h } = entryDims(entry, catalog);
    return x >= entry.x && x < entry.x + w && y >= entry.y && y < entry.y + h;
  });
}

function newInstanceId() {
  return `inst-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function CribPage() {
  const [catalog, setCatalog] = useState<FurnitureItem[]>([]);
  const [owned, setOwned] = useState<string[]>([]);
  const [layout, setLayout] = useState<LayoutEntry[]>([]);
  const [floorId, setFloorId] = useState<string | null>(null);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingPlacement | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const data = await apiFetch<{
      catalog: FurnitureItem[];
      ownedFurniture: string[];
      layout: Array<{
        instanceId?: string;
        itemId: string;
        x: number;
        y: number;
        rotated?: boolean;
        rotation?: number;
      }>;
      floorId?: string | null;
    }>("/api/player/crib");
    setCatalog(data.catalog);
    setOwned(data.ownedFurniture);
    setLayout(
      data.layout
        .filter((e) => !isFloorItemId(e.itemId))
        .map((e, i) => ({
          instanceId: e.instanceId ?? `${e.itemId}-${e.x}-${e.y}-${i}`,
          itemId: e.itemId,
          x: e.x,
          y: e.y,
          rotation: normalizeRotation(e.rotation ?? e.rotated),
        }))
    );
    setFloorId(data.floorId ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    load().catch(() => setLoading(false));
  }, [load]);

  function getItem(id: string) {
    return catalog.find((c) => c.id === id);
  }

  function selectPlacedItem(entry: LayoutEntry) {
    if (previewMode) return;
    setSelectedInstanceId(entry.instanceId);
    setSelectedPlaceId(entry.itemId);
    setPending(null);
  }

  function handleOwnedItemTap(itemId: string) {
    if (previewMode) return;
    if (isFloorItemId(itemId)) {
      setFloorId(itemId);
      setSelectedPlaceId(null);
      setSelectedInstanceId(null);
      setPending(null);
      toast.success("Floor applied — tap Save layout");
      return;
    }
    setSelectedPlaceId(itemId);
    setSelectedInstanceId(null);
    setPending(null);
    toast.info("Tap the grid to place");
  }

  function handleCellClick(x: number, y: number) {
    if (previewMode) return;

    const hit = findEntryAtCell(layout, catalog, x, y);
    if (hit) {
      selectPlacedItem(hit);
      return;
    }

    if (!selectedPlaceId || isFloorItemId(selectedPlaceId)) return;
    const item = getItem(selectedPlaceId);
    if (!item) return;
    setSelectedInstanceId(null);
    setPending({ itemId: selectedPlaceId, x, y, rotation: 0 });
  }

  function confirmPlacement() {
    if (!pending) return;
    const item = getItem(pending.itemId);
    if (!item) return;
    if (
      !isValidPlacement(
        item,
        pending.x,
        pending.y,
        pending.rotation,
        layout,
        catalog
      )
    ) {
      toast.error("Invalid placement");
      return;
    }
    setLayout((prev) => [
      ...prev,
      {
        instanceId: newInstanceId(),
        itemId: pending.itemId,
        x: pending.x,
        y: pending.y,
        rotation: pending.rotation,
      },
    ]);
    setPending(null);
    setSelectedPlaceId(null);
    setSelectedInstanceId(null);
  }

  function cancelPlacement() {
    setPending(null);
  }

  function rotatePending() {
    if (!pending) return;
    const next = ((pending.rotation + 1) % 4) as FurnitureRotation;
    setPending({ ...pending, rotation: next });
  }

  async function handleSave() {
    try {
      await apiFetch("/api/player/crib/layout", {
        method: "POST",
        body: JSON.stringify({
          layout: layout.map((e) => ({
            ...e,
            rotated: isSideRotation(e.rotation),
          })),
          floorId: floorId && isFloorItemId(floorId) ? floorId : null,
        }),
      });
      toast.success("Layout saved!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    }
  }

  if (loading) return <CribSkeleton />;

  const ownedItems = catalog.filter((c) => owned.includes(c.id));
  const floorTexture = resolveFloorTexture(floorId, owned);
  const placingFurniture = Boolean(
    selectedPlaceId && !isFloorItemId(selectedPlaceId) && !pending
  );
  const pendingItem = pending ? getItem(pending.itemId) : null;
  const pendingDims = pendingItem ? getDims(pendingItem, pending?.rotation ?? 0) : null;
  const pendingValid = Boolean(
    pending &&
      pendingItem &&
      pendingDims &&
      isValidPlacement(
        pendingItem,
        pending.x,
        pending.y,
        pending.rotation,
        layout,
        catalog
      )
  );

  return (
    <SlicedPage>
      <div className="flex w-full gap-2 md:gap-3 items-stretch min-w-0">
        <div className="relative flex-1 min-w-0">
          <div
            className="absolute inset-0 overflow-visible rounded-sm"
            style={{
              backgroundImage: `url("${floorTexture}")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {!previewMode && (
              <div
                className={`absolute inset-0 grid z-[1] ${
                  placingFurniture || !pending
                    ? "opacity-20 pointer-events-auto"
                    : "opacity-0 pointer-events-none"
                }`}
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
                      className="border border-white/20"
                      aria-label={`Cell ${x},${y}`}
                    />
                  );
                })}
              </div>
            )}

            {layout.map((entry) => {
              const item = getItem(entry.itemId);
              if (!item || isFloorItemId(entry.itemId)) return null;
              const dims = getDims(item, entry.rotation);
              const img = getFurnitureImage(entry.itemId, entry.rotation);
              const isSelected = selectedInstanceId === entry.instanceId;
              return (
                <button
                  key={entry.instanceId}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    selectPlacedItem(entry);
                  }}
                  disabled={previewMode || Boolean(pending)}
                  className={`absolute z-[2] flex items-center justify-center p-0.5 transition-shadow ${
                    previewMode || pending ? "pointer-events-none" : "pointer-events-auto cursor-pointer"
                  } ${isSelected ? "ring-2 ring-[#facc15] ring-offset-1 ring-offset-transparent" : ""}`}
                  style={{
                    left: `${(entry.x / GRID_COLS) * 100}%`,
                    top: `${(entry.y / GRID_ROWS) * 100}%`,
                    width: `${(dims.w / GRID_COLS) * 100}%`,
                    height: `${(dims.h / GRID_ROWS) * 100}%`,
                  }}
                  aria-label={`Select ${item.name}`}
                >
                  {img ? (
                    <div className="relative w-full h-full pointer-events-none">
                      <Image
                        src={img}
                        alt={item.name}
                        fill
                        className="object-contain drop-shadow-lg"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <span
                      className="text-[10px] font-black pointer-events-none"
                      style={{ color: item.color }}
                    >
                      {item.shortLabel}
                    </span>
                  )}
                </button>
              );
            })}

            {pending && pendingItem && pendingDims && (
              <>
                <div
                  className="absolute z-[3] pointer-events-none"
                  style={{
                    left: `${(pending.x / GRID_COLS) * 100}%`,
                    top: `${(pending.y / GRID_ROWS) * 100}%`,
                    width: `${(pendingDims.w / GRID_COLS) * 100}%`,
                    height: `${(pendingDims.h / GRID_ROWS) * 100}%`,
                  }}
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={
                        pendingValid
                          ? SLICING.crib.correctPlacement
                          : SLICING.crib.wrongPlacement
                      }
                      alt=""
                      fill
                      className="object-fill opacity-85"
                      unoptimized
                    />
                    <div className="relative w-full h-full p-1">
                      <Image
                        src={getFurnitureImage(pending.itemId, pending.rotation)}
                        alt=""
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                  </div>
                </div>

                <div
                  className="absolute z-10"
                  style={{
                    left: `${((pending.x + pendingDims.w) / GRID_COLS) * 100}%`,
                    top: `${((pending.y + pendingDims.h * 0.45) / GRID_ROWS) * 100}%`,
                    transform: "translate(6px, -50%)",
                  }}
                >
                  <SlicedImageButton
                    src={SLICING.crib.rotate}
                    onClick={rotatePending}
                    label="Rotate"
                    width={36}
                    height={36}
                  />
                </div>

                <div
                  className="absolute flex gap-1.5 z-10"
                  style={{
                    left: `${((pending.x + pendingDims.w / 2) / GRID_COLS) * 100}%`,
                    top: `${((pending.y + pendingDims.h) / GRID_ROWS) * 100}%`,
                    transform: "translate(-50%, 8px)",
                  }}
                >
                  <SlicedImageButton
                    src={SLICING.crib.cross}
                    onClick={cancelPlacement}
                    label="Cancel"
                    width={32}
                    height={32}
                  />
                  <SlicedImageButton
                    src={SLICING.crib.tick}
                    onClick={confirmPlacement}
                    disabled={!pendingValid}
                    label="Confirm"
                    width={32}
                    height={32}
                  />
                </div>
              </>
            )}
          </div>

          <div className="absolute bottom-1 left-1 z-[5] w-[88%] max-w-[14rem] h-7 md:h-8 pointer-events-none">
            <Image
              src={SLICING.crib.bottomBar}
              alt=""
              fill
              className="object-fill"
              unoptimized
            />
            <div className="absolute inset-0 flex items-center gap-1.5 md:gap-2 px-2 text-[6px] md:text-[7px] font-bold text-white">
              <span className="flex items-center gap-0.5">
                <span className="w-2 h-2 md:w-2.5 md:h-2.5 bg-[#4ade80]/55 border border-[#4ade80]" />
                Place items
              </span>
              <span className="flex items-center gap-0.5">
                <span className="w-2 h-2 md:w-2.5 md:h-2.5 bg-red-500/55 border border-red-400" />
                Invalid Placement
              </span>
              <span className="flex items-center gap-0.5">
                <span className="w-2 h-2 md:w-2.5 md:h-2.5 bg-white/25 border border-white/50" />
                Empty Cell
              </span>
            </div>
          </div>
        </div>

        <div
          className="relative shrink-0 flex flex-col"
          style={{ width: SLICING.cribInsets.ownedWidth }}
        >
          <div className="relative w-full">
            <Image
              src={SLICING.crib.mainPanel}
              alt=""
              width={300}
              height={400}
              className="w-full h-auto pointer-events-none select-none"
              unoptimized
            />
            <div
              className="absolute inset-0 flex flex-col min-h-0"
              style={{ padding: SLICING.cribInsets.ownedContent }}
            >
              <CribOwnedItemsPanel
                ownedItems={ownedItems}
                floorId={floorId}
                selectedPlaceId={selectedPlaceId}
                previewMode={previewMode}
                onItemTap={handleOwnedItemTap}
                onSave={handleSave}
              />
            </div>
          </div>

          <div className="flex gap-1.5 shrink-0 pt-1.5 justify-stretch">
            <SlicedActionButton
              src={SLICING.shop.unselectedButton}
              onClick={() => {
                setPreviewMode(false);
                setPending(null);
                setSelectedInstanceId(null);
              }}
              className="flex-1 h-8 md:h-9 text-[10px] md:text-xs"
            >
              Modify Crib
            </SlicedActionButton>
            <SlicedActionButton
              src={SLICING.shop.unselectedButton}
              onClick={() => {
                setPreviewMode((p) => !p);
                setPending(null);
                setSelectedPlaceId(null);
                setSelectedInstanceId(null);
              }}
              className="flex-1 h-8 md:h-9 text-[10px] md:text-xs"
            >
              {previewMode ? "Edit" : "Preview"}
            </SlicedActionButton>
          </div>
        </div>
      </div>
    </SlicedPage>
  );
}
