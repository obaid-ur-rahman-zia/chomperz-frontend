"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePlayer } from "@/hooks/usePlayer";
import { apiFetch } from "@/lib/api";
import {
  SlicedPage,
  SlicedActionButton,
} from "@/components/sliced";
import { SLICING, INVENTORY_CARDS, RESOURCE_ICONS } from "@/lib/slicing-paths";
import { InventorySkeleton } from "@/components/Loading";

function qtyColor(qty: number): string {
  if (qty === 0) return "text-red-400";
  if (qty < 20) return "text-[#facc15]";
  return "text-[#4ade80]";
}

export default function InventoryPage() {
  return <InventoryContent />;
}

function InventoryContent() {
  const { player, loading: playerLoading } = usePlayer();
  const router = useRouter();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<{ items: { itemId: string; quantity: number }[] }>("/api/player/inventory")
      .then((data) => {
        const map: Record<string, number> = {};
        for (const item of data.items) map[item.itemId] = item.quantity;
        setQuantities(map);
      })
      .catch(() => setQuantities({}))
      .finally(() => setLoading(false));
  }, [player?.id]);

  async function handleAction(skill: string) {
    try {
      await apiFetch("/api/player/skills/select", {
        method: "POST",
        body: JSON.stringify({ skill }),
      });
      router.push("/dashboard");
    } catch {
      router.push("/skills");
    }
  }

  if (playerLoading || loading || !player) return <InventorySkeleton />;

  return (
    <SlicedPage bg={SLICING.inventory.bg}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        {INVENTORY_CARDS.map((card) => {
          const qty = quantities[card.itemId] ?? 0;
          const icon = RESOURCE_ICONS[card.itemId];

          return (
            <div key={card.itemId} className="relative w-full">
              <Image
                src={SLICING.inventory.woodenPanel}
                alt=""
                width={400}
                height={280}
                className="w-full h-auto pointer-events-none"
                unoptimized
              />
              <div className="absolute inset-0 flex flex-col p-3 md:p-4">
                <p className="sliced-title text-center text-[#f5d76e] text-xs font-black mb-2">
                  {card.title}
                </p>
                <div className="flex gap-3 flex-1">
                  <div className="relative w-20 md:w-24 shrink-0">
                    <Image src={SLICING.inventory.assetBg} alt="" fill className="object-fill" unoptimized />
                    <div className="absolute inset-2 flex items-center justify-center">
                      <Image src={icon} alt="" width={48} height={48} className="object-contain" unoptimized />
                    </div>
                  </div>
                  <div
                    className="flex-1 flex flex-col justify-center"
                    style={{
                      backgroundImage: `url("${SLICING.inventory.innerPanel}")`,
                      backgroundSize: "100% 100%",
                    }}
                  >
                    <div className="p-2">
                      <p className={`text-2xl md:text-3xl font-black tabular-nums ${qtyColor(qty)}`}>
                        {qty}
                      </p>
                      <p className="text-white text-sm font-black">{card.subtitle}</p>
                      <p className="text-[10px] text-[#c4b5a0] font-bold">{card.source}</p>
                    </div>
                  </div>
                </div>
                <SlicedActionButton
                  src={SLICING.inventory.button}
                  onClick={() => handleAction(card.skill)}
                  className="w-full h-9 mt-2"
                >
                  {card.action}
                </SlicedActionButton>
              </div>
            </div>
          );
        })}
      </div>
    </SlicedPage>
  );
}
