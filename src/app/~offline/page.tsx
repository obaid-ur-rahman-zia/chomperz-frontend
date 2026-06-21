import Link from "next/link";

export default function OfflinePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-[var(--bg)]">
      <div className="card max-w-sm w-full">
        <p className="text-4xl mb-3" aria-hidden>
          📡
        </p>
        <h1 className="text-xl font-black mb-2">You&apos;re offline</h1>
        <p className="text-sm text-[var(--muted)] font-bold mb-5">
          ChomperZ needs a connection for coins, NFT sync, and live map updates.
        </p>
        <Link href="/dashboard" className="btn-primary w-full no-underline">
          Try again
        </Link>
      </div>
    </main>
  );
}
