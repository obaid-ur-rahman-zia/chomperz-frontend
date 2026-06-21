"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
} from "react";
import {
  BoltIcon,
  EditIcon,
  ShopIcon,
  SwordIcon,
} from "@/components/Icons";
import {
  apiFetch,
  type ActiveSkillsState,
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
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    setSkills(initial);
  }, [initial]);

  const refreshSkills = useCallback(async () => {
    try {
      const data = await apiFetch<ActiveSkillsState>("/api/player/skills");
      setSkills(data);
    } catch {
      /* ignore poll errors */
    }
  }, []);

  useEffect(() => {
    function onPageRefresh() {
      void refreshSkills();
      void onRefresh();
    }
    window.addEventListener("chomperz:page-refresh", onPageRefresh);
    return () => window.removeEventListener("chomperz:page-refresh", onPageRefresh);
  }, [refreshSkills, onRefresh]);

  const [tickNow, setTickNow] = useState(() => Date.now());
  const syncedCycleRef = useRef(0);

  const runningDisplay = useMemo(() => {
    if (
      skills.action.state !== "running" ||
      !skills.action.startedAt ||
      !skills.action.durationMs
    ) {
      return null;
    }

    const started = new Date(skills.action.startedAt).getTime();
    const duration = skills.action.durationMs;
    const elapsed = Math.max(0, tickNow - started);
    const inCycle = elapsed % duration;
    const remaining = duration - inCycle;

    return {
      progressPct: Math.min(100, Math.round((inCycle / duration) * 100)),
      secondsRemaining: Math.max(1, Math.ceil(remaining / 1000)),
    };
  }, [skills.action, tickNow]);

  useEffect(() => {
    syncedCycleRef.current = 0;
  }, [skills.action.startedAt]);

  useEffect(() => {
    if (
      skills.action.state !== "running" ||
      !skills.action.startedAt ||
      !skills.action.durationMs
    ) {
      return;
    }

    const started = new Date(skills.action.startedAt).getTime();
    const duration = skills.action.durationMs;

    const id = setInterval(() => {
      const now = Date.now();
      setTickNow(now);

      const completedCycles = Math.floor((now - started) / duration);
      if (completedCycles > syncedCycleRef.current) {
        syncedCycleRef.current = completedCycles;
        void refreshSkills();
      }
    }, 100);

    return () => clearInterval(id);
  }, [
    skills.action.state,
    skills.action.startedAt,
    skills.action.durationMs,
    refreshSkills,
  ]);

  async function handleSelect(skillId: string) {
    setBusy("select");
    try {
      const data = await apiFetch<ActiveSkillsState>("/api/player/skills/select", {
        method: "POST",
        body: JSON.stringify({ skill: skillId }),
      });
      setSkills(data);
      await onRefresh();
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
      await onRefresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to start action");
    } finally {
      setBusy(null);
    }
  }

  async function handleStop() {
    setBusy("stop");
    try {
      const data = await apiFetch<ActiveSkillsState>("/api/player/skills/stop", {
        method: "POST",
      });
      setSkills(data);
      await onRefresh();
      toast.success("Skill stopped");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to stop action");
    } finally {
      setBusy(null);
    }
  }

  const selected = skills.selected;
  const isRunning = skills.action.state === "running";
  const needsInput = (selected.inputQuantity ?? 0) > 0;
  const hasInput = !needsInput || (selected.inputQty ?? 0) >= (selected.inputQuantity ?? 0);

  return (
    <div className="card flex flex-col gap-3 md:gap-4">
      <div className="flex items-start justify-between gap-2">
        <h3 className="stat-label mb-0.5">Active Skills</h3>
      </div>

      <div className="grid grid-cols-2 gap-2 md:gap-3">
        {skills.skills.map((skill) => {
          const Icon = SKILL_ICONS[skill.id] ?? BoltIcon;
          const active = skills.selectedSkill === skill.id;
          return (
            <button
              key={skill.id}
              type="button"
              onClick={() => handleSelect(skill.id)}
              disabled={busy !== null}
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
              <span className="text-[9px] text-gray-500 font-bold">Lvl {skill.level}</span>
            </button>
          );
        })}
      </div>

      <div className="flex justify-between items-center bg-dark-card p-2.5 md:p-3 rounded-lg border border-gray-800">
        <div className="font-bold text-gray-300 text-xs md:text-sm">
          Lvl: <span className="text-[var(--green)] text-sm md:text-base">{selected.level}</span>
        </div>
        <div className="text-[10px] md:text-xs text-gray-400 font-bold">
          XP {selected.xp} / {selected.xpToNext}
        </div>
      </div>

      <div className="bg-dark-card p-2.5 md:p-3 rounded-lg border border-gray-800 flex flex-col gap-1.5 md:gap-2">
        <div className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-wider">
          Action Rewards
        </div>
        <p className="text-[10px] text-gray-500 font-bold">
          Action time: {selected.actionDurationSec ?? selected.actionDurationMs! / 1000}s · runs continuously
        </p>
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
        {needsInput && (
          <p className="text-[10px] text-gray-400 font-bold">
            Requires {selected.inputQuantity} {selected.inputItemId} per action (have{" "}
            {selected.inputQty ?? 0})
          </p>
        )}
      </div>

      <div className="game-inset p-3 md:p-4 rounded-lg flex flex-col gap-3 md:gap-4">
        {!isRunning ? (
          <button
            type="button"
            onClick={handleStart}
            disabled={busy !== null || !hasInput}
            className="w-full btn-primary py-2.5 md:py-3 text-xs md:text-sm uppercase tracking-wide disabled:opacity-50 shadow-[0_0_10px_rgba(34,197,94,0.2)]"
          >
            {busy === "start" ? <Spinner size="sm" /> : "Start Action"}
          </button>
        ) : (
          <>
            {/* <p className="text-center text-xs font-bold text-[var(--green)]">
              Running continuously — rewards apply automatically
            </p> */}
            <button
              type="button"
              onClick={handleStop}
              disabled={busy !== null}
              className="w-full btn-danger py-2.5 md:py-3 text-xs md:text-sm uppercase tracking-wide disabled:opacity-50"
            >
              {busy === "stop" ? <Spinner size="sm" /> : "Stop Action"}
            </button>
          </>
        )}

        <div className="flex justify-center items-center font-medium text-gray-400 text-[10px] md:text-xs gap-1.5">
          <span>{selected.rewardItemLabel} in Inventory:</span>
          <span className="text-gray-200 font-bold text-xs md:text-sm bg-gray-800 px-1.5 py-0.5 rounded border border-gray-700">
            {selected.inventoryQty}
          </span>
        </div>

        {isRunning && (
          <div className="pt-2 md:pt-3 border-t border-gray-800/80">
            <div className="flex justify-between items-end mb-1.5 md:mb-2">
              <div className="text-[var(--green)] text-[9px] md:text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[var(--green)] rounded-full animate-pulse" />
                Running
              </div>
              <div className="text-xs md:text-sm font-mono font-bold text-gray-400">
                {(runningDisplay ?? skills.action).secondsRemaining}s
              </div>
            </div>
            <div className="w-full game-progress-track rounded-full h-2 md:h-3 relative overflow-hidden">
              <div
                className="game-progress-fill h-full rounded-full relative overflow-hidden"
                style={{ width: `${(runningDisplay ?? skills.action).progressPct}%` }}
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
