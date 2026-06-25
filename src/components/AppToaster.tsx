"use client";

import { Toaster } from "sonner";
import Image from "next/image";
import { SLICING } from "@/lib/slicing-paths";

export function AppToaster() {
  return (
    <Toaster
      theme="dark"
      position="top-center"
      closeButton
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "relative flex items-center gap-2 w-full max-w-sm px-4 py-3 rounded-xl border-2 border-[#6b4a2e] shadow-[0_4px_12px_rgba(0,0,0,0.45)] overflow-hidden font-bold text-white",
          title: "font-black text-sm text-[#f5d76e]",
          description: "font-bold text-xs text-[#d4c4a8]",
          closeButton:
            "!absolute !top-2 !right-2 !left-auto !bg-[#4a3520] !border-[#6b4a2e] !text-[#f5d76e]",
          success: "!bg-[#2d4a28] !border-[#4ade80]",
          error: "!bg-[#4a2020] !border-[#f87171]",
          info: "!bg-[#3d2818] !border-[#c9a227]",
        },
      }}
      icons={{
        success: (
          <Image
            src={SLICING.crib.tick}
            alt=""
            width={20}
            height={20}
            className="shrink-0"
            unoptimized
          />
        ),
        error: (
          <Image
            src={SLICING.crib.cross}
            alt=""
            width={20}
            height={20}
            className="shrink-0"
            unoptimized
          />
        ),
        info: (
          <Image
            src={SLICING.crib.rotate}
            alt=""
            width={20}
            height={20}
            className="shrink-0"
            unoptimized
          />
        ),
      }}
    />
  );
}
