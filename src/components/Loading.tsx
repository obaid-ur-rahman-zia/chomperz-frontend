"use client";

import Image from "next/image";
import { SlicedPanel } from "@/components/sliced";
import { SLICING } from "@/lib/slicing-paths";

type SpinnerSize = "sm" | "md" | "lg";

const spinnerSizes: Record<SpinnerSize, string> = {
  sm: "w-4 h-4 border-2",
  md: "w-8 h-8 border-2",
  lg: "w-12 h-12 border-[3px]",
};

export function Spinner({
  size = "md",
  className = "",
}: {
  size?: SpinnerSize;
  className?: string;
}) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-block shrink-0 rounded-full border-[#3a453d] border-t-[var(--green)] animate-spin ${spinnerSizes[size]} ${className}`}
    />
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} aria-hidden />;
}

export function LoadingScreen({ label = "Loading your Chomper..." }: { label?: string }) {
  return (
    <main
      className="loading-screen login-page flex min-h-screen items-center justify-center p-4 sm:p-6"
      style={{ backgroundImage: `url("${SLICING.mainMenu.bg}")` }}
      aria-busy="true"
      aria-live="polite"
    >
      <div className="w-full max-w-xs sm:max-w-sm">
        <SlicedPanel
          src={SLICING.mainMenu.characterPanel}
          padding="16% 12% 12% 12%"
          fit="content"
          className="w-full"
        >
          <div className="flex flex-col items-center text-center gap-4 py-1">
            <div className="relative w-full max-w-[13rem] h-14 sm:h-16 shrink-0">
              <Image
                src={SLICING.logo}
                alt="ChomperZ Idle"
                fill
                className="object-contain object-center drop-shadow-lg"
                priority
                unoptimized
              />
            </div>

            <Spinner size="lg" />

            <div className="space-y-1">
              <p className="sliced-title text-sm sm:text-base font-black text-[#f5d76e] leading-tight">
                {label}
              </p>
            </div>
          </div>
        </SlicedPanel>
      </div>
    </main>
  );
}

export function DashboardSkeletonInner() {
  return (
    <div className="grid lg:grid-cols-2 gap-1.5 md:gap-2">
      <div className="skeleton-wrap">
        <Skeleton className="w-full h-36 md:h-40 rounded-xl" />
      </div>
      <div className="skeleton-wrap space-y-2">
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-8 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-8 w-full rounded-lg" />
      </div>
      <div className="skeleton-wrap space-y-2">
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-7 w-full rounded-lg" />
      </div>
      <div className="skeleton-wrap space-y-2">
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return <DashboardSkeletonInner />;
}

export function ProfileSkeleton() {
  return (
    <>
      <div className="skeleton-wrap mb-4">
        <Skeleton className="aspect-[5/3] md:aspect-[2.4/1] w-full rounded-xl" />
      </div>
      <div className="grid grid-cols-2 gap-2 md:gap-3 mb-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[4.5rem] w-full rounded-xl" />
        ))}
      </div>
      <div className="skeleton-wrap mb-4 space-y-3">
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
      <div className="skeleton-wrap mb-4 space-y-3">
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
      <div className="skeleton-wrap space-y-3">
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    </>
  );
}

export function MapSkeleton() {
  return (
    <>
      <Skeleton className="h-8 w-40 mb-4" />
      <div className="grid lg:grid-cols-[1.2fr_1fr] gap-4 lg:gap-6">
        <div className="skeleton-wrap">
          <Skeleton className="h-3 w-28 mb-3" />
          <div className="grid grid-cols-10 gap-1.5">
            {Array.from({ length: 100 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-md" />
            ))}
          </div>
        </div>
        <div className="skeleton-wrap space-y-4">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
        </div>
      </div>
    </>
  );
}

export function ShopSkeleton() {
  return (
    <div className="skeleton-wrap space-y-4" aria-busy="true">
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-20 rounded-lg" />
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-2.5 w-full">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[5/8] w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export function SkillsSkeleton() {
  return (
    <div className="skeleton-wrap space-y-4" aria-busy="true">
      <div className="flex gap-2 justify-center">
        <Skeleton className="h-9 w-24 rounded-lg" />
        <Skeleton className="h-9 w-24 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-56 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export function CribSkeleton() {
  return (
    <>
      <Skeleton className="h-8 w-32 mb-4" />
      <div className="skeleton-wrap mb-4">
        <Skeleton className="w-full max-w-md mx-auto aspect-[8/5] rounded-2xl" />
        <div className="flex gap-2 mt-4">
          <Skeleton className="h-12 flex-1 rounded-xl" />
          <Skeleton className="h-12 flex-1 rounded-xl" />
        </div>
      </div>
      <div className="skeleton-wrap">
        <Skeleton className="h-9 w-28 rounded-xl" />
      </div>
    </>
  );
}

export function InventorySkeleton() {
  return (
    <>
      <Skeleton className="h-8 w-36 mb-4" />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton-wrap">
            <Skeleton className="w-14 h-14 mx-auto mb-2 rounded-xl" />
            <Skeleton className="h-4 w-16 mx-auto mb-1" />
            <Skeleton className="h-6 w-8 mx-auto" />
          </div>
        ))}
      </div>
    </>
  );
}

export function LeaderboardRowsSkeleton() {
  return (
    <div className="skeleton-wrap space-y-3" aria-busy="true">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full rounded-lg" />
      ))}
    </div>
  );
}

export function LeaderboardSkeleton() {
  return (
    <>
      <Skeleton className="h-8 w-40 mb-4" />
      <div className="flex gap-2 mb-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-20 rounded-lg" />
        ))}
      </div>
      <div className="skeleton-wrap space-y-3 p-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-lg" />
        ))}
      </div>
    </>
  );
}

export function PlotDetailSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      <Skeleton className="h-7 w-32" />
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-24 w-full rounded-2xl" />
      <Skeleton className="h-14 w-full rounded-xl" />
      <div className="flex gap-2 mt-2">
        <Skeleton className="h-12 flex-1 rounded-xl" />
        <Skeleton className="h-12 w-28 rounded-xl" />
      </div>
    </div>
  );
}
