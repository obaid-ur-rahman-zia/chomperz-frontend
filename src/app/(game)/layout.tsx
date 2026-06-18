import { ReactNode } from "react";
import { GameShellInner } from "@/components/GameShell";
import { PlayerProvider } from "@/context/PlayerContext";

export default function GameLayout({ children }: { children: ReactNode }) {
  return (
    <PlayerProvider>
      <GameShellInner>{children}</GameShellInner>
    </PlayerProvider>
  );
}
