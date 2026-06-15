"use client";

import { GameShell } from "@/components/GameShell";
import { AppHeader } from "@/components/AppHeader";
import { WalletConnect } from "@/components/WalletConnect";
import { UserAvatar } from "@/components/UserAvatar";
import { usePlayer } from "@/hooks/usePlayer";
import {
  BoltIcon,
  CoinIcon,
  LogoutIcon,
  ProfileIcon,
  SpeedIcon,
  TrendIcon,
} from "@/components/Icons";
import { apiFetch, clearToken, formatCoins, formatPercent } from "@/lib/api";
import { getChomperLabel } from "@/lib/chomper";
import { ProfileSkeleton } from "@/components/Loading";

export default function ProfilePage() {
  const { player, loading, refresh } = usePlayer();

  async function handleLogout() {
    await apiFetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    clearToken();
    window.location.href = "/login";
  }

  if (loading || !player) {
    return <ProfileSkeleton />;
  }

  const { economy } = player;
  const tokenIds = player.cachedTokenIds ?? [];
  const chomperLabel = getChomperLabel(tokenIds.length ? tokenIds : [4242]);
  const avatar = player.profilePicUrl || "/images/chomper.jpg";

  return (
    <GameShell>
      <AppHeader
        title="PROFILE"
        icon={<ProfileIcon className="w-6 h-6 text-[var(--blue)] shrink-0" />}
        zCoins={player.zCoins}
        backHref="/dashboard"
      />

      <div className="card text-center mb-4">
        <div className="relative w-24 h-24 mx-auto mb-4 rounded-2xl overflow-hidden border-4 border-[var(--green)]">
          <UserAvatar src={avatar} alt="Profile" />
        </div>
        <h2 className="text-xl font-black">{player.twitterHandle}</h2>
        <p className="text-sm text-[var(--muted)] font-bold mt-1">{chomperLabel}</p>
        <button
          onClick={handleLogout}
          className="btn-danger inline-flex mt-4 text-sm"
        >
          <LogoutIcon className="w-4 h-4" />
          Logout
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="card">
          <p className="stat-label">Balance</p>
          <p className="font-black text-[var(--gold)] flex items-center gap-1 text-lg">
            <CoinIcon className="w-5 h-5" />
            {formatCoins(player.zCoins)}
          </p>
        </div>
        <div className="card">
          <p className="stat-label">Daily Rate</p>
          <p className="font-black text-[var(--green)] flex items-center gap-1 text-lg">
            <TrendIcon className="w-5 h-5" />
            +{formatCoins(economy.dailyRate)}
          </p>
        </div>
        <div className="card">
          <p className="stat-label">NFTs</p>
          <p className="font-black text-xl">{economy.nftCount}</p>
        </div>
        <div className="card">
          <p className="stat-label">Multiplier</p>
          <p className="font-black text-xl">{economy.nftMultiplier.toFixed(2)}x</p>
        </div>
      </div>

      <div className="card mb-4 space-y-2 text-sm font-bold">
        <div className="flex justify-between">
          <span className="text-[var(--muted)]">Quantity Boost</span>
          <span className="text-[var(--green)]">{formatPercent(economy.quantityBoost)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--muted)]">Rarity Boost</span>
          <span className="text-[var(--green)]">{formatPercent(economy.rarityBoost)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[var(--muted)] flex items-center gap-1">
            <BoltIcon className="w-4 h-4 text-[var(--gold)]" />
            Power Lvl
          </span>
          <span>{player.powerLvl}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[var(--muted)] flex items-center gap-1">
            <SpeedIcon className="w-4 h-4" />
            Speed Lvl
          </span>
          <span>{player.speedLvl}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--muted)]">Pending</span>
          <span className="text-[var(--gold)]">
            {formatCoins(economy.pendingEarnings)} Z
          </span>
        </div>
      </div>

      <div className="card">
        <p className="stat-label mb-3">Wallet</p>
        <WalletConnect
          walletAddress={player.walletAddress}
          onLinked={refresh}
          compact
        />
      </div>
    </GameShell>
  );
}
