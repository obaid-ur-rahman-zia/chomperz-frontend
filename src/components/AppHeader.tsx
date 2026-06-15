import Link from "next/link";
import { ArrowLeftIcon, CoinIcon } from "@/components/Icons";
import { formatCoins } from "@/lib/api";

interface AppHeaderProps {
  title: string;
  icon?: React.ReactNode;
  zCoins?: number | null;
  backHref?: string;
  backLabel?: string;
}

export function AppHeader({
  title,
  icon,
  zCoins,
  backHref,
  backLabel = "Basecamp",
}: AppHeaderProps) {
  return (
    <header className="mb-6">
      <div className="flex items-center justify-between gap-3 mb-3">
        {backHref ? (
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#3a453d] bg-black/25 px-3 py-2 text-sm font-extrabold text-[var(--blue)] no-underline transition-opacity hover:opacity-80 min-h-[40px]"
          >
            <ArrowLeftIcon className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">{backLabel}</span>
            <span className="sm:hidden">Back</span>
          </Link>
        ) : (
          <span />
        )}
        {zCoins !== null && zCoins !== undefined && (
          <span className="bg-black/30 border-2 border-[#3a453d] rounded-full px-3 py-1.5 font-extrabold text-[var(--gold)] text-sm flex items-center gap-1.5 shrink-0">
            <CoinIcon className="w-4 h-4 shrink-0" />
            <span className="truncate max-w-[100px] sm:max-w-none">
              {formatCoins(zCoins)}
            </span>
          </span>
        )}
      </div>
      <h1 className="text-xl sm:text-2xl font-black tracking-wide flex items-center gap-2">
        {icon}
        {title}
      </h1>
    </header>
  );
}
