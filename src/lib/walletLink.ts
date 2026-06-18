import { BrowserProvider, type Eip1193Provider } from "ethers";
import { SiweMessage } from "siwe";
import { apiFetch } from "./api";

export function getExpectedChainId(): number {
  return Number(process.env.NEXT_PUBLIC_CHAIN_ID || "1");
}

export async function linkWalletWithProvider(eip1193: Eip1193Provider): Promise<void> {
  const provider = new BrowserProvider(eip1193);
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
}
