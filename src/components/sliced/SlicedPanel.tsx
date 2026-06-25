"use client";

import { ReactNode, CSSProperties } from "react";
import Image from "next/image";

interface SlicedPanelProps {
  src: string;
  children: ReactNode;
  className?: string;
  /** Only if title is NOT baked into the panel art */
  title?: string;
  padding?: string;
}

export function SlicedPanel({
  src,
  children,
  className = "",
  title,
  padding = "10% 8% 8% 8%",
}: SlicedPanelProps) {
  return (
    <div className={`w-full min-w-0 h-full ${className}`}>
      <div className="grid w-full h-full [&>*]:col-start-1 [&>*]:row-start-1">
        <Image
          src={src}
          alt=""
          width={600}
          height={400}
          className="col-start-1 row-start-1 w-full h-full object-fill pointer-events-none select-none"
          priority
          unoptimized
        />
        <div
          className="col-start-1 row-start-1 flex flex-col overflow-hidden min-h-0 min-w-0 h-full"
          style={{ padding } as CSSProperties}
        >
          {title ? (
            <h3 className="sliced-title text-center text-xs md:text-sm font-black text-[#f5d76e] mb-1 shrink-0 leading-tight">
              {title}
            </h3>
          ) : null}
          <div className="flex-1 min-h-0 min-w-0 overflow-hidden flex flex-col">{children}</div>
        </div>
      </div>
    </div>
  );
}
