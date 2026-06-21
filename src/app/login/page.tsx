"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { apiFetch, clearToken, hasSession, setToken } from "@/lib/api";
import { toast } from "@/lib/toast";
import { CoinIcon, MapIcon, TrendIcon, XIcon } from "@/components/Icons";
import { LoadingScreen, Spinner } from "@/components/Loading";

function LoginContent() {
  const searchParams = useSearchParams();
  const [mockHandle, setMockHandle] = useState("");
  const [loading, setLoading] = useState(false);
  const [imgSrc, setImgSrc] = useState("/images/chomper.jpg");

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
    <main className="login-page min-h-screen flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        <div className="relative mx-auto w-full max-w-[240px] sm:max-w-[280px] mb-6">
          <div className="absolute -inset-3 rounded-3xl bg-[var(--green)]/20 blur-xl" aria-hidden />
          <div className="relative aspect-square rounded-3xl overflow-hidden border-4 border-[var(--green)] bg-[#1e2420] shadow-[0_0_40px_rgba(76,209,55,0.25)]">
            <Image
              src={imgSrc}
              alt="Chomperz mascot"
              fill
              className="object-contain"
              priority
              onError={() => setImgSrc("/chomper.svg")}
            />
          </div>
        </div>

        <div className="card text-center">
          <h1 className="text-3xl sm:text-4xl font-black tracking-wide mb-1">
            CHOMPERZ
          </h1>
          <p className="text-[var(--muted)] mb-5 font-bold text-sm sm:text-base">
            Sign in to start farming Z-Coins
          </p>

          <div className="flex flex-wrap justify-center gap-2 mb-6">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#3a453d] bg-black/25 px-3 py-1.5 text-xs font-extrabold text-[var(--gold)]">
              <CoinIcon className="w-3.5 h-3.5" />
              Idle Farming
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#3a453d] bg-black/25 px-3 py-1.5 text-xs font-extrabold text-[var(--green)]">
              <TrendIcon className="w-3.5 h-3.5" />
              NFT Boost
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#3a453d] bg-black/25 px-3 py-1.5 text-xs font-extrabold text-[var(--blue)]">
              <MapIcon className="w-3.5 h-3.5" />
              10×10 Map
            </span>
          </div>

          <a
            href="/api/auth/twitter"
            className="btn-primary flex items-center justify-center gap-2.5 w-full no-underline py-3.5"
          >
            <XIcon className="w-5 h-5 shrink-0" />
            Sign in with X
          </a>

          {process.env.NODE_ENV !== "production" && (
            <div className="border-t border-white/10 pt-6 mt-6">
              <p className="text-xs text-[var(--muted)] mb-3 font-bold">
                Dev fallback (requires MOCK_TWITTER=true on API)
              </p>
              <input
                type="text"
                placeholder="@YourHandle"
                value={mockHandle}
                onChange={(e) => setMockHandle(e.target.value)}
                className="w-full bg-black/30 border-2 border-[#3a453d] rounded-xl px-4 py-3 mb-3 font-bold text-white outline-none focus:border-[var(--gold)]"
              />
              <button
                onClick={handleMockLogin}
                disabled={loading}
                className="btn-secondary w-full disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Spinner size="sm" />
                    Signing in...
                  </>
                ) : (
                  "Mock Login"
                )}
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-[10px] sm:text-xs text-[var(--muted)] font-bold mt-5 px-4">
          Hatch your Chomper, link your wallet, and claim territory on the map.
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="login-page min-h-screen">
          <LoadingScreen />
        </main>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
