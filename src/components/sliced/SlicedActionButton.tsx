"use client";

import { ReactNode, ButtonHTMLAttributes } from "react";
import Image from "next/image";

interface SlicedActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  src: string;
  children: ReactNode;
  className?: string;
  height?: number;
}

export function SlicedActionButton({
  src,
  children,
  className = "",
  height = 40,
  disabled,
  ...props
}: SlicedActionButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={`relative inline-flex items-center justify-center min-w-[5rem] disabled:opacity-50 disabled:cursor-not-allowed transition-transform active:scale-95 ${className}`}
      {...props}
    >
      <Image
        src={src}
        alt=""
        width={200}
        height={height}
        className="absolute inset-0 w-full h-full object-fill pointer-events-none"
        unoptimized
      />
      <span className="relative z-[1] px-3 py-1.5 text-xs md:text-sm font-black text-white sliced-btn-text whitespace-nowrap">
        {children}
      </span>
    </button>
  );
}

interface SlicedImageButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  src: string;
  label?: string;
  className?: string;
  width?: number;
  height?: number;
}

export function SlicedImageButton({
  src,
  label,
  className = "",
  width = 120,
  height = 44,
  disabled,
  ...props
}: SlicedImageButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={`relative inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-transform active:scale-95 ${className}`}
      style={{ width, height }}
      {...props}
    >
      <Image src={src} alt={label ?? ""} fill className="object-fill pointer-events-none" unoptimized />
      {label ? (
        <span className="relative z-[1] text-[10px] md:text-xs font-black text-white sliced-btn-text">
          {label}
        </span>
      ) : null}
    </button>
  );
}
