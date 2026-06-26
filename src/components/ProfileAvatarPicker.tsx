"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { UserAvatar } from "@/components/UserAvatar";
import { Spinner } from "@/components/Loading";
import { SlicedActionButton, SlicedPanel } from "@/components/sliced";
import { SLICING } from "@/lib/slicing-paths";
import { apiFetch, type OwnedNft, type PlayerData } from "@/lib/api";
import { toast } from "@/lib/toast";

const DEFAULT_CHOMPER = "/images/chomper.jpg";

type AvatarSource = "default" | "twitter" | "nft";

interface ProfileAvatarPickerProps {
  player: PlayerData;
  onUpdated: (player: PlayerData) => void;
  triggerClassName?: string;
  hideTrigger?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function nftImage(nft: OwnedNft): string {
  return nft.imageUrl || DEFAULT_CHOMPER;
}

function resolvePendingSource(player: PlayerData): AvatarSource {
  const source = player.avatarSource ?? "default";
  if (source === "nft" || source === "twitter") return source;
  return "default";
}

function OptionRow({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative w-full flex items-center gap-3 p-2.5 mb-2.5 rounded-lg transition-transform active:scale-[0.99] ${
        selected ? "ring-2 ring-[#facc15]" : "ring-1 ring-[#5c4030]/80"
      }`}
    >
      <Image
        src={SLICING.inventory.assetBg}
        alt=""
        fill
        className="object-fill rounded-lg pointer-events-none"
        unoptimized
      />
      <div className="relative z-[1] flex items-center gap-3 w-full">{children}</div>
    </button>
  );
}

export function ProfileAvatarPicker({
  player,
  onUpdated,
  triggerClassName,
  hideTrigger = false,
  open: controlledOpen,
  onOpenChange,
}: ProfileAvatarPickerProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const [mounted, setMounted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pendingSource, setPendingSource] = useState<AvatarSource>(() =>
    resolvePendingSource(player)
  );
  const [pendingTokenId, setPendingTokenId] = useState<number | null>(
    player.avatarNftTokenId ?? null
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    setPendingSource(resolvePendingSource(player));
    setPendingTokenId(player.avatarNftTokenId ?? null);
  }, [open, player]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  async function save() {
    setBusy(true);
    try {
      const data = await apiFetch<{ player: PlayerData }>("/api/player/avatar", {
        method: "POST",
        body: JSON.stringify({
          source: pendingSource,
          tokenId: pendingSource === "nft" ? pendingTokenId : undefined,
        }),
      });
      onUpdated(data.player);
      toast.success("Profile updated");
      setOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update profile");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {!hideTrigger ? (
        <SlicedActionButton
          src={SLICING.mainMenu.button}
          onClick={() => {
            setPendingSource(resolvePendingSource(player));
            setPendingTokenId(player.avatarNftTokenId ?? null);
            setOpen(true);
          }}
          className={triggerClassName ?? "w-full h-9 text-xs"}
        >
          Change Profile
        </SlicedActionButton>
      ) : null}

      {open && mounted
        ? createPortal(
            <div
              className="fixed inset-0 z-[110] flex items-center justify-center p-4 pb-[max(1rem,calc(env(safe-area-inset-bottom)+5rem))] sm:pb-4 bg-black/55 backdrop-blur-[2px]"
              role="dialog"
              aria-modal="true"
              aria-label="Choose profile picture"
              onClick={() => !busy && setOpen(false)}
            >
              <div
                className="w-full max-w-md max-h-[min(85dvh,32rem)] overflow-y-auto hide-scrollbar"
                onClick={(e) => e.stopPropagation()}
              >
                <SlicedPanel
                  src={SLICING.mainMenu.characterPanel}
                  padding="1.1rem 1rem 1rem"
                >
                  <h3 className="sliced-title text-base md:text-lg font-black text-[#f5d76e] mb-1 text-center">
                    Choose Profile
                  </h3>
                  <p className="text-[10px] md:text-xs text-black font-bold mb-3 text-center leading-snug">
                    Default Chomper, Twitter photo, or one of your synced NFTs.
                  </p>

                  <OptionRow
                    selected={pendingSource === "default"}
                    onClick={() => {
                      setPendingSource("default");
                      setPendingTokenId(null);
                    }}
                  >
                    <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-[#6b5344] shrink-0 sliced-wood-inset">
                      <UserAvatar
                        src={DEFAULT_CHOMPER}
                        alt="Default Chomper"
                        size={44}
                        className="object-contain p-1"
                      />
                    </div>
                    <div className="text-left min-w-0">
                      <p className="text-sm font-black text-white sliced-btn-text">
                        Default Chomper
                      </p>
                      <p className="text-[10px] text-black font-bold">
                        Original game avatar
                      </p>
                    </div>
                  </OptionRow>

                  <OptionRow
                    selected={pendingSource === "twitter"}
                    onClick={() => {
                      setPendingSource("twitter");
                      setPendingTokenId(null);
                    }}
                  >
                    <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-[#6b5344] shrink-0">
                      <UserAvatar
                        src={player.profilePicUrl || DEFAULT_CHOMPER}
                        alt="Twitter profile"
                        size={44}
                      />
                    </div>
                    <div className="text-left min-w-0">
                      <p className="text-sm font-black text-white sliced-btn-text">
                        Twitter Profile
                      </p>
                      <p className="text-[10px] text-black font-bold truncate">
                        {player.twitterHandle}
                      </p>
                    </div>
                  </OptionRow>

                  {player.nfts.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {player.nfts.map((nft) => {
                        const selected =
                          pendingSource === "nft" && pendingTokenId === nft.tokenId;
                        return (
                          <button
                            key={nft.tokenId}
                            type="button"
                            onClick={() => {
                              setPendingSource("nft");
                              setPendingTokenId(nft.tokenId);
                            }}
                            className={`relative rounded-lg p-1 transition-transform active:scale-95 ${
                              selected ? "ring-2 ring-[#facc15]" : "ring-1 ring-[#5c4030]/80"
                            }`}
                          >
                            <Image
                              src={SLICING.crib.assetsBg}
                              alt=""
                              fill
                              className="object-fill rounded-lg pointer-events-none"
                              unoptimized
                            />
                            <div className="relative z-[1]">
                              <div className="relative aspect-square rounded-md overflow-hidden sliced-wood-inset flex items-center justify-center mx-0.5 mt-0.5">
                                <UserAvatar
                                  src={nftImage(nft)}
                                  alt={`NFT #${nft.tokenId}`}
                                  size={56}
                                  className="object-contain p-1"
                                />
                              </div>
                              <p className="text-[10px] font-black text-white sliced-btn-text mt-1">
                                #{nft.tokenId}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-[10px] md:text-xs text-black font-bold mb-3 text-center">
                      Sync NFTs from the header to use an NFT as your profile.
                    </p>
                  )}

                  <div className="flex gap-2 pt-1">
                    <SlicedActionButton
                      src={SLICING.shop.unselectedButton}
                      onClick={() => setOpen(false)}
                      disabled={busy}
                      className="flex-1 h-9 text-xs md:text-sm"
                    >
                      Cancel
                    </SlicedActionButton>
                    <SlicedActionButton
                      src={SLICING.crib.buttons}
                      onClick={save}
                      disabled={busy || (pendingSource === "nft" && pendingTokenId == null)}
                      className="flex-1 h-9 text-xs md:text-sm disabled:opacity-50"
                    >
                      {busy ? <Spinner size="sm" /> : "Save"}
                    </SlicedActionButton>
                  </div>
                </SlicedPanel>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
