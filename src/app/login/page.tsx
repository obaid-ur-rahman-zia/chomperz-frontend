"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { apiFetch, clearToken, hasSession, setToken } from "@/lib/api";
import { toast } from "@/lib/toast";
import { XIcon } from "@/components/Icons";
import { LoadingScreen, Spinner } from "@/components/Loading";
import { SlicedPanel, SlicedActionButton } from "@/components/sliced";
import { SLICING } from "@/lib/slicing-paths";

function LoginContent() {
  const searchParams = useSearchParams();
  const [mockHandle, setMockHandle] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function resumeExistingSession() {
      if (!hasSession()) return;
      try {
        await apiFetch("/api/player/me");
        window.location.replace("/dashboard");
      } catch {
        clearToken();
      }
    }

    void resumeExistingSession();

    const err = searchParams.get("error");
    const detail = searchParams.get("error_detail");
    if (err) {
      const messages: Record<string, string> = {
        twitter_not_configured: "Twitter OAuth is not configured on the server.",
        oauth_denied: "Twitter login was cancelled.",
        token_exchange_failed: "Twitter token exchange failed.",
        user_fetch_failed: "Could not fetch Twitter profile.",
        user_context_required:
          "X API rejected the login token. Re-authorize after backend deploy — old sessions may lack required scopes.",
        twitter_forbidden:
          "X API denied profile access. In Developer Portal set App permissions to Read, enable OAuth 2.0, and include tweet.read + users.read scopes.",
        invalid_state: "Invalid OAuth state. Try again.",
        server_error: "Server error during login.",
        invalid_client:
          "Wrong Client ID or Secret — use OAuth 2.0 keys from the Developer Portal, not Consumer API keys.",
        redirect_uri_mismatch:
          "Callback URL does not match the X Developer Portal. Use http://127.0.0.1:3000/api/auth/twitter/callback exactly.",
        no_token: "Sign-in completed but no session token was received. Try again.",
        callback_failed: "Could not save your session. Try signing in again.",
      };
      let msg = messages[err] || "Login failed.";
      if (detail) {
        msg += ` (${detail})`;
      }
      toast.error(msg);
    }
  }, [searchParams]);

  async function handleMockLogin() {
    if (!mockHandle.trim()) return;
    setLoading(true);
    try {
      const data = await apiFetch<{ token: string }>("/api/auth/mock-twitter", {
        method: "POST",
        body: JSON.stringify({ handle: mockHandle.trim() }),
      });
      setToken(data.token);
      toast.success("Logged in!");
      window.location.href = "/dashboard";
    } catch (e) {
      toast.error(
        e instanceof Error
          ? e.message
          : "Mock login unavailable. Use Twitter login or set MOCK_TWITTER=true on API."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="login-page flex items-center justify-center p-4 sm:p-6"
      style={{ backgroundImage: `url("${SLICING.mainMenu.bg}")` }}
    >
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-4">
          <Image
            src={SLICING.logo}
            alt="ChomperZ Idle"
            width={220}
            height={64}
            className="h-12 sm:h-14 w-auto object-contain drop-shadow-lg"
            priority
            unoptimized
          />
        </div>

        <SlicedPanel
          src={SLICING.mainMenu.characterPanel}
          padding="20% 12% 12% 12%"
          className="aspect-[4/5] sm:aspect-[5/6] max-h-[34rem]"
        >
          <div className="flex flex-col items-center h-full text-center">
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 shrink-0 mb-2">
              <Image
                src={SLICING.assets.chomperFront}
                alt="Chomper"
                fill
                className="object-contain object-bottom drop-shadow-[0_4px_8px_rgba(0,0,0,0.35)]"
                priority
                unoptimized
              />
            </div>

            <h1 className="sliced-title text-xl sm:text-2xl font-black text-white mb-1">
              CHOMPERZ
            </h1>
            <p className="text-[#5c4a32] text-xs sm:text-sm font-bold mb-3">
              Sign in to start farming Z-Coins
            </p>

            <div className="flex flex-wrap justify-center gap-1.5 mb-4 w-full">
              {["Idle Farming", "NFT Boost", "10×10 Map"].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-[#8b7355]/60 bg-[#e8dcc0]/50 px-2.5 py-1 text-[10px] font-extrabold text-[#3d2516]"
                >
                  {tag}
                </span>
              ))}
            </div>

            <a
              href="/api/auth/twitter"
              className="relative w-full h-10 sm:h-11 flex items-center justify-center no-underline mb-2 transition-transform active:scale-[0.98]"
            >
              <Image
                src={SLICING.mainMenu.progressiveButton}
                alt=""
                fill
                className="object-fill pointer-events-none"
                unoptimized
              />
              <span className="relative z-[1] inline-flex items-center justify-center gap-2 text-xs sm:text-sm font-black text-white sliced-btn-text">
                <XIcon className="w-4 h-4 shrink-0" />
                Sign in with X
              </span>
            </a>

            {process.env.NODE_ENV !== "production" && (
              <div className="w-full border-t border-[#8b7355]/40 pt-3 mt-1">
                <input
                  type="text"
                  placeholder="@YourHandle"
                  value={mockHandle}
                  onChange={(e) => setMockHandle(e.target.value)}
                  className="w-full bg-[#e8dcc0]/60 border-2 border-[#8b7355]/50 rounded-lg px-3 py-2 mb-2 font-bold text-[#3d2516] text-sm outline-none focus:border-[#4ade80]"
                />
                <SlicedActionButton
                  src={SLICING.mainMenu.button}
                  onClick={handleMockLogin}
                  disabled={loading}
                  className="w-full h-9"
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <Spinner size="sm" />
                      Signing in...
                    </span>
                  ) : (
                    "Mock Login"
                  )}
                </SlicedActionButton>
              </div>
            )}
          </div>
        </SlicedPanel>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main
          className="login-page flex items-center justify-center"
          style={{ backgroundImage: `url("${SLICING.mainMenu.bg}")` }}
        >
          <LoadingScreen />
        </main>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
