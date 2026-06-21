"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "chomperz_pwa_install_dismissed";

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIos(): boolean {
  if (typeof window === "undefined") return false;
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosTip, setShowIosTip] = useState(false);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    if (isStandalone() || sessionStorage.getItem(DISMISS_KEY) === "1") return;

    if (isIos()) {
      setShowIosTip(true);
      setHidden(false);
      return;
    }

    function onBeforeInstall(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setHidden(false);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  function dismiss() {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setHidden(true);
  }

  async function install() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    dismiss();
  }

  if (hidden) return null;

  return (
    <div
      role="dialog"
      aria-label="Install ChomperZ app"
      className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] inset-x-3 z-[60] lg:bottom-6 lg:inset-x-auto lg:right-6 lg:max-w-sm"
    >
      <div className="game-bottom-nav-glass p-3 shadow-2xl">
        <p className="text-xs font-black text-white mb-1">Install ChomperZ</p>
        <p className="text-[11px] text-[var(--muted)] font-bold leading-snug mb-3">
          {showIosTip
            ? "Tap Share, then Add to Home Screen for the full app experience."
            : "Add to your home screen for faster access and fullscreen play."}
        </p>
        <div className="flex gap-2">
          {!showIosTip && deferredPrompt ? (
            <button type="button" onClick={install} className="btn-primary flex-1 text-xs py-2 min-h-0">
              Install
            </button>
          ) : null}
          <button
            type="button"
            onClick={dismiss}
            className="btn-secondary flex-1 text-xs py-2 min-h-0"
          >
            {showIosTip && !deferredPrompt ? "Got it" : "Later"}
          </button>
        </div>
      </div>
    </div>
  );
}
