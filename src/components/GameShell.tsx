import { ReactNode } from "react";
import { GameNav } from "@/components/GameNav";

export function GameShell({ children }: { children: ReactNode }) {
  return (
    <div className="page-shell">
      <GameNav />
      {children}
    </div>
  );
}
