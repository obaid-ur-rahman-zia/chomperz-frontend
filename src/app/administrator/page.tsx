"use client";

import { useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { toast } from "@/lib/toast";
import { Spinner } from "@/components/Loading";

type RarityTier = "common" | "uncommon" | "rare" | "legendary";

type SkillId = "woodcutting" | "mining" | "carpentry" | "smithing";

interface CollectionConfig {
  contractAddress: string;
  crownBindings: { plotId: number; tokenId: number }[];
  rarityOverrides: { tokenId: number; rarity: RarityTier }[];
}

const RARITIES: RarityTier[] = ["common", "uncommon", "rare", "legendary"];

const ITEMS = [
  { id: "wood", label: "Wood" },
  { id: "ore", label: "Iron Ore" },
  { id: "plank", label: "Plank" },
  { id: "ingot", label: "Iron Bar" },
] as const;

const SKILLS: { id: SkillId; label: string }[] = [
  { id: "woodcutting", label: "Woodcutting" },
  { id: "mining", label: "Mining" },
  { id: "carpentry", label: "Carpentry" },
  { id: "smithing", label: "Smithing" },
];

const inputClass =
  "w-full bg-black/30 border border-[#3a453d] rounded-lg px-3 py-2 text-sm font-bold text-white outline-none focus:border-[var(--gold)]";

export default function AdministratorPage() {
  const [secret, setSecret] = useState("");
  const [handle, setHandle] = useState("");

  const [coins, setCoins] = useState("100");
  const [zCoins, setZCoins] = useState("100");
  const [itemQty, setItemQty] = useState<Record<string, string>>({
    wood: "0",
    ore: "0",
    plank: "0",
    ingot: "0",
  });
  const [skillLevel, setSkillLevel] = useState<Record<SkillId, string>>({
    woodcutting: "",
    mining: "",
    carpentry: "",
    smithing: "",
  });

  const [busy, setBusy] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<string | null>(null);

  const [config, setConfig] = useState<CollectionConfig | null>(null);
  const [crownInputs, setCrownInputs] = useState<string[]>(() => Array.from({ length: 10 }, () => ""));
  const [rarityTokenId, setRarityTokenId] = useState("");
  const [rarityTier, setRarityTier] = useState<RarityTier>("legendary");

  function requireAuthFields(): boolean {
    if (!secret.trim()) {
      toast.error("Enter admin secret first");
      return false;
    }
    if (!handle.trim()) {
      toast.error("Enter a Twitter handle first");
      return false;
    }
    return true;
  }

  async function grantCurrency(e: React.FormEvent) {
    e.preventDefault();
    if (!requireAuthFields()) return;
    setBusy("currency");
    setLastResult(null);
    try {
      const res = await apiFetch<{
        handle: string;
        granted: { coins: number; zCoins: number };
      }>("/api/admin/grant", {
        method: "POST",
        body: JSON.stringify({
          secret,
          handle,
          coins: Number(coins) || 0,
          zCoins: Number(zCoins) || 0,
        }),
      });
      const msg = `${res.handle}: +${res.granted.coins} coins, +${res.granted.zCoins} Z-Coins`;
      setLastResult(msg);
      toast.success(msg);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Grant failed");
    } finally {
      setBusy(null);
    }
  }

  async function grantItems() {
    if (!requireAuthFields()) return;
    const items: Record<string, number> = {};
    for (const item of ITEMS) {
      const qty = Number(itemQty[item.id]) || 0;
      if (qty > 0) items[item.id] = qty;
    }
    if (Object.keys(items).length === 0) {
      toast.error("Enter quantity for at least one item");
      return;
    }
    setBusy("items");
    try {
      const res = await apiFetch<{ handle: string; balances: Record<string, number> }>(
        "/api/admin/grant-items",
        {
          method: "POST",
          body: JSON.stringify({ secret, handle, items }),
        }
      );
      const summary = Object.entries(items)
        .map(([id, qty]) => `${qty} ${id}`)
        .join(", ");
      const msg = `${res.handle}: granted ${summary}`;
      setLastResult(msg);
      toast.success(msg);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Item grant failed");
    } finally {
      setBusy(null);
    }
  }

  async function grantSkills() {
    if (!requireAuthFields()) return;
    const skills: Partial<Record<SkillId, { level: number }>> = {};
    for (const skill of SKILLS) {
      const levelRaw = skillLevel[skill.id].trim();
      if (!levelRaw) continue;
      const level = Number(levelRaw);
      if (!Number.isInteger(level) || level < 1 || level > 100) {
        toast.error(`${skill.label} level must be 1–100`);
        return;
      }
      skills[skill.id] = { level };
    }
    if (Object.keys(skills).length === 0) {
      toast.error("Set level for at least one skill");
      return;
    }
    setBusy("skills");
    try {
      const res = await apiFetch<{ handle: string; skills: Record<string, { level: number; xp: number }> }>(
        "/api/admin/grant-skills",
        {
          method: "POST",
          body: JSON.stringify({ secret, handle, skills }),
        }
      );
      const summary = Object.entries(res.skills)
        .map(([id, s]) => `${id} L${s.level} (${s.xp} XP)`)
        .join(", ");
      const msg = `${res.handle}: ${summary}`;
      setLastResult(msg);
      toast.success(msg);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Skill grant failed");
    } finally {
      setBusy(null);
    }
  }

  function applyConfigToInputs(next: CollectionConfig) {
    setConfig(next);
    const inputs = Array.from({ length: 10 }, () => "");
    for (const b of next.crownBindings) {
      if (b.plotId >= 0 && b.plotId <= 9) {
        inputs[b.plotId] = String(b.tokenId);
      }
    }
    setCrownInputs(inputs);
  }

  async function loadConfig() {
    if (!secret.trim()) {
      toast.error("Enter admin secret first");
      return;
    }
    setBusy("config-load");
    try {
      const res = await apiFetch<{ config: CollectionConfig }>("/api/admin/collection-config", {
        method: "POST",
        body: JSON.stringify({ secret }),
      });
      applyConfigToInputs(res.config);
      toast.success("Collection config loaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load config");
    } finally {
      setBusy(null);
    }
  }

  async function saveAllCrownBindings() {
    if (!secret.trim()) {
      toast.error("Enter admin secret first");
      return;
    }
    setBusy("crown-all");
    try {
      let nextConfig: CollectionConfig | null = config;
      for (let plotId = 0; plotId < 10; plotId++) {
        const raw = crownInputs[plotId]?.trim();
        const endpoint = raw
          ? "/api/admin/collection-config/crown"
          : "/api/admin/collection-config/crown/clear";
        const body = raw
          ? { secret, plotId, tokenId: parseInt(raw, 10) }
          : { secret, plotId };
        if (raw) {
          const tokenId = parseInt(raw, 10);
          if (!Number.isInteger(tokenId) || tokenId < 1) {
            throw new Error(`Plot #${String(plotId + 1).padStart(2, "0")}: invalid token ID`);
          }
        }
        const res = await apiFetch<{ config: CollectionConfig }>(endpoint, {
          method: "POST",
          body: JSON.stringify(body),
        });
        nextConfig = res.config;
      }
      if (nextConfig) applyConfigToInputs(nextConfig);
      await apiFetch<{ config: CollectionConfig }>("/api/admin/collection-config/reconcile", {
        method: "POST",
        body: JSON.stringify({ secret }),
      });
      toast.success("All crown bindings saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save crown bindings");
    } finally {
      setBusy(null);
    }
  }

  async function saveRarityOverride() {
    if (!secret.trim()) {
      toast.error("Enter admin secret first");
      return;
    }
    const tokenId = parseInt(rarityTokenId, 10);
    if (!Number.isInteger(tokenId) || tokenId < 1) {
      toast.error("Enter a valid token ID");
      return;
    }
    setBusy("rarity");
    try {
      const res = await apiFetch<{ config: CollectionConfig }>("/api/admin/collection-config/rarity", {
        method: "POST",
        body: JSON.stringify({ secret, tokenId, rarity: rarityTier }),
      });
      applyConfigToInputs(res.config);
      toast.success(`Token #${tokenId} → ${rarityTier}`);
      setRarityTokenId("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to set rarity");
    } finally {
      setBusy(null);
    }
  }

  const configBusy = busy?.startsWith("config") || busy === "crown-all" || busy === "rarity";

  return (
    <main className="min-h-[100dvh] bg-[#0f1411] p-4 py-6 md:py-8">
      <div className="mx-auto w-full max-w-5xl space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-[var(--green)]">Administrator</h1>
            <p className="text-xs text-[var(--muted)] font-bold mt-1 max-w-xl">
              Grant currency, skill materials, skill levels, and manage crown plot config — all from one screen.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="text-xs text-[var(--muted)] font-bold hover:text-white shrink-0"
          >
            ← Back to game
          </Link>
        </div>

        <div className="card grid gap-3 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="text-xs font-bold text-gray-400">Admin secret</span>
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              className={`mt-1 ${inputClass}`}
              autoComplete="off"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs font-bold text-gray-400">Player Twitter handle</span>
            <input
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="@username"
              className={`mt-1 ${inputClass}`}
            />
          </label>
        </div>

        {lastResult && (
          <p className="text-sm font-bold text-[var(--green)] bg-black/25 rounded-xl p-3 border border-[var(--green)]/30">
            {lastResult}
          </p>
        )}

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-4">
            <section className="card space-y-3">
              <h2 className="text-base font-black text-[var(--gold)]">Currency</h2>
              <form onSubmit={grantCurrency} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-xs font-bold text-gray-400">Coins</span>
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={coins}
                      onChange={(e) => setCoins(e.target.value)}
                      className={`mt-1 ${inputClass}`}
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-bold text-gray-400">Z-Coins</span>
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={zCoins}
                      onChange={(e) => setZCoins(e.target.value)}
                      className={`mt-1 ${inputClass}`}
                    />
                  </label>
                </div>
                <button
                  type="submit"
                  disabled={busy === "currency"}
                  className="btn-primary w-full py-2.5 text-sm disabled:opacity-50"
                >
                  {busy === "currency" ? <Spinner size="sm" /> : "Grant Currency"}
                </button>
              </form>
            </section>

            <section className="card space-y-3">
              <h2 className="text-base font-black text-[var(--gold)]">Skill Materials</h2>
              <p className="text-[10px] text-[var(--muted)] font-bold">
                Wood, ore, plank, and iron bar inventory items.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {ITEMS.map((item) => (
                  <label key={item.id} className="block">
                    <span className="text-xs font-bold text-gray-400">{item.label}</span>
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={itemQty[item.id]}
                      onChange={(e) =>
                        setItemQty((prev) => ({ ...prev, [item.id]: e.target.value }))
                      }
                      className={`mt-1 ${inputClass}`}
                    />
                  </label>
                ))}
              </div>
              <button
                type="button"
                onClick={grantItems}
                disabled={busy === "items"}
                className="btn-secondary w-full py-2.5 text-sm disabled:opacity-50"
              >
                {busy === "items" ? <Spinner size="sm" /> : "Grant Items"}
              </button>
            </section>

            <section className="card space-y-3">
              <h2 className="text-base font-black text-[var(--gold)]">Skill Levels</h2>
              <p className="text-[10px] text-[var(--muted)] font-bold">
                Set level (1–100) per skill. XP resets to 0 at that level automatically.
              </p>
              <div className="space-y-2">
                {SKILLS.map((skill) => (
                  <div key={skill.id} className="grid grid-cols-[1fr_5rem] gap-2 items-end">
                    <span className="text-xs font-bold text-gray-300 pb-2">{skill.label}</span>
                    <label className="block">
                      <span className="text-[10px] font-bold text-gray-500">Level</span>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        placeholder="—"
                        value={skillLevel[skill.id]}
                        onChange={(e) =>
                          setSkillLevel((prev) => ({ ...prev, [skill.id]: e.target.value }))
                        }
                        className={`mt-0.5 ${inputClass}`}
                      />
                    </label>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={grantSkills}
                disabled={busy === "skills"}
                className="btn-secondary w-full py-2.5 text-sm disabled:opacity-50"
              >
                {busy === "skills" ? <Spinner size="sm" /> : "Grant Skills"}
              </button>
            </section>
          </div>

          <section className="card space-y-4 h-fit">
            <div>
              <h2 className="text-base font-black text-[var(--gold)]">Collection Config</h2>
              <p className="text-[10px] text-[var(--muted)] font-bold mt-1 leading-relaxed">
                Crown plots #01–#10 → NFT token IDs. Rarity overrides apply on NFT sync.
              </p>
              {config?.contractAddress && (
                <p className="text-[10px] text-[var(--muted)] font-mono mt-2 truncate">
                  {config.contractAddress}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={loadConfig}
              disabled={Boolean(configBusy)}
              className="btn-secondary w-full py-2 text-sm disabled:opacity-50"
            >
              {busy === "config-load" ? <Spinner size="sm" /> : "Load Config"}
            </button>

            <div>
              <p className="stat-label mb-2">Crown plot bindings</p>
              <div className="grid grid-cols-2 gap-2">
                {Array.from({ length: 10 }, (_, plotId) => (
                  <div key={plotId} className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-[var(--gold)] w-8 shrink-0">
                      #{String(plotId + 1).padStart(2, "0")}
                    </span>
                    <input
                      type="number"
                      min={1}
                      placeholder="Token"
                      value={crownInputs[plotId]}
                      onChange={(e) => {
                        const next = [...crownInputs];
                        next[plotId] = e.target.value;
                        setCrownInputs(next);
                      }}
                      className={`flex-1 min-w-0 ${inputClass} py-1.5 text-xs`}
                    />
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={saveAllCrownBindings}
                disabled={Boolean(configBusy)}
                className="btn-primary w-full py-2 text-sm mt-3 disabled:opacity-50"
              >
                {busy === "crown-all" ? <Spinner size="sm" /> : "Save All Crown Bindings"}
              </button>
            </div>

            <div className="border-t border-white/10 pt-4 space-y-2">
              <p className="stat-label">Rarity override</p>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={1}
                  placeholder="Token ID"
                  value={rarityTokenId}
                  onChange={(e) => setRarityTokenId(e.target.value)}
                  className={`flex-1 ${inputClass}`}
                />
                <select
                  value={rarityTier}
                  onChange={(e) => setRarityTier(e.target.value as RarityTier)}
                  className="bg-black/30 border border-[#3a453d] rounded-lg px-2 py-2 text-sm font-bold text-white outline-none"
                >
                  {RARITIES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={saveRarityOverride}
                disabled={Boolean(configBusy)}
                className="btn-secondary w-full py-2 text-sm disabled:opacity-50"
              >
                {busy === "rarity" ? <Spinner size="sm" /> : "Set Rarity Override"}
              </button>

              {config && config.rarityOverrides.length > 0 && (
                <div className="text-[10px] font-bold text-[var(--muted)] space-y-0.5 max-h-28 overflow-y-auto">
                  {config.rarityOverrides.map((r) => (
                    <p key={r.tokenId}>
                      #{r.tokenId} → {r.rarity}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
