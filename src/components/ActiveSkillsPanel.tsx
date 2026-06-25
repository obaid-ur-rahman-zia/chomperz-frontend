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
import { apiFetch, type ActiveSkillsState } from "@/lib/api";
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
      /* ignore */
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
    return {
      progressPct: Math.min(100, Math.round((inCycle / duration) * 100)),
      secondsRemaining: Math.max(1, Math.ceil((duration - inCycle) / 1000)),
    };
  }, [skills.action, tickNow]);

  useEffect(() => {
    syncedCycleRef.current = 0;
  }, [skills.action.startedAt]);

  useEffect(() => {
    if (skills.action.state !== "running" || !skills.action.startedAt || !skills.action.durationMs) {
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
  }, [skills.action.state, skills.action.startedAt, skills.action.durationMs, refreshSkills]);

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
  const progress = runningDisplay?.progressPct ?? 0;
  const secondsRemaining = runningDisplay?.secondsRemaining ?? skills.action.secondsRemaining;
  const rewardLabel = selected.rewardItemLabel.replace(/s$/i, "") || selected.rewardItemLabel;

  return (
    <SlicedPanel
      src={SLICING.mainMenu.activeSkillPanel}
      padding={SLICING.dashboardInsets.activeSkills}
      fit="content"
    >
      <div className="flex flex-col gap-1 md:gap-1.5">
        <div className="grid grid-cols-4 gap-1 shrink-0 max-md:h-[4rem]">
          {skills.skills.map((skill) => {
            const active = skills.selectedSkill === skill.id;
            const iconSrc = SKILL_ICONS[skill.id] ?? SLICING.assets.mining;
            return (
              <button
                key={skill.id}
                type="button"
                onClick={() => handleSelect(skill.id)}
                disabled={busy !== null}
                className="relative h-full w-full disabled:opacity-50 active:scale-95 transition-transform"
              >
                <Image
                  src={active ? SLICING.mainMenu.skillImageBgSelected : SLICING.mainMenu.skillImageBg}
                  alt=""
                  fill
                  className="object-fill"
                  unoptimized
                />
                <div className="absolute inset-[12%] flex items-center justify-center">
                  <Image src={iconSrc} alt="" width={40} height={40} className="w-full h-full object-contain" unoptimized />
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-2 shrink-0">
          <span className="text-white text-[10px] md:text-xs font-black drop-shadow">
            Lvl : <span className="text-[#4ade80]">{selected.level}</span>
          </span>
          <Link href="/skills" className="no-underline shrink-0">
            <SlicedActionButton src={SLICING.mainMenu.button} className="h-7 min-w-[4.5rem]">
              Upgrade
            </SlicedActionButton>
          </Link>
        </div>

        <div className="relative w-full h-10 md:h-12 shrink-0">
          <Image
            src={SLICING.mainMenu.levelActionReward}
            alt=""
            width={400}
            height={48}
            className="w-full h-full object-fill"
            unoptimized
          />
          <div className="absolute inset-0 flex flex-col justify-center px-2 py-1 pointer-events-none">
            <p className="text-[8px] font-black text-[#c4b5a0] uppercase text-center mb-0.5">
              Action Reward
            </p>
            <div className="grid grid-cols-2 gap-x-2 text-[9px] md:text-[10px] font-bold px-1">
              <div className="flex justify-between text-white">
                <span>{rewardLabel}</span>
                <span className="text-[#4ade80]">{selected.successPct}%</span>
              </div>
              <div className="flex justify-between text-white">
                <span>Fail</span>
                <span className="text-red-400">{selected.failPct}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="shrink-0">
          {!isRunning ? (
            <SlicedActionButton
              src={SLICING.mainMenu.progressiveButton}
              onClick={handleStart}
              disabled={busy !== null || !hasInput}
              className="flex w-full h-8 md:h-10"
            >
              {busy === "start" ? <Spinner size="sm" /> : "Start Action"}
            </SlicedActionButton>
          ) : (
            <SlicedActionButton
              src={SLICING.mainMenu.progressiveButton}
              onClick={handleStop}
              disabled={busy !== null}
              className="flex w-full h-8 md:h-10 opacity-90"
            >
              {busy === "stop" ? <Spinner size="sm" /> : "Stop Action"}
            </SlicedActionButton>
          )}
        </div>

        <div className="shrink-0 space-y-1">
          <div className="relative w-full h-6">
            <Image
              src={SLICING.mainMenu.woodInventoryBar}
              alt=""
              fill
              className="object-fill"
              unoptimized
            />
            <div className="absolute inset-0 flex items-center justify-between px-2 text-[8px] md:text-[9px] font-black text-white">
              <span className="flex items-center gap-1">
                {isRunning ? (
                  <>
                    <StatusDot />
                    Running
                  </>
                ) : (
                  <>{rewardLabel} In Inventory : {selected.inventoryQty}</>
                )}
              </span>
              <span className="tabular-nums">
                {isRunning ? `${secondsRemaining}s` : null}
              </span>
            </div>
          </div>
          {isRunning && <SlicedProgressBar progress={progress} />}
        </div>
      </div>
    </SlicedPanel>
  );
}
