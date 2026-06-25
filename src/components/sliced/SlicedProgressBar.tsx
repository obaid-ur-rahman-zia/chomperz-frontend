"use client";

import Image from "next/image";
import { SLICING } from "@/lib/slicing-paths";

interface SlicedProgressBarProps {
  progress: number;
  label?: string;
  rightLabel?: string;
  className?: string;
}

export function SlicedProgressBar({
  progress,
  label,
  rightLabel,
  className = "",
}: SlicedProgressBarProps) {
  const pct = Math.min(100, Math.max(0, progress));

  return (
    <div className={`relative w-full ${className}`}>
      {label || rightLabel ? (
        <div className="flex justify-between items-center text-[10px] md:text-xs font-bold text-white mb-1 px-1">
          <span>{label}</span>
          <span>{rightLabel}</span>
        </div>
      ) : null}
      <div className="relative w-full h-6 md:h-7">
        <Image
          src={SLICING.mainMenu.emptyBar}
          alt=""
          fill
          className="object-fill"
          unoptimized
        />
        <div
          className="absolute inset-y-0 left-0 overflow-hidden"
          style={{ width: `${pct}%` }}
        >
          <div className="relative h-full w-full min-w-[2rem]">
            <Image
              src={SLICING.mainMenu.fillBar}
              alt=""
              fill
              className="object-cover object-left"
              unoptimized
            />
          </div>
        </div>
      </div>
    </div>
  );
}
