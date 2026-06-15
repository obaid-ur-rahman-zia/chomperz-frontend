"use client";

import { useState } from "react";
import { BrowserProvider } from "ethers";
import { SiweMessage } from "siwe";
import { apiFetch } from "@/lib/api";
import { MetaMaskIcon } from "@/components/Icons";

interface WalletConnectProps {
  walletAddress: string | null;
  onLinked: () => void;
}

export function WalletConnect({ walletAddress, onLinked }: WalletConnectProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function connectWallet() {
    if (typeof window === "undefined" || !window.ethereum) {
      setError("Please install MetaMask.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const provider = new BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const chainId = Number((await provider.getNetwork()).chainId);

      const { nonce } = await apiFetch<{ nonce: string }>("/api/auth/nonce");

      const domain = window.location.host;
      const origin = window.location.origin;

      const siweMessage = new SiweMessage({
        domain,
        address,
        statement: "Link your wallet to Chomperz Basecamp.",
        uri: origin,
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

      await apiFetch("/api/player/sync-nfts", {
        method: "POST",
      });

      onLinked();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Wallet connection failed");
    } finally {
      setLoading(false);
    }
  }

  if (walletAddress) {
    return (
      <div className="text-sm font-bold">
        <span className="text-[var(--muted)]">Wallet: </span>
        <span className="text-[var(--green)]">
          {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
        </span>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={connectWallet}
        disabled={loading}
        className="btn-secondary w-full disabled:opacity-50 flex items-center justify-center gap-2.5"
      >
        <MetaMaskIcon className="w-5 h-5 shrink-0" />
        {loading ? "Connecting..." : "Connect MetaMask to Boost"}
      </button>
      {error && (
        <p className="text-[var(--danger)] text-xs font-bold mt-2">{error}</p>
      )}
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
