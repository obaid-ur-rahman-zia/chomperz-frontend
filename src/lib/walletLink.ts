import { BrowserProvider, type Eip1193Provider } from "ethers";
import { SiweMessage } from "siwe";
import { apiFetch } from "./api";

export function getExpectedChainId(): number {
  return Number(process.env.NEXT_PUBLIC_CHAIN_ID || "1");
}

type EthereumProvider = Eip1193Provider & { isMetaMask?: boolean; providers?: EthereumProvider[] };

/** Prefer MetaMask when multiple injected wallets (e.g. MetaMask + Coinbase). */
export function getMetaMaskProvider(): Eip1193Provider | null {
  if (typeof window === "undefined") return null;
  const eth = (window as Window & { ethereum?: EthereumProvider }).ethereum;
  if (!eth) return null;

  if (Array.isArray(eth.providers) && eth.providers.length > 0) {
    const metaMask = eth.providers.find((p) => p.isMetaMask);
    return metaMask ?? eth.providers[0] ?? null;
  }

  return eth;
}

function walletRpcCode(err: unknown): number | null {
  if (!err || typeof err !== "object") return null;
  const e = err as Record<string, unknown>;
  if (typeof e.code === "number") return e.code;

  const nested = e.error;
  if (nested && typeof nested === "object" && typeof (nested as { code?: number }).code === "number") {
    return (nested as { code: number }).code;
  }

  const info = e.info as { error?: { code?: number } } | undefined;
  if (info?.error && typeof info.error.code === "number") return info.error.code;

  const msg = typeof e.message === "string" ? e.message : "";
  if (msg.includes("-32002") || msg.includes("already pending")) return -32002;
  if (msg.includes("4001") || msg.includes("User rejected")) return 4001;

  return null;
}

export function formatWalletLinkError(err: unknown): string {
  const code = walletRpcCode(err);
  if (code === -32002) {
    return "MetaMask is already waiting — open the extension, approve or reject the popup, then try again.";
  }
  if (code === 4001) {
    return "Connection cancelled.";
  }
  if (err instanceof Error && err.message) {
    if (err.message.includes("already pending")) {
      return "MetaMask popup already open. Approve it first, then retry.";
    }
    return err.message;
  }
  return "Wallet connection failed";
}

let linkWalletInFlight: Promise<void> | null = null;

async function ensureAccounts(provider: BrowserProvider): Promise<void> {
  const existing = (await provider.send("eth_accounts", [])) as string[];
  if (Array.isArray(existing) && existing.length > 0) return;

  try {
    await provider.send("eth_requestAccounts", []);
  } catch (err) {
    const code = walletRpcCode(err);
    if (code === -32002) {
      throw new Error(formatWalletLinkError(err));
    }
    throw err;
  }
}

async function linkWalletWithProviderInternal(eip1193: Eip1193Provider): Promise<void> {
  const provider = new BrowserProvider(eip1193);
  await ensureAccounts(provider);

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
}

export async function linkWalletWithProvider(eip1193: Eip1193Provider): Promise<void> {
  if (linkWalletInFlight) {
    return linkWalletInFlight;
  }

  linkWalletInFlight = linkWalletWithProviderInternal(eip1193).finally(() => {
    linkWalletInFlight = null;
  });

  return linkWalletInFlight;
}
