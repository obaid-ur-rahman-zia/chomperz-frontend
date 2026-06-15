"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { apiFetch, setToken } from "@/lib/api";

function LoginContent() {
  const searchParams = useSearchParams();
  const [mockHandle, setMockHandle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
      };
      let msg = messages[err] || "Login failed.";
      if (detail) {
        msg += ` (${detail})`;
      }
      setError(msg);
    }
  }, [searchParams]);

  async function handleMockLogin() {
    if (!mockHandle.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<{ token: string }>("/api/auth/mock-twitter", {
        method: "POST",
        body: JSON.stringify({ handle: mockHandle.trim() }),
      });
      setToken(data.token);
      window.location.href = "/dashboard";
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Mock login unavailable. Use Twitter login or set MOCK_TWITTER=true on API."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="card max-w-md w-full text-center">
        <h1 className="text-3xl font-black tracking-wide mb-2">CHOMPERZ</h1>
        <p className="text-[var(--muted)] mb-8 font-bold">
          Sign in to start farming Z-Coins
        </p>

        {error && (
          <p className="text-[var(--danger)] text-sm font-bold mb-4">{error}</p>
        )}

        <a
          href="/api/auth/twitter"
          className="btn-primary block w-full text-center no-underline"
        >
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
              {loading ? "Loading..." : "Mock Login"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="min-h-screen flex items-center justify-center">Loading...</main>}>
      <LoginContent />
    </Suspense>
  );
}
