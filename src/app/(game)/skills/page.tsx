"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { SlicedPage, SlicedPanel, SlicedSubTabs, SlicedActionButton } from "@/components/sliced";
import { SLICING, SKILL_ICONS } from "@/lib/slicing-paths";
import { apiFetch, type ActiveSkillsState, type ActiveSkillEntry } from "@/lib/api";
import { toast } from "@/lib/toast";
import { SkillsSkeleton } from "@/components/Loading";
import { usePlayer } from "@/hooks/usePlayer";

const GATHERING_SKILLS = ["woodcutting", "mining"];
const REFINING_SKILLS = ["carpentry", "smithing"];

const SKILL_LABELS: Record<string, string> = {
  woodcutting: "Wood Cutting",
  mining: "Mining",
  carpentry: "Carpentry",
  smithing: "Smithing",
};

function SkillCard({
  skill,
  onLevelUp,
  busy,
}: {
  skill: ActiveSkillEntry;
  onLevelUp: (id: string) => void;
  busy: boolean;
}) {
  const iconSrc = SKILL_ICONS[skill.id] ?? SLICING.assets.mining;
  const durationSec = skill.actionDurationMs ? skill.actionDurationMs / 1000 : 10;
  const yieldLabel =
    skill.id === "mining"
      ? "1 Ore/Action"
      : skill.id === "woodcutting"
        ? "1 wood/Action"
        : skill.id === "carpentry"
          ? "1 Plank/Action"
          : "1 Bar/Action";

  return (
    <div className="relative w-full">
      <Image
        src={SLICING.skills.panel}
        alt=""
        width={400}
        height={280}
        className="w-full h-auto pointer-events-none"
        unoptimized
      />
      <div className="absolute inset-0 flex flex-col p-3 md:p-4">
        <h3 className="sliced-title text-center text-sm md:text-base text-[#f5d76e] font-black mb-2">
          {SKILL_LABELS[skill.id] ?? skill.label}
        </h3>
        <div className="flex gap-2 md:gap-3 flex-1 min-h-0">
          <div className="relative w-20 md:w-24 shrink-0">
            <Image
              src={SLICING.skills.assetPane}
              alt=""
              fill
              className="object-fill"
              unoptimized
            />
            <div className="absolute inset-2 flex items-center justify-center">
              <Image
                src={iconSrc}
                alt=""
                width={48}
                height={48}
                className="w-10 h-10 md:w-12 md:h-12 object-contain"
                unoptimized
              />
            </div>
          </div>
          <div
            className="relative flex-1 min-w-0"
            style={{
              backgroundImage: `url("${SLICING.skills.detailPanel}")`,
              backgroundSize: "100% 100%",
            }}
          >
            <div className="p-2 text-[10px] md:text-xs font-bold text-white space-y-1">
              <div className="flex justify-between">
                <span className="text-[#c4b5a0]">Swing Speed</span>
                <span>{durationSec.toFixed(1)}s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#c4b5a0]">Yield</span>
                <span className="text-[#4ade80]">{yieldLabel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#c4b5a0]">Current Level</span>
                <span>{skill.level}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#c4b5a0]">Cost</span>
                <span className="flex items-center gap-1 text-[#facc15]">
                  <Image src={SLICING.mainMenu.simpleCoin} alt="" width={14} height={14} className="w-3.5 h-3.5" unoptimized />
                  {skill.upgradeCost ?? Math.max(2, skill.level * 2)} Coins
                </span>
              </div>
            </div>
          </div>
        </div>
        <SlicedActionButton
          src={SLICING.mainMenu.progressiveButton}
          onClick={() => onLevelUp(skill.id)}
          disabled={busy}
          className="w-full h-9 md:h-10 mt-2"
        >
          Level up
        </SlicedActionButton>
      </div>
    </div>
  );
}

export default function SkillsPage() {
  const { refresh } = usePlayer();
  const [tab, setTab] = useState("gathering");
  const [skills, setSkills] = useState<ActiveSkillsState | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await apiFetch<ActiveSkillsState>("/api/player/skills");
      setSkills(data);
    } catch {
      setSkills(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleLevelUp(skillId: string) {
    setBusy(true);
    try {
      const data = await apiFetch<ActiveSkillsState & { coins?: number }>("/api/player/skills/upgrade", {
        method: "POST",
        body: JSON.stringify({ skill: skillId }),
      });
      setSkills(data);
      await refresh({ silent: true });
      toast.success(`${SKILL_LABELS[skillId] ?? "Skill"} leveled up!`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to level up skill");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <SkillsSkeleton />;

  const visibleIds = tab === "gathering" ? GATHERING_SKILLS : REFINING_SKILLS;
  const visibleSkills =
    skills?.skills.filter((s) => visibleIds.includes(s.id)) ?? [];

  return (
    <SlicedPage bg={SLICING.skills.bg}>
      <SlicedSubTabs
        tabs={[
          { id: "gathering", label: "Gathering" },
          { id: "refining", label: "Refining" },
        ]}
        active={tab}
        onChange={setTab}
        className="mb-4"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        {visibleSkills.map((skill) => (
          <SkillCard key={skill.id} skill={skill} onLevelUp={handleLevelUp} busy={busy} />
        ))}
      </div>

      <p className="text-center mt-4">
        <Link href="/dashboard" className="text-[#4ade80] text-sm font-bold no-underline hover:underline">
          ← Back to Home
        </Link>
      </p>
    </SlicedPage>
  );
}
