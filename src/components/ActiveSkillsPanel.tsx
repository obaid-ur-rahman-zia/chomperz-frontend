"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { StatusDot } from "@/components/Icons";
import {
  apiFetch,
  type ActiveSkillsState,
} from "@/lib/api";
import { toast } from "@/lib/toast";
import { Spinner } from "@/components/Loading";
import {
  SlicedPanel,
  SlicedActionButton,
  SlicedProgressBar,
} from "@/components/sliced";
import { SLICING, SKILL_ICONS } from "@/lib/slicing-paths";

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
  const progress = runningDisplay?.progressPct ?? skills.action.progressPct ?? 0;
  const secondsRemaining = runningDisplay?.secondsRemaining ?? skills.action.secondsRemaining;

  return (
    <SlicedPanel
      src={SLICING.mainMenu.activeSkillPanel}
      title="Active Skills"
      padding="14% 8% 8% 8%"
    >
      <div className="grid grid-cols-4 gap-1.5 md:gap-2 mb-2">
        {skills.skills.map((skill) => {
          const active = skills.selectedSkill === skill.id;
          const iconSrc = SKILL_ICONS[skill.id] ?? SLICING.assets.mining;
          return (
            <button
              key={skill.id}
              type="button"
              onClick={() => handleSelect(skill.id)}
              disabled={busy !== null}
              className="relative aspect-square disabled:opacity-50 transition-transform active:scale-95"
            >
              <Image
                src={active ? SLICING.mainMenu.skillImageBgSelected : SLICING.mainMenu.skillImageBg}
                alt=""
                fill
                className="object-fill"
                unoptimized
              />
              <div className="absolute inset-1 flex flex-col items-center justify-center">
                <Image
                  src={iconSrc}
                  alt={skill.label}
                  width={32}
                  height={32}
                  className="w-6 h-6 md:w-8 md:h-8 object-contain"
                  unoptimized
                />
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-white text-xs md:text-sm font-black">
          Lvl : <span className="text-[#4ade80]">{selected.level}</span>
        </span>
        <Link href="/skills" className="no-underline">
          <SlicedActionButton src={SLICING.mainMenu.button} className="h-7 md:h-8 min-w-[4.5rem]">
            Upgrade
          </SlicedActionButton>
        </Link>
      </div>

      <div
        className="relative mb-2 rounded overflow-hidden"
        style={{ backgroundImage: `url("${SLICING.mainMenu.levelActionReward}")`, backgroundSize: "100% 100%" }}
      >
        <div className="px-2 py-1.5">
          <p className="text-[9px] md:text-[10px] font-black text-[#c4b5a0] uppercase mb-1">Action Reward</p>
          <div className="grid grid-cols-2 gap-1 text-[10px] md:text-xs font-bold">
            <div className="flex justify-between text-white px-1">
              <span>{selected.rewardItemLabel}</span>
              <span className="text-[#4ade80]">{selected.successPct}%</span>
            </div>
            <div className="flex justify-between text-white px-1">
              <span>Fail</span>
              <span className="text-red-400">{selected.failPct}%</span>
            </div>
          </div>
        </div>
      </div>

      {!isRunning ? (
        <SlicedActionButton
          src={SLICING.mainMenu.progressiveButton}
          onClick={handleStart}
          disabled={busy !== null || !hasInput}
          className="w-full h-10 md:h-11 mb-2"
        >
          {busy === "start" ? <Spinner size="sm" /> : "Start Action"}
        </SlicedActionButton>
      ) : (
        <SlicedActionButton
          src={SLICING.mainMenu.button}
          onClick={handleStop}
          disabled={busy !== null}
          className="w-full h-10 md:h-11 mb-2 opacity-90"
        >
          {busy === "stop" ? <Spinner size="sm" /> : "Stop Action"}
        </SlicedActionButton>
      )}

      <div className="relative mb-1">
        <Image
          src={SLICING.mainMenu.woodInventoryBar}
          alt=""
          width={400}
          height={24}
          className="w-full h-6 object-fill"
          unoptimized
        />
        <div className="absolute inset-0 flex items-center justify-between px-3 text-[9px] md:text-[10px] font-black text-white">
          <span className="flex items-center gap-1">
            {isRunning ? (
              <>
                <StatusDot />
                Running
              </>
            ) : (
              `${selected.rewardItemLabel} In Inventory`
            )}
          </span>
          <span>
            {isRunning ? `${secondsRemaining}s` : selected.inventoryQty}
          </span>
        </div>
      </div>

      {isRunning && (
        <SlicedProgressBar progress={progress} className="mt-1" />
      )}
    </SlicedPanel>
  );
}
