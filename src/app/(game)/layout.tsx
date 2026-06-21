import { ReactNode } from "react";
import { GameShellInner } from "@/components/GameShell";
import { SyncSessionCookie } from "@/components/SyncSessionCookie";
import { PlayerProvider } from "@/context/PlayerContext";

export default function GameLayout({ children }: { children: ReactNode }) {
  return (
    <PlayerProvider>
      <SyncSessionCookie />
      <GameShellInner>{children}</GameShellInner>
    </PlayerProvider>
  );
}
