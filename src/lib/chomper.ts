/** Display-only helpers — rarity/multiplier always come from the API. */

export type RarityTier = "common" | "uncommon" | "rare" | "legendary";

export interface OwnedNft {
  tokenId: number;
  rarity: RarityTier;
}

export function getChomperLabelFromPlayer(player: {
  chomperLabel?: string;
  nfts?: OwnedNft[];
}): string {
  if (player.chomperLabel) return player.chomperLabel;
  if (!player.nfts?.length) return "Chomper Recruit";
  const n = player.nfts[0];
  const tier = n.rarity.charAt(0).toUpperCase() + n.rarity.slice(1);
  return `Chomper #${n.tokenId} (${tier})`;
}
