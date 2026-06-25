"use client";

import { ReactNode, useCallback } from "react";
import { usePathname } from "next/navigation";
import { SlicedNavDesktop, SlicedNavMobile, SlicedHeader } from "@/components/sliced";
import { PullToRefresh } from "@/components/PullToRefresh";
import { usePlayerContext } from "@/context/PlayerContext";
import { PAGE_BACKGROUNDS } from "@/lib/slicing-paths";

export function GameShellInner({ children }: { children: ReactNode }) {
  const { refresh } = usePlayerContext();
  const pathname = usePathname();
  const background =
    PAGE_BACKGROUNDS[pathname] ?? PAGE_BACKGROUNDS["/dashboard"];

  const handleRefresh = useCallback(async () => {
    await refresh({ silent: true });
    window.dispatchEvent(new CustomEvent("chomperz:page-refresh"));
  }, [refresh]);

  return (
    <div
      className="sliced-game-shell flex justify-center items-start"
      style={{ backgroundImage: `url("${background}")` }}
    >
      <div className="sliced-game-inner w-full overflow-x-hidden">
        <SlicedHeader />
        <PullToRefresh onRefresh={handleRefresh}>
          <SlicedNavDesktop />
          {children}
        </PullToRefresh>
      </div>
      <SlicedNavMobile />
    </div>
  );
}

/** @deprecated Use route layout — kept for legacy skeleton imports */
export function GameShell({ children }: { children: ReactNode }) {
  return <GameShellInner>{children}</GameShellInner>;
}
