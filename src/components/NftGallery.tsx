import Image from "next/image";
import { CrownIcon } from "@/components/Icons";
import { formatRarity, type OwnedNft, type RarityTier } from "@/lib/chomper";

function rarityBorderClass(rarity: RarityTier): string {
  switch (rarity) {
    case "legendary":
      return "border-[var(--gold)]";
    case "rare":
      return "border-[var(--blue)]";
    case "uncommon":
      return "border-[var(--green)]";
    default:
      return "border-gray-600";
  }
}

function rarityTextClass(rarity: RarityTier): string {
  switch (rarity) {
    case "legendary":
      return "text-[var(--gold)]";
    case "rare":
      return "text-[var(--blue)]";
    case "uncommon":
      return "text-[var(--green)]";
    default:
      return "text-gray-400";
  }
}

function nftImage(nft: OwnedNft): string {
  return nft.imageUrl || "/images/chomper.jpg";
}

function sortNfts(nfts: OwnedNft[]): OwnedNft[] {
  return [...nfts].sort((a, b) => {
    const aCrown = a.isCrownBound ? 0 : 1;
    const bCrown = b.isCrownBound ? 0 : 1;
    if (aCrown !== bCrown) return aCrown - bCrown;
    return a.tokenId - b.tokenId;
  });
}

interface NftGalleryProps {
  nfts: OwnedNft[];
  collectionName?: string;
  walletLinked: boolean;
}

export function NftGallery({ nfts, collectionName, walletLinked }: NftGalleryProps) {
  const sorted = sortNfts(nfts);

  return (
    <div className="card mb-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
        <h3 className="stat-label mb-0">NFT Gallery</h3>
        {collectionName ? (
          <span className="text-[10px] font-bold text-[var(--muted)]">{collectionName}</span>
        ) : null}
      </div>

      {!walletLinked ? (
        <p className="text-sm text-[var(--muted)] font-bold">
          Connect your wallet and tap <span className="text-[var(--green)]">NFTs</span> in the header
          to sync your collection.
        </p>
      ) : sorted.length === 0 ? (
        <p className="text-sm text-[var(--muted)] font-bold">
          No NFTs found in your linked wallet for this collection. Tap{" "}
          <span className="text-[var(--green)]">NFTs</span> in the header to refresh.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {sorted.map((nft) => {
            const isCrown = Boolean(nft.isCrownBound);
            const img = nftImage(nft);
            return (
              <div
                key={nft.tokenId}
                className={`bg-dark-card rounded-xl border-2 overflow-hidden ${rarityBorderClass(nft.rarity)}`}
              >
                <div className="relative aspect-square bg-[#c9d0b6]">
                  <Image
                    src={img}
                    alt={`Token #${nft.tokenId}`}
                    fill
                    className="object-contain p-2"
                    sizes="(max-width: 640px) 50vw, 160px"
                    unoptimized={img.startsWith("http")}
                  />
                  {isCrown && (
                    <span
                      className="absolute top-1.5 right-1.5 flex items-center gap-0.5 rounded-md bg-black/60 px-1.5 py-0.5 text-[9px] font-bold text-[var(--gold)]"
                      title="Bound to a Crown Land plot"
                    >
                      <CrownIcon className="w-3 h-3" />
                      Crown
                    </span>
                  )}
                </div>
                <div className="p-2.5 text-center">
                  <p className="text-xs font-black text-gray-200">#{nft.tokenId}</p>
                  <p className={`text-[10px] font-bold mt-0.5 ${rarityTextClass(nft.rarity)}`}>
                    {formatRarity(nft.rarity)}
                  </p>
                  {isCrown && (
                    <p className="text-[9px] text-[var(--muted)] font-bold mt-1">Crown Land</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
