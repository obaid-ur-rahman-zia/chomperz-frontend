import { GameShell } from "@/components/GameShell";

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

export function LoadingScreen({ label }: { label?: string }) {
  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <Spinner size="lg" />
      {label && (
        <p className="text-sm font-bold text-[var(--muted)]">{label}</p>
      )}
    </main>
  );
}

function HeaderSkeleton() {
  return (
    <header className="mb-6">
      <div className="flex items-center justify-between gap-3 mb-3">
        <Skeleton className="h-10 w-24 rounded-full" />
        <Skeleton className="h-10 w-24 rounded-full" />
      </div>
      <Skeleton className="h-8 w-52 max-w-full" />
    </header>
  );
}

export function DashboardSkeleton() {
  return (
    <GameShell>
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <Skeleton className="h-8 w-56 max-w-full mx-auto sm:mx-0" />
        <div className="flex items-center justify-center gap-2">
          <Skeleton className="h-10 w-28 rounded-full" />
          <Skeleton className="h-10 w-24 rounded-xl" />
        </div>
      </header>

      <div className="grid md:grid-cols-2 gap-4 md:gap-6">
        <div className="card">
          <Skeleton className="w-full max-w-[220px] sm:max-w-[280px] aspect-square mx-auto mb-4 rounded-2xl" />
          <Skeleton className="h-6 w-40 mx-auto mb-2" />
          <Skeleton className="h-4 w-32 mx-auto mb-6" />
          <Skeleton className="h-3 w-28 mb-3" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="card space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-9 w-40" />
          </div>
          <div className="card space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-36" />
          </div>
          <div className="card space-y-3">
            <Skeleton className="h-3 w-36 mb-1" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
          <div className="card space-y-3">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </GameShell>
  );
}

export function ProfileSkeleton() {
  return (
    <GameShell>
      <HeaderSkeleton />

      <div className="card text-center mb-4">
        <Skeleton className="w-24 h-24 mx-auto mb-4 rounded-2xl" />
        <Skeleton className="h-6 w-36 mx-auto mb-2" />
        <Skeleton className="h-4 w-28 mx-auto mb-4" />
        <Skeleton className="h-10 w-28 mx-auto rounded-xl" />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-7 w-20" />
          </div>
        ))}
      </div>

      <div className="card mb-4 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>

      <div className="card space-y-3">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    </GameShell>
  );
}

export function MapSkeleton() {
  return (
    <GameShell>
      <HeaderSkeleton />

      <div className="grid lg:grid-cols-[1.2fr_1fr] gap-4 lg:gap-6">
        <div className="card">
          <Skeleton className="h-3 w-28 mb-3" />
          <div className="grid grid-cols-10 gap-1.5">
            {Array.from({ length: 100 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-md" />
            ))}
          </div>
          <Skeleton className="h-4 w-full mt-4" />
        </div>

        <div className="card space-y-4">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
          <div className="flex gap-2 mt-2">
            <Skeleton className="h-12 flex-1 rounded-xl" />
            <Skeleton className="h-12 w-28 rounded-xl" />
          </div>
        </div>
      </div>
    </GameShell>
  );
}

export function ShopSkeleton() {
  return (
    <GameShell>
      <HeaderSkeleton />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card">
            <div className="flex items-center gap-4 mb-4">
              <Skeleton className="w-14 h-14 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
        ))}
      </div>

      <Skeleton className="h-12 w-full rounded-xl mt-6" />
    </GameShell>
  );
}

export function CribSkeleton() {
  return (
    <GameShell>
      <HeaderSkeleton />

      <div className="card mb-4">
        <Skeleton className="w-full max-w-md mx-auto aspect-[8/5] rounded-2xl" />
        <div className="flex flex-col sm:flex-row gap-2 mt-4">
          <Skeleton className="h-12 flex-1 rounded-xl" />
          <Skeleton className="h-12 flex-1 rounded-xl" />
        </div>
      </div>

      <div className="card">
        <Skeleton className="h-3 w-36 mb-4" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-28 rounded-xl" />
          ))}
        </div>
      </div>
    </GameShell>
  );
}

export function PlotDetailSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      <Skeleton className="h-7 w-32" />
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-24 w-full rounded-2xl" />
      <Skeleton className="h-3 w-40" />
      <Skeleton className="h-14 w-full rounded-xl" />
      <Skeleton className="h-14 w-full rounded-xl" />
      <div className="flex gap-2 mt-2">
        <Skeleton className="h-12 flex-1 rounded-xl" />
        <Skeleton className="h-12 w-28 rounded-xl" />
      </div>
    </div>
  );
}
