"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { SlicedActionButton } from "@/components/sliced";
import {
  SLICING,
  FURNITURE_IMAGES,
  getFurnitureImage,
  isFloorItemId,
} from "@/lib/slicing-paths";
import type { FurnitureItem } from "@/lib/api";

interface CribOwnedItemsPanelProps {
  ownedItems: FurnitureItem[];
  floorId: string | null;
  selectedPlaceId: string | null;
  previewMode: boolean;
  onItemTap: (itemId: string) => void;
  onSave: () => void;
}

function CribItemSlot({
  item,
  active,
  disabled,
  onClick,
  label,
}: {
  item: FurnitureItem;
  active: boolean;
  disabled: boolean;
  onClick: () => void;
  label?: string;
}) {
  const img = getFurnitureImage(item.id, 0) || FURNITURE_IMAGES[item.id];
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label ?? item.name}
      className={`relative shrink-0 w-full h-14 md:h-[3.75rem] max-md:w-[4.25rem] max-md:h-[4.25rem] transition-transform active:scale-95 ${
        active ? "ring-2 ring-[#facc15] z-[1]" : ""
      }`}
    >
      <Image src={SLICING.crib.assetsBg} alt="" fill className="object-fill" unoptimized />
      <div className="absolute inset-1.5 flex items-center justify-center">
        {img ? (
          <Image
            src={img}
            alt={item.name}
            width={40}
            height={40}
            className="object-contain max-h-full"
            unoptimized
          />
        ) : (
          <span className="text-[10px] font-black" style={{ color: item.color }}>
            {item.shortLabel}
          </span>
        )}
      </div>
    </button>
  );
}

export function CribOwnedItemsPanel({
  ownedItems,
  floorId,
  selectedPlaceId,
  previewMode,
  onItemTap,
  onSave,
}: CribOwnedItemsPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState({ top: 0, height: 40 });

  const updateThumb = useCallback(() => {
    const el = scrollRef.current;
    if (!el || el.scrollHeight <= el.clientHeight) {
      setThumb({ top: 0, height: 100 });
      return;
    }
    const ratio = el.clientHeight / el.scrollHeight;
    const height = Math.max(18, ratio * 100);
    const maxTop = 100 - height;
    const top = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * maxTop;
    setThumb({ top, height });
  }, []);

  useEffect(() => {
    updateThumb();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateThumb, { passive: true });
    window.addEventListener("resize", updateThumb);
    return () => {
      el.removeEventListener("scroll", updateThumb);
      window.removeEventListener("resize", updateThumb);
    };
  }, [ownedItems.length, updateThumb]);

  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el) return;
    e.preventDefault();
    el.scrollTop += e.deltaY;
  }, []);

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="relative h-7 md:h-8 mb-1 shrink-0">
        <Image src={SLICING.crib.header} alt="" fill className="object-fill" unoptimized />
        <p className="absolute inset-0 flex items-center justify-center text-[9px] md:text-[10px] font-black text-[#f5d76e] px-2 text-center leading-tight">
          Owned Items - Tap to Place
        </p>
      </div>

      {ownedItems.length === 0 ? (
        <p className="text-xs text-white/70 font-bold p-2 flex-1 text-center md:text-left">
          No items yet.{" "}
          <Link href="/shop" className="text-[#4ade80] no-underline">
            Visit Shop
          </Link>
        </p>
      ) : (
        <div className="flex flex-1 min-h-0 gap-1 mb-1 max-md:max-h-[5.5rem]">
          <div
            ref={scrollRef}
            onWheel={handleWheel}
            className="flex-1 flex flex-col gap-1.5 overflow-y-auto hide-scrollbar min-h-0 pr-0.5 max-md:flex-row max-md:overflow-x-auto max-md:overflow-y-hidden max-md:gap-2 max-md:py-0.5 max-md:items-stretch"
          >
            {ownedItems.map((item) => {
              const isFloor = isFloorItemId(item.id);
              const active = isFloor
                ? floorId === item.id
                : selectedPlaceId === item.id;
              return (
                <CribItemSlot
                  key={item.id}
                  item={item}
                  active={active}
                  disabled={previewMode}
                  onClick={() => onItemTap(item.id)}
                  label={isFloor ? `Apply ${item.name}` : item.name}
                />
              );
            })}
          </div>

          <div className="relative w-2.5 md:w-3 shrink-0 self-stretch min-h-[4rem] rounded-full bg-[#1a1008]/80 border border-[#3d2818] max-md:hidden">
            <div
              className="absolute left-0.5 right-0.5 rounded-full bg-white/85 shadow-sm"
              style={{
                top: `${thumb.top}%`,
                height: `${thumb.height}%`,
              }}
            />
          </div>
        </div>
      )}

      <SlicedActionButton
        src={SLICING.crib.buttons}
        onClick={onSave}
        disabled={previewMode}
        className="w-full h-9 md:h-10 mt-auto shrink-0"
      >
        Save layout
      </SlicedActionButton>
    </div>
  );
}
