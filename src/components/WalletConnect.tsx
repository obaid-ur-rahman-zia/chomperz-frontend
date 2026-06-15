"use client";

import { useState } from "react";
import { BrowserProvider } from "ethers";
import { SiweMessage } from "siwe";
import { apiFetch } from "@/lib/api";
import { toast } from "@/lib/toast";
import { MetaMaskIcon, UnlinkIcon } from "@/components/Icons";
import { Spinner } from "@/components/Loading";

interface WalletConnectProps {
  walletAddress: string | null;
  onLinked: () => void;
  compact?: boolean;
}

export function WalletConnect({ walletAddress, onLinked, compact }: WalletConnectProps) {
  const [loading, setLoading] = useState(false);

  async function connectWallet() {
    if (typeof window === "undefined" || !window.ethereum) {
      toast.error("Please install MetaMask.");
      return;
    }

    setLoading(true);

    try {
      const provider = new BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const chainId = Number((await provider.getNetwork()).chainId);

      const { nonce } = await apiFetch<{ nonce: string }>("/api/auth/nonce");

      const siweMessage = new SiweMessage({
        domain: window.location.host,
        address,
        statement: "Link your wallet to Chomperz Basecamp.",
        uri: window.location.origin,
        version: "1",
        chainId,
        nonce,
      });

      const message = siweMessage.prepareMessage();
      const signature = await signer.signMessage(message);

      await apiFetch("/api/auth/verify-wallet", {
        method: "POST",
        body: JSON.stringify({ message, signature }),
      });

      await apiFetch("/api/player/sync-nfts", { method: "POST" });
      toast.success("Wallet connected & NFTs synced!");
      onLinked();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Wallet connection failed");
    } finally {
      setLoading(false);
    }
  }

  async function disconnectWallet() {
    setLoading(true);
    try {
      await apiFetch("/api/auth/disconnect-wallet", { method: "POST" });
      toast.success("Wallet disconnected");
      onLinked();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Disconnect failed");
    } finally {
      setLoading(false);
    }
  }

  if (walletAddress) {
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
            disabled={loading}
            className="btn-danger flex items-center gap-1.5 px-3 py-2 text-xs shrink-0 disabled:opacity-50"
          >
            <UnlinkIcon className="w-4 h-4" />
            {loading ? <Spinner size="sm" /> : "Disconnect"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={connectWallet}
      disabled={loading}
      className="btn-secondary w-full disabled:opacity-50 flex items-center justify-center gap-2.5"
    >
      <MetaMaskIcon className="w-5 h-5 shrink-0" />
      {loading ? (
        <>
          <Spinner size="sm" />
          Connecting...
        </>
      ) : (
        "Connect MetaMask"
      )}
    </button>
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
