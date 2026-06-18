"use client";

import { useEffect, useState } from "react";
import { usePlayer } from "@/hooks/usePlayer";
import { apiFetch, type InventoryStack } from "@/lib/api";

export default function InventoryPage() {
  return <InventoryContent />;
}

function InventoryContent() {
  const { player, loading: playerLoading } = usePlayer();
  const [items, setItems] = useState<InventoryStack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<{ items: InventoryStack[] }>("/api/player/inventory")
      .then((data) => setItems(data.items))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [player?.id]);

  if (playerLoading || loading || !player) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton-wrap h-32" />
        ))}
      </div>
    );
  }

  return (
    <>
      <h2 className="text-lg md:text-xl font-bold mb-4">Inventory</h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
        {items.map((item) => (
          <div
            key={item.itemId}
            className="card flex flex-col items-center text-center gap-2"
          >
            <div className="w-14 h-14 md:w-16 md:h-16 bg-dark-card rounded-xl border border-gray-700 flex items-center justify-center">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                {item.shortLabel.slice(0, 2)}
              </span>
            </div>
            <p className="font-bold text-sm">{item.name}</p>
            <p className="text-[var(--green)] font-black text-lg">{item.quantity}</p>
          </div>
        ))}
      </div>

      {items.every((i) => i.quantity === 0) && (
        <p className="text-center text-sm text-[var(--muted)] font-bold mt-6">
          No items yet. Complete skill actions on the dashboard to gather resources.
        </p>
      )}
    </>
  );
}
