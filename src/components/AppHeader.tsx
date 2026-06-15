import Link from "next/link";
import { CoinIcon } from "@/components/Icons";
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
    <header className="flex flex-wrap justify-between items-center gap-4 mb-8">
      <h1 className="text-2xl font-black tracking-wide flex items-center gap-2">
        {icon}
        {title}
      </h1>
      <div className="flex items-center gap-4">
        {zCoins !== null && zCoins !== undefined && (
          <span className="bg-black/30 border-2 border-[#3a453d] rounded-full px-4 py-2 font-extrabold text-[var(--gold)] flex items-center gap-2">
            <CoinIcon className="w-4 h-4" />
            {formatCoins(zCoins)} Z-Coins
          </span>
        )}
        {backHref && (
          <Link href={backHref} className="text-sm font-bold text-[var(--blue)]">
            ← {backLabel}
          </Link>
        )}
      </div>
    </header>
  );
}
