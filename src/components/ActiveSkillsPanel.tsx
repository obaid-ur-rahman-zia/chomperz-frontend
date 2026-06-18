"use client";

import { useCallback, useEffect, useState, type ComponentType } from "react";
import {
  BoltIcon,
  EditIcon,
  ShopIcon,
  SpeedIcon,
  SwordIcon,
} from "@/components/Icons";
import {
  apiFetch,
  type ActiveSkillsState,
  type ActionStatus,
} from "@/lib/api";
import { toast } from "@/lib/toast";
import { Spinner } from "@/components/Loading";

const SKILL_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  woodcutting: SwordIcon,
  mining: BoltIcon,
  carpentry: EditIcon,
  smithing: ShopIcon,
};

interface ActiveSkillsPanelProps {
  initial: ActiveSkillsState;
  onRefresh: () => Promise<void>;
}

export function ActiveSkillsPanel({ initial, onRefresh }: ActiveSkillsPanelProps) {
  const [skills, setSkills] = useState(initial);
  const [action, setAction] = useState<ActionStatus>(initial.action);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    setSkills(initial);
    setAction(initial.action);
  }, [initial]);

  const pollStatus = useCallback(async () => {
    try {
      const status = await apiFetch<ActionStatus>("/api/player/skills/status");
      setAction(status);
    } catch {
      /* ignore poll errors */
    }
  }, []);

  useEffect(() => {
    if (action.state !== "running") return;
    const id = setInterval(pollStatus, 1000);
    return () => clearInterval(id);
  }, [action.state, pollStatus]);

  async function handleSelect(skillId: string) {
    if (action.state === "running") return;
    setBusy("select");
    try {
      const data = await apiFetch<ActiveSkillsState>("/api/player/skills/select", {
        method: "POST",
        body: JSON.stringify({ skill: skillId }),
      });
      setSkills(data);
      setAction(data.action);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to select skill");
    } finally {
      setBusy(null);
    }
  }

  async function handleStart() {
    setBusy("start");
    try {
      const data = await apiFetch<ActiveSkillsState>("/api/player/skills/start", {
        method: "POST",
      });
      setSkills(data);
      setAction(data.action);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to start action");
    } finally {
      setBusy(null);
    }
  }

  async function handleComplete() {
    setBusy("complete");
    try {
      const data = await apiFetch<ActiveSkillsState & { result?: { success: boolean } }>(
        "/api/player/skills/complete",
        { method: "POST" }
      );
      setSkills(data);
      setAction(data.action);
      if (data.result?.success) {
        toast.success("Action complete — reward collected!");
      } else {
        toast.error("Action failed — no reward this time.");
      }
      await onRefresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to complete action");
    } finally {
      setBusy(null);
    }
  }

  async function handleUpgrade() {
    setBusy("upgrade");
    try {
      await apiFetch("/api/player/skills/upgrade", {
        method: "POST",
        body: JSON.stringify({ skill: skills.selectedSkill }),
      });
      toast.success("Skill upgraded!");
      await onRefresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upgrade failed");
    } finally {
      setBusy(null);
    }
  }

  const selected = skills.selected;
  const isRunning = action.state === "running";
  const isCompleted = action.state === "completed";

  return (
    <div className="card flex flex-col gap-3 md:gap-4">
      <h3 className="stat-label mb-0.5">Active Skills</h3>

      <div className="grid grid-cols-2 gap-2 md:gap-3">
        {skills.skills.map((skill) => {
          const Icon = SKILL_ICONS[skill.id] ?? BoltIcon;
          const active = skills.selectedSkill === skill.id;
          return (
            <button
              key={skill.id}
              type="button"
              onClick={() => handleSelect(skill.id)}
              disabled={busy !== null || isRunning}
              className={`bg-dark-card rounded-xl p-2.5 md:p-3 flex flex-col items-center justify-center gap-1.5 transition border ${
                active
                  ? "border-[var(--green)] shadow-[0_0_8px_rgba(34,197,94,0.15)]"
                  : "border-gray-800 opacity-60 hover:opacity-100 hover:border-gray-600"
              } disabled:opacity-50`}
            >
              <div className="w-10 h-10 md:w-12 md:h-12 game-inset rounded-xl flex items-center justify-center">
                <Icon className="w-6 h-6 text-gray-300" />
              </div>
              <span
                className={`text-xs md:text-sm font-bold ${active ? "text-[var(--green)]" : "text-gray-300"}`}
              >
                {skill.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex justify-between items-center bg-dark-card p-2.5 md:p-3 rounded-lg border border-gray-800">
        <div className="font-bold text-gray-300 text-xs md:text-sm">
          Lvl: <span className="text-[var(--green)] text-sm md:text-base">{selected.level}</span>
        </div>
        <button
          type="button"
          onClick={handleUpgrade}
          disabled={busy !== null}
          className="btn-secondary text-[10px] md:text-sm py-1 px-2 md:py-1.5 md:px-3 h-fit disabled:opacity-50"
        >
          Upgrade
          <span className="bg-black/30 px-1 py-0.5 rounded text-[9px] md:text-xs font-mono ml-1">
            {selected.upgradeCost}
          </span>
        </button>
      </div>

      <div className="bg-dark-card p-2.5 md:p-3 rounded-lg border border-gray-800 flex flex-col gap-1.5 md:gap-2">
        <div className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-wider">
          Action Rewards
        </div>
        <div className="grid grid-cols-2 gap-1.5 md:gap-2">
          <div className="bg-black/40 border border-green-900/50 rounded flex justify-between items-center px-2 py-1 md:px-2.5 md:py-1.5">
            <span className="text-[10px] md:text-xs text-gray-300">{selected.rewardItemLabel}</span>
            <span className="text-[10px] md:text-xs font-bold text-[var(--green)]">
              {selected.successPct}%
            </span>
          </div>
          <div className="bg-black/40 border border-red-900/50 rounded flex justify-between items-center px-2 py-1 md:px-2.5 md:py-1.5">
            <span className="text-[10px] md:text-xs text-gray-300">Fail</span>
            <span className="text-[10px] md:text-xs font-bold text-red-500">{selected.failPct}%</span>
          </div>
        </div>
      </div>

      <div className="game-inset p-3 md:p-4 rounded-lg flex flex-col gap-3 md:gap-4">
        {isCompleted ? (
          <button
            type="button"
            onClick={handleComplete}
            disabled={busy !== null}
            className="w-full btn-primary py-2.5 md:py-3 text-xs md:text-sm uppercase tracking-wide disabled:opacity-50"
          >
            {busy === "complete" ? <Spinner size="sm" /> : "Collect Reward"}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleStart}
            disabled={busy !== null || isRunning}
            className="w-full btn-primary py-2.5 md:py-3 text-xs md:text-sm uppercase tracking-wide disabled:opacity-50 shadow-[0_0_10px_rgba(34,197,94,0.2)]"
          >
            {busy === "start" ? <Spinner size="sm" /> : "Start Action"}
          </button>
        )}

        <div className="flex justify-center items-center font-medium text-gray-400 text-[10px] md:text-xs gap-1.5">
          <span>{selected.rewardItemLabel} in Inventory:</span>
          <span className="text-gray-200 font-bold text-xs md:text-sm bg-gray-800 px-1.5 py-0.5 rounded border border-gray-700">
            {selected.inventoryQty}
          </span>
        </div>

        {(isRunning || isCompleted) && (
          <div className="pt-2 md:pt-3 border-t border-gray-800/80">
            <div className="flex justify-between items-end mb-1.5 md:mb-2">
              <div className="text-[var(--green)] text-[9px] md:text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[var(--green)] rounded-full animate-pulse" />
                {isCompleted ? "Complete" : "Running"}
              </div>
              <div className="text-xs md:text-sm font-mono font-bold text-gray-400">
                {action.secondsRemaining}s
              </div>
            </div>
            <div className="w-full game-progress-track rounded-full h-2 md:h-3 relative overflow-hidden">
              <div
                className="game-progress-fill h-full rounded-full transition-all duration-1000 ease-linear relative overflow-hidden"
                style={{ width: `${action.progressPct}%` }}
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 rounded-full" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
