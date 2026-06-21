/** Display-only helpers — rarity/multiplier always come from the API. */

export type RarityTier = "common" | "uncommon" | "rare" | "legendary";

export interface OwnedNft {
  tokenId: number;
  rarity: RarityTier;
  imageUrl?: string;
  isCrownBound?: boolean;
}

export function formatRarity(tier: RarityTier): string {
  return tier.charAt(0).toUpperCase() + tier.slice(1);
}

export function getChomperLabelFromPlayer(player: {
  chomperLabel?: string;
  avatarSource?: "default" | "twitter" | "nft";
  avatarNftTokenId?: number | null;
  nfts?: OwnedNft[];
}): string {
  if (player.avatarSource === "nft" && player.avatarNftTokenId != null) {
    const nft = player.nfts?.find((n) => n.tokenId === player.avatarNftTokenId);
    if (nft) {
      return `Chomper #${nft.tokenId} (${formatRarity(nft.rarity)})`;
    }
    return `Chomper #${player.avatarNftTokenId}`;
  }
  if (player.chomperLabel) return player.chomperLabel;
  if (!player.nfts?.length) return "Chomper Recruit";
  const n = player.nfts[0];
  return `Chomper #${n.tokenId} (${formatRarity(n.rarity)})`;
}
