"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { UserAvatar } from "@/components/UserAvatar";
import { Spinner } from "@/components/Loading";
import { apiFetch, type OwnedNft, type PlayerData } from "@/lib/api";
import { toast } from "@/lib/toast";

const DEFAULT_CHOMPER = "/images/chomper.jpg";

type AvatarSource = "default" | "twitter" | "nft";

interface ProfileAvatarPickerProps {
  player: PlayerData;
  onUpdated: (player: PlayerData) => void;
  triggerClassName?: string;
}

function nftImage(nft: OwnedNft): string {
  return nft.imageUrl || DEFAULT_CHOMPER;
}

function resolvePendingSource(player: PlayerData): AvatarSource {
  const source = player.avatarSource ?? "default";
  if (source === "nft" || source === "twitter") return source;
  return "default";
}

export function ProfileAvatarPicker({
  player,
  onUpdated,
  triggerClassName,
}: ProfileAvatarPickerProps) {
  const [open, setOpen] = useState(false);
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
      <button
        type="button"
        onClick={() => {
          setPendingSource(resolvePendingSource(player));
          setPendingTokenId(player.avatarNftTokenId ?? null);
          setOpen(true);
        }}
        className={
          triggerClassName ??
          "btn-secondary w-full text-xs py-2 min-h-0"
        }
      >
        Change Profile
      </button>

      {open && mounted
        ? createPortal(
            <div
              className="fixed inset-0 z-[110] flex items-center justify-center p-4 pb-[max(1rem,calc(env(safe-area-inset-bottom)+5rem))] sm:pb-4 bg-black/60"
              role="dialog"
              aria-modal="true"
              aria-label="Choose profile picture"
              onClick={() => !busy && setOpen(false)}
            >
              <div
                className="card w-full max-w-md max-h-[min(85dvh,32rem)] overflow-y-auto shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
            <h3 className="text-lg font-black mb-1">Choose Profile</h3>
            <p className="text-xs text-[var(--muted)] font-bold mb-4">
              Default Chomper, Twitter photo, or one of your synced NFTs.
            </p>

            <button
              type="button"
              onClick={() => {
                setPendingSource("default");
                setPendingTokenId(null);
              }}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 mb-3 transition-colors ${
                pendingSource === "default"
                  ? "border-[var(--green)] bg-[var(--green)]/10"
                  : "border-gray-700"
              }`}
            >
              <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-[var(--green)] shrink-0 bg-[#c9d0b6]">
                <UserAvatar src={DEFAULT_CHOMPER} alt="Default Chomper" size={48} className="object-contain p-1" />
              </div>
              <div className="text-left">
                <p className="text-sm font-black">Default Chomper</p>
                <p className="text-[10px] text-[var(--muted)] font-bold">Original game avatar</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setPendingSource("twitter");
                setPendingTokenId(null);
              }}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 mb-3 transition-colors ${
                pendingSource === "twitter"
                  ? "border-[var(--green)] bg-[var(--green)]/10"
                  : "border-gray-700"
              }`}
            >
              <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-[var(--green)] shrink-0">
                <UserAvatar
                  src={player.profilePicUrl || DEFAULT_CHOMPER}
                  alt="Twitter profile"
                  size={48}
                />
              </div>
              <div className="text-left">
                <p className="text-sm font-black">Twitter Profile</p>
                <p className="text-[10px] text-[var(--muted)] font-bold">{player.twitterHandle}</p>
              </div>
            </button>

            {player.nfts.length > 0 ? (
              <div className="grid grid-cols-3 gap-2 mb-4">
                {player.nfts.map((nft) => {
                  const selected = pendingSource === "nft" && pendingTokenId === nft.tokenId;
                  return (
                    <button
                      key={nft.tokenId}
                      type="button"
                      onClick={() => {
                        setPendingSource("nft");
                        setPendingTokenId(nft.tokenId);
                      }}
                      className={`rounded-xl border-2 overflow-hidden p-1 ${
                        selected ? "border-[var(--green)]" : "border-gray-700"
                      }`}
                    >
                      <div className="relative aspect-square rounded-lg overflow-hidden bg-[#c9d0b6] flex items-center justify-center">
                        <UserAvatar
                          src={nftImage(nft)}
                          alt={`NFT #${nft.tokenId}`}
                          size={64}
                          className="object-contain p-1"
                        />
                      </div>
                      <p className="text-[10px] font-black mt-1">#{nft.tokenId}</p>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-[var(--muted)] font-bold mb-4">
                Sync NFTs from the header to use an NFT as your profile.
              </p>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="btn-secondary flex-1 py-2 text-sm min-h-0"
                disabled={busy}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={save}
                disabled={busy || (pendingSource === "nft" && pendingTokenId == null)}
                className="btn-primary flex-1 py-2 text-sm min-h-0 disabled:opacity-50"
              >
                {busy ? <Spinner size="sm" /> : "Save"}
              </button>
            </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
