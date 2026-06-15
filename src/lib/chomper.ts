export type RarityTier = "common" | "uncommon" | "rare" | "legendary";

export function rarityFromTokenId(tokenId: number): RarityTier {
  if (tokenId <= 100) return "legendary";
  if (tokenId <= 1000) return "rare";
  if (tokenId <= 5000) return "uncommon";
  return "common";
}

export function formatRarity(tier: RarityTier): string {
  return tier.charAt(0).toUpperCase() + tier.slice(1);
}

export function getChomperLabel(tokenIds: number[]): string {
  if (tokenIds.length === 0) return "Chomper Recruit";
  const id = tokenIds[0];
  const tier = formatRarity(rarityFromTokenId(id));
  return `Chomper #${id} (${tier})`;
}
