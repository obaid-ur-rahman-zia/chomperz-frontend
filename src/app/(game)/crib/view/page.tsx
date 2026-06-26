"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SlicedPage, SlicedActionButton } from "@/components/sliced";
import { CribSkeleton } from "@/components/Loading";
import { apiFetch, type FurnitureItem } from "@/lib/api";
import { formatHandle } from "@/lib/handle";
import {
  SLICING,
  FLOOR_BACKGROUNDS,
  getFurnitureImage,
  isFloorItemId,
  isSideRotation,
  type FurnitureRotation,
} from "@/lib/slicing-paths";

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

interface PublicCribData {
  username: string;
  catalog: FurnitureItem[];
  layout: LayoutEntry[];
  floorId: string | null;
}

function getDims(item: FurnitureItem, rotation: number) {
  if (isSideRotation(rotation)) return { w: item.h, h: item.w };
  return { w: item.w, h: item.h };
}

function resolvePublicFloor(floorId: string | null): string {
  if (floorId && isFloorItemId(floorId)) {
    return FLOOR_BACKGROUNDS[floorId];
  }
  return DEFAULT_FLOOR;
}

function CribViewContent() {
  const searchParams = useSearchParams();
  const handleParam = searchParams.get("handle")?.trim() ?? "";
  const [data, setData] = useState<PublicCribData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!handleParam) {
      setError("No player handle specified");
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const handle = handleParam.startsWith("@") ? handleParam : `@${handleParam}`;
        const lookup = await apiFetch<{ userId: string; username: string }>(
          `/api/players/by-handle/${encodeURIComponent(handle)}`
        );
        const crib = await apiFetch<PublicCribData>(`/api/players/${lookup.userId}/crib`);
        if (!cancelled) {
          setData({ ...crib, username: crib.username || lookup.username });
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load crib");
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [handleParam]);

  if (loading) return <CribSkeleton />;

  if (error || !data) {
    return (
      <SlicedPage>
        <div className="text-center py-12">
          <p className="text-red-300 font-bold mb-4">{error ?? "Crib not found"}</p>
          <Link href="/crib" className="no-underline">
            <SlicedActionButton src={SLICING.mainMenu.button}>Back to My Crib</SlicedActionButton>
          </Link>
        </div>
      </SlicedPage>
    );
  }

  const catalog = data.catalog;
  const floorTexture = resolvePublicFloor(data.floorId);
  const displayHandle = formatHandle(data.username);

  return (
    <SlicedPage>
      <div className="flex flex-col gap-3 w-full max-w-4xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-2 shrink-0">
          <p className="text-sm md:text-base font-black text-[#f5d76e]">
            Viewing {displayHandle}&apos;s Crib
          </p>
          <Link href="/crib" className="no-underline shrink-0">
            <SlicedActionButton src={SLICING.mainMenu.button} className="h-8 min-w-[7rem]">
              My Crib
            </SlicedActionButton>
          </Link>
        </div>

        <div className="relative w-full aspect-[8/5] min-h-[14rem] max-h-[32rem] rounded-sm overflow-hidden border border-[#4ade80]/30">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("${floorTexture}")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {data.layout.map((entry) => {
              const item = catalog.find((c) => c.id === entry.itemId);
              if (!item || isFloorItemId(entry.itemId)) return null;
              const dims = getDims(item, entry.rotation);
              const img = getFurnitureImage(entry.itemId, entry.rotation);
              return (
                <div
                  key={entry.instanceId}
                  className="absolute z-[2] flex items-center justify-center p-0.5 pointer-events-none"
                  style={{
                    left: `${(entry.x / GRID_COLS) * 100}%`,
                    top: `${(entry.y / GRID_ROWS) * 100}%`,
                    width: `${(dims.w / GRID_COLS) * 100}%`,
                    height: `${(dims.h / GRID_ROWS) * 100}%`,
                  }}
                >
                  {img ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={img}
                        alt={item.name}
                        fill
                        className="object-contain drop-shadow-lg"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <span className="text-[10px] font-black" style={{ color: item.color }}>
                      {item.shortLabel}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </SlicedPage>
  );
}

export default function CribViewPage() {
  return (
    <Suspense fallback={<CribSkeleton />}>
      <CribViewContent />
    </Suspense>
  );
}
