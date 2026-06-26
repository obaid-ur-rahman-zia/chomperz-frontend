import type { EthereumProvider as EthereumProviderType } from "@walletconnect/ethereum-provider";
import { getExpectedChainId } from "./walletLink";

let wcProvider: InstanceType<typeof EthereumProviderType> | null = null;

export function getWalletConnectProjectId(): string | null {
  return process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID?.trim() || null;
}

export function isMetaMaskEnabled(): boolean {
  const v = process.env.NEXT_PUBLIC_METAMASK?.trim().toLowerCase();
  return v !== "false" && v !== "0" && v !== "no";
}

export async function connectWalletConnectProvider() {
  if (typeof window === "undefined") {
    throw new Error("WalletConnect is only available in the browser.");
  }

  const projectId = getWalletConnectProjectId();
  if (!projectId) {
    throw new Error(
      "WalletConnect is not configured. Set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID in frontend/.env"
    );
  }

  const chainId = getExpectedChainId();
  const { default: EthereumProvider } = await import("@walletconnect/ethereum-provider");

  if (!wcProvider) {
    wcProvider = await EthereumProvider.init({
      projectId,
      chains: [chainId],
      showQrModal: true,
      qrModalOptions: {
        themeMode: "dark",
      },
      metadata: {
        name: "Chomperz Basecamp",
        description: "Chomperz Web2.5 idle game",
        url: window.location.origin,
        icons: [`${window.location.origin}/images/chomper.jpg`],
      },
    });
  }

  if (!wcProvider.connected) {
    await wcProvider.connect();
  }

  const activeChain = wcProvider.chainId;
  if (activeChain && Number(activeChain) !== chainId) {
    try {
      await wcProvider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch {
      throw new Error(`Wrong network. Please switch to chain ID ${chainId} in your wallet.`);
    }
  }

  return wcProvider;
}

export async function disconnectWalletConnectSession(): Promise<void> {
  if (wcProvider?.connected) {
    await wcProvider.disconnect();
  }
  wcProvider = null;
}
