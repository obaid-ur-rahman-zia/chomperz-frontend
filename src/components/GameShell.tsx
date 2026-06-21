import { ReactNode } from "react";
import { GameNav } from "@/components/GameNav";
import { GameHeader } from "@/components/GameHeader";

export function GameShellInner({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen md:p-8 flex justify-center items-start">
      <div className="bg-panel w-full max-w-5xl md:rounded-2xl p-4 md:p-8 pb-24 lg:pb-8 md:shadow-2xl border border-black/60 md:border-gray-800/80 min-h-screen md:min-h-fit overflow-x-hidden">
        <GameHeader />
        <GameNav />
        {children}
      </div>
    </div>
  );
}

/** @deprecated Use route layout — kept for legacy skeleton imports */
export function GameShell({ children }: { children: ReactNode }) {
  return <GameShellInner>{children}</GameShellInner>;
}
