import { ReactNode } from "react";
import { MobileNav } from "@/components/MobileNav";

export function GameShell({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="page-shell">{children}</div>
      <MobileNav />
    </>
  );
}
