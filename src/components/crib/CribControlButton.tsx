"use client";

import Image from "next/image";
import { CheckIcon, CrossIcon, RotateIcon } from "@/components/Icons";

type CribControlVariant = "cross" | "tick" | "rotate";

const ICONS: Record<CribControlVariant, typeof CrossIcon> = {
  cross: CrossIcon,
  tick: CheckIcon,
  rotate: RotateIcon,
};

const ICON_CLASS: Record<CribControlVariant, string> = {
  cross: "w-[14px] h-[14px] md:w-4 md:h-4 text-white",
  tick: "w-[14px] h-[14px] md:w-4 md:h-4 text-white",
  rotate: "w-[15px] h-[15px] md:w-[17px] md:h-[17px] text-[#3d2818]",
};

interface CribControlButtonProps {
  bgSrc: string;
  variant: CribControlVariant;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  size?: number;
}

export function CribControlButton({
  bgSrc,
  variant,
  label,
  onClick,
  disabled,
  size = 36,
}: CribControlButtonProps) {
  const Icon = ICONS[variant];

  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={label}
      onClick={onClick}
      className="relative inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-transform active:scale-95 shadow-md"
      style={{ width: size, height: size, minWidth: size, minHeight: size }}
    >
      <Image
        src={bgSrc}
        alt=""
        width={size}
        height={size}
        className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none"
        unoptimized
      />
      <Icon
        className={`relative z-[1] shrink-0 drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)] ${ICON_CLASS[variant]}`}
      />
    </button>
  );
}
