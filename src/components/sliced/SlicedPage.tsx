"use client";

import { ReactNode } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { PAGE_BACKGROUNDS } from "@/lib/slicing-paths";

interface SlicedPageProps {
  children: ReactNode;
  bg?: string;
  className?: string;
}

export function SlicedPage({ children, bg, className = "" }: SlicedPageProps) {
  const pathname = usePathname();
  const background = bg ?? PAGE_BACKGROUNDS[pathname] ?? PAGE_BACKGROUNDS["/dashboard"];

  return (
    <div
      className={`sliced-page relative min-h-[50vh] ${className}`}
      style={{ backgroundImage: `url("${background}")` }}
    >
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}
