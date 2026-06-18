"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { toast } from "@/lib/toast";
import { linkWalletWithProvider } from "@/lib/walletLink";
import {
  connectWalletConnectProvider,
  disconnectWalletConnectSession,
  getWalletConnectProjectId,
} from "@/lib/walletConnect";
import { UnlinkIcon, WalletConnectIcon } from "@/components/Icons";
import { Spinner } from "@/components/Loading";

interface WalletConnectProps {
  walletAddress: string | null;
  onLinked: () => void;
  compact?: boolean;
  variant?: "default" | "header";
}

function walletErrorMessage(e: unknown): string {
  const err = e as Error & { code?: string };
  if (err.code === "wallet_linked_elsewhere" || err.code === "wallet_already_linked") {
    return err.message;
  }
  if (err.message?.includes("User rejected") || err.message?.includes("rejected")) {
    return "Connection cancelled.";
  }
  return err.message || "Wallet connection failed";
}

export function WalletConnect({
  walletAddress,
  onLinked,
  compact,
  variant = "default",
}: WalletConnectProps) {
  const [loading, setLoading] = useState<"metamask" | "wc" | "disconnect" | null>(null);
  const [syncing, setSyncing] = useState(false);
  const wcEnabled = Boolean(getWalletConnectProjectId());
  const isHeader = variant === "header";

  // MetaMask disabled — WalletConnect only
  // async function connectInjected() {
  //   if (typeof window === "undefined" || !window.ethereum) {
  //     toast.error("MetaMask not detected. Use WalletConnect on mobile.");
  //     return;
  //   }
  //   setLoading("metamask");
  //   try {
  //     await linkWalletWithProvider(window.ethereum);
  //     toast.success("Wallet connected & NFTs synced!");
  //     onLinked();
  //   } catch (e) {
  //     toast.error(walletErrorMessage(e));
  //   } finally {
  //     setLoading(null);
  //   }
  // }

  async function connectWithWalletConnect() {
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
      await apiFetch("/api/player/sync-nfts", { method: "POST" });
      toast.success("NFTs refreshed from blockchain!");
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
    if (isHeader) {
      return (
        <div className="flex items-center gap-1 shrink-0">
          <span className="game-pill px-2 py-1 rounded-full text-[10px] lg:text-xs font-bold text-[var(--green)] tabular-nums hidden sm:inline">
            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </span>
          <button
            type="button"
            onClick={refreshNfts}
            disabled={loading !== null || syncing}
            title="Refresh NFTs"
            className="btn-secondary px-2 py-1 text-[10px] lg:text-xs shrink-0 disabled:opacity-50 min-h-0"
          >
            {syncing ? <Spinner size="sm" /> : "NFTs"}
          </button>
          <button
            type="button"
            onClick={disconnectWallet}
            disabled={loading !== null || syncing}
            title="Disconnect wallet"
            className="btn-danger px-2 py-1 text-[10px] lg:text-xs shrink-0 disabled:opacity-50 min-h-0"
          >
            {loading === "disconnect" ? <Spinner size="sm" /> : <UnlinkIcon className="w-3.5 h-3.5" />}
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
          className="btn-secondary w-full text-sm disabled:opacity-50"
        >
          {syncing ? (
            <>
              <Spinner size="sm" />
              Syncing NFTs...
            </>
          ) : (
            "Refresh NFTs"
          )}
        </button>
      </div>
    );
  }

  if (!wcEnabled) {
    return isHeader ? null : (
      <p className="text-xs text-[var(--muted)] font-bold text-center">
        Set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID to enable wallet linking.
      </p>
    );
  }

  return (
    <div className={isHeader ? "shrink-0" : "space-y-2"}>
      {/* MetaMask removed — WalletConnect only
      <button onClick={connectInjected} ...>Connect MetaMask</button>
      */}

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
          "Connect"
        ) : (
          "WalletConnect"
        )}
      </button>
    </div>
  );
}

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      isMetaMask?: boolean;
    };
  }
}
