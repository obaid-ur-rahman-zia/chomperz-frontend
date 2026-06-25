"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { toast } from "@/lib/toast";
import { linkWalletWithProvider, getMetaMaskProvider, formatWalletLinkError } from "@/lib/walletLink";
import {
  connectWalletConnectProvider,
  disconnectWalletConnectSession,
  getWalletConnectProjectId,
  isMetaMaskEnabled,
} from "@/lib/walletConnect";
import { MetaMaskIcon, UnlinkIcon, WalletConnectIcon } from "@/components/Icons";
import { Spinner } from "@/components/Loading";
import Image from "next/image";
import { SLICING } from "@/lib/slicing-paths";

interface WalletConnectProps {
  walletAddress: string | null;
  nftCount?: number;
  onLinked: () => void;
  compact?: boolean;
  variant?: "default" | "header" | "dashboard";
}

function nftHoverTitle(count: number): string {
  if (count === 0) return "0 NFTs synced · Tap to refresh from wallet";
  if (count === 1) return "1 NFT synced · Tap to refresh";
  return `${count} NFTs synced · Tap to refresh`;
}

function nftSyncToast(count: number): string {
  if (count === 0) return "Sync complete — no NFTs found in this collection";
  if (count === 1) return "1 NFT synced from wallet!";
  return `${count} NFTs synced from wallet!`;
}

function walletErrorMessage(e: unknown): string {
  const err = e as Error & { code?: string };
  if (err.code === "wallet_linked_elsewhere" || err.code === "wallet_already_linked") {
    return err.message;
  }
  return formatWalletLinkError(e);
}

export function WalletConnect({
  walletAddress,
  nftCount = 0,
  onLinked,
  compact,
  variant = "default",
}: WalletConnectProps) {
  const [loading, setLoading] = useState<"metamask" | "wc" | "disconnect" | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [displayCount, setDisplayCount] = useState(nftCount);
  const wcEnabled = Boolean(getWalletConnectProjectId());
  const metamaskEnabled = isMetaMaskEnabled();
  const isHeader = variant === "header";
  const isDashboard = variant === "dashboard";
  const [showConnectOptions, setShowConnectOptions] = useState(false);

  useEffect(() => {
    if (!syncing) setDisplayCount(nftCount);
  }, [nftCount, syncing]);

  async function connectInjected() {
    if (loading !== null) return;
    const injected = getMetaMaskProvider();
    if (!injected) {
      toast.error("MetaMask not detected. Install the extension or use WalletConnect.");
      return;
    }
    setLoading("metamask");
    try {
      await linkWalletWithProvider(injected);
      toast.success("Wallet connected & NFTs synced!");
      onLinked();
    } catch (e) {
      toast.error(walletErrorMessage(e));
    } finally {
      setLoading(null);
    }
  }

  async function connectWithWalletConnect() {
    if (loading !== null) return;
    setLoading("wc");
    try {
      const wc = await connectWalletConnectProvider();
      await linkWalletWithProvider(wc);
      toast.success("Wallet connected & NFTs synced!");
      onLinked();
    } catch (e) {
      toast.error(walletErrorMessage(e));
    } finally {
      setLoading(null);
    }
  }

  async function refreshNfts() {
    setSyncing(true);
    try {
      const data = await apiFetch<{ nftCount: number }>("/api/player/sync-nfts", {
        method: "POST",
      });
      const count = data.nftCount ?? 0;
      setDisplayCount(count);
      toast.success(nftSyncToast(count));
      onLinked();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "NFT sync failed");
    } finally {
      setSyncing(false);
    }
  }

  async function disconnectWallet() {
    setLoading("disconnect");
    try {
      await apiFetch("/api/auth/disconnect-wallet", { method: "POST" });
      await disconnectWalletConnectSession().catch(() => {});
      toast.success("Wallet disconnected");
      onLinked();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Disconnect failed");
    } finally {
      setLoading(null);
    }
  }

  const connectBtnClass = isHeader
    ? "disabled:opacity-50 flex items-center justify-center gap-1.5 font-extrabold rounded-lg px-2.5 py-1.5 text-[11px] lg:text-xs shrink-0 transition-opacity hover:opacity-90"
    : "w-full disabled:opacity-50 flex items-center justify-center gap-2.5 font-extrabold rounded-xl px-5 py-3 transition-opacity hover:opacity-90";

  if (walletAddress) {
    if (isDashboard) {
      return (
        <div className="w-full space-y-1.5">
          <p className="text-center text-[10px] font-bold text-[#4ade80] truncate">
            {walletAddress.slice(0, 8)}...{walletAddress.slice(-6)}
          </p>
          <div className="flex gap-1.5 justify-center">
            <button
              type="button"
              onClick={refreshNfts}
              disabled={loading !== null || syncing}
              className="text-[9px] font-black text-white bg-black/30 px-2 py-1 rounded disabled:opacity-50"
            >
              {syncing ? "Syncing..." : `NFTs (${displayCount})`}
            </button>
            <button
              type="button"
              onClick={disconnectWallet}
              disabled={loading !== null || syncing}
              className="text-[9px] font-black text-red-300 bg-black/30 px-2 py-1 rounded disabled:opacity-50"
            >
              Disconnect
            </button>
          </div>
        </div>
      );
    }

    if (isHeader) {
      return (
        <div className="flex items-center gap-1 shrink-0">
          <span className="game-pill px-2 py-1 rounded-full text-[10px] lg:text-xs font-bold text-[var(--green)] tabular-nums hidden md:inline">
            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </span>
          <button
            type="button"
            onClick={refreshNfts}
            disabled={loading !== null || syncing}
            title={nftHoverTitle(displayCount)}
            aria-label={syncing ? "Syncing NFTs" : nftHoverTitle(displayCount)}
            className="btn-header btn-header-secondary disabled:opacity-50"
          >
            {syncing ? (
              <Spinner size="sm" />
            ) : (
              <>
                <span>NFTs</span>
                <span className="btn-header-badge">{displayCount}</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={disconnectWallet}
            disabled={loading !== null || syncing}
            title="Disconnect wallet"
            aria-label="Disconnect wallet"
            className="btn-header btn-header-danger btn-header-icon disabled:opacity-50"
          >
            {loading === "disconnect" ? (
              <Spinner size="sm" />
            ) : (
              <UnlinkIcon className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
            )}
          </button>
        </div>
      );
    }

    return (
      <div className={compact ? "space-y-2" : "space-y-3"}>
        <div className="flex items-center justify-between gap-2 bg-black/20 rounded-xl px-3 py-2.5">
          <div className="min-w-0">
            <p className="text-xs text-[var(--muted)] font-bold">Wallet</p>
            <p className="text-sm font-extrabold text-[var(--green)] truncate">
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </p>
          </div>
          <button
            onClick={disconnectWallet}
            disabled={loading !== null || syncing}
            className="btn-danger flex items-center gap-1.5 px-3 py-2 text-xs shrink-0 disabled:opacity-50"
          >
            <UnlinkIcon className="w-4 h-4" />
            {loading === "disconnect" ? <Spinner size="sm" /> : "Disconnect"}
          </button>
        </div>
        <button
          onClick={refreshNfts}
          disabled={loading !== null || syncing}
          title={nftHoverTitle(displayCount)}
          aria-label={syncing ? "Syncing NFTs" : nftHoverTitle(displayCount)}
          className="btn-secondary w-full text-sm disabled:opacity-50"
        >
          {syncing ? (
            <>
              <Spinner size="sm" />
              Syncing NFTs...
            </>
          ) : (
            <>
              Refresh NFTs
              <span className="ml-1.5 inline-flex items-center justify-center min-w-[1.25rem] px-1.5 py-0.5 rounded-full bg-black/25 text-xs font-black tabular-nums">
                {displayCount}
              </span>
            </>
          )}
        </button>
      </div>
    );
  }

  if (!wcEnabled && !metamaskEnabled) {
    return isHeader ? null : (
      <p className="text-xs text-[var(--muted)] font-bold text-center">
        Enable NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID and/or install MetaMask. Set NEXT_PUBLIC_METAMASK=false to hide MetaMask.
      </p>
    );
  }

  if (isDashboard && !showConnectOptions) {
    return (
      <button
        type="button"
        onClick={() => setShowConnectOptions(true)}
        disabled={loading !== null}
        className="relative w-full h-9 md:h-10 disabled:opacity-50 transition-transform active:scale-[0.98]"
      >
        <Image
          src={SLICING.mainMenu.connectWallet}
          alt=""
          fill
          className="object-fill pointer-events-none"
          unoptimized
        />
        <span className="relative z-[1] text-[11px] md:text-xs font-black text-white sliced-btn-text tracking-wide">
          Connect To Wallet
        </span>
      </button>
    );
  }

  if (isDashboard && showConnectOptions) {
    return (
      <div className="w-full space-y-1.5">
        <button
          type="button"
          onClick={() => setShowConnectOptions(false)}
          className="w-full text-[9px] font-bold text-white/70 underline"
        >
          Back
        </button>
        {metamaskEnabled && (
          <button
            type="button"
            onClick={connectInjected}
            disabled={loading !== null}
            className="w-full flex items-center justify-center gap-2 font-extrabold rounded-lg px-3 py-2 text-xs disabled:opacity-50"
            style={{ background: "#f6851b", color: "#fff" }}
          >
            <MetaMaskIcon className="w-5 h-5" />
            {loading === "metamask" ? <Spinner size="sm" /> : "MetaMask"}
          </button>
        )}
        {wcEnabled && (
          <button
            type="button"
            onClick={connectWithWalletConnect}
            disabled={loading !== null}
            className="w-full flex items-center justify-center gap-2 font-extrabold rounded-lg px-3 py-2 text-xs disabled:opacity-50"
            style={{ background: "#3B99FC", color: "#fff" }}
          >
            <WalletConnectIcon className="w-5 h-5" />
            {loading === "wc" ? <Spinner size="sm" /> : "WalletConnect"}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={isHeader ? "flex items-center gap-1 shrink-0" : "space-y-2"}>
      {metamaskEnabled && (
        <button
          type="button"
          onClick={connectInjected}
          disabled={loading !== null}
          className={connectBtnClass}
          style={{ background: "#f6851b", color: "#fff" }}
        >
          <MetaMaskIcon className={isHeader ? "w-4 h-4 lg:w-5 lg:h-5" : "w-6 h-6"} />
          {loading === "metamask" ? (
            <>
              <Spinner size="sm" />
              {isHeader ? "..." : "Connecting..."}
            </>
          ) : isHeader ? (
            "MetaMask"
          ) : (
            "Connect MetaMask"
          )}
        </button>
      )}

      {wcEnabled && (
        <button
          type="button"
          onClick={connectWithWalletConnect}
          disabled={loading !== null}
          className={connectBtnClass}
          style={{ background: "#3B99FC", color: "#fff" }}
        >
          <WalletConnectIcon className={isHeader ? "w-4 h-4 lg:w-5 lg:h-5" : "w-6 h-6"} />
          {loading === "wc" ? (
            <>
              <Spinner size="sm" />
              {isHeader ? "..." : "Opening QR..."}
            </>
          ) : isHeader ? (
            "WC"
          ) : (
            "WalletConnect"
          )}
        </button>
      )}
    </div>
  );
}
