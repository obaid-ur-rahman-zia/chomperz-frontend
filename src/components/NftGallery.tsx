import Image from "next/image";
import { CrownIcon } from "@/components/Icons";
import { formatRarity, type OwnedNft, type RarityTier } from "@/lib/chomper";
import { SLICING } from "@/lib/slicing-paths";

function rarityBorderClass(rarity: RarityTier): string {
  switch (rarity) {
    case "legendary":
      return "ring-2 ring-[#facc15]";
    case "rare":
      return "ring-2 ring-[#38bdf8]";
    case "uncommon":
      return "ring-2 ring-[#76B852]";
    default:
      return "ring-1 ring-white/30";
  }
}

function rarityTextClass(rarity: RarityTier, onDark?: boolean): string {
  if (onDark) {
    switch (rarity) {
      case "legendary":
        return "text-[#facc15]";
      case "rare":
        return "text-[#7dd3fc]";
      case "uncommon":
        return "text-[#4ade80]";
      default:
        return "text-white/80";
    }
  }
  switch (rarity) {
    case "legendary":
      return "text-[#ca8a04]";
    case "rare":
      return "text-[#2563eb]";
    case "uncommon":
      return "text-[#15803d]";
    default:
      return "text-[#4a2f1a]";
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
  onDarkPanel?: boolean;
}

export function NftGallery({ nfts, collectionName, walletLinked, onDarkPanel }: NftGalleryProps) {
  const sorted = sortNfts(nfts);
  const bodyText = onDarkPanel ? "text-white/90" : "text-[#4a2f1a]";
  const metaText = onDarkPanel ? "text-white/70" : "text-[#4a2f1a]";

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
        <h3 className="sliced-title text-sm md:text-base font-black text-[#f5d76e]">NFT Gallery</h3>
        {collectionName ? (
          <span className={`text-[10px] font-bold ${metaText}`}>{collectionName}</span>
        ) : null}
      </div>

      {!walletLinked ? (
        <p className={`text-xs md:text-sm font-bold leading-relaxed ${bodyText}`}>
          Connect your wallet below to sync your NFT collection and boost your Z-Coin rate.
        </p>
      ) : sorted.length === 0 ? (
        <p className={`text-xs md:text-sm font-bold leading-relaxed ${bodyText}`}>
          No NFTs found in your linked wallet for this collection. Sync again from the wallet panel
          on the dashboard.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-3">
          {sorted.map((nft) => {
            const isCrown = Boolean(nft.isCrownBound);
            const img = nftImage(nft);
            return (
              <div
                key={nft.tokenId}
                className={`relative overflow-hidden rounded-lg ${rarityBorderClass(nft.rarity)}`}
              >
                <div className="relative w-full aspect-[4/5]">
                  <Image
                    src={SLICING.inventory.assetBg}
                    alt=""
                    fill
                    className="object-fill pointer-events-none"
                    unoptimized
                  />
                  <div className="relative z-[1] flex h-full flex-col p-2">
                    <div className="relative flex-1 min-h-0 mb-1.5 rounded-md overflow-hidden bg-[#c9b896]/40">
                      <Image
                        src={img}
                        alt={`Token #${nft.tokenId}`}
                        fill
                        className="object-contain p-1"
                        sizes="(max-width: 640px) 50vw, 160px"
                        unoptimized={img.startsWith("http")}
                      />
                      {isCrown && (
                        <span
                          className="absolute top-1 right-1 flex items-center gap-0.5 rounded-md bg-black/60 px-1.5 py-0.5 text-[8px] font-bold text-[#facc15]"
                          title="Bound to a Crown Land plot"
                        >
                          <CrownIcon className="w-3 h-3" />
                          Crown
                        </span>
                      )}
                    </div>
                    <p className={`text-xs font-black text-center ${onDarkPanel ? "text-white" : "text-[#4a2f1a]"}`}>
                      #{nft.tokenId}
                    </p>
                    <p
                      className={`text-[10px] font-bold text-center mt-0.5 ${rarityTextClass(nft.rarity, onDarkPanel)}`}
                    >
                      {formatRarity(nft.rarity)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
