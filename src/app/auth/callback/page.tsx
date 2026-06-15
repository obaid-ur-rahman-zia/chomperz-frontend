"use client";

import { useEffect, useState } from "react";
import { setToken } from "@/lib/api";
import { ArrowLeftIcon } from "@/components/Icons";
import { LoadingScreen } from "@/components/Loading";

export default function AuthCallbackPage() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    const params = new URLSearchParams(hash);
    const token = params.get("token");

    if (!token) {
      setError("No session token received. Try signing in again.");
      return;
    }

    setToken(token);
    window.location.replace("/dashboard");
  }, []);

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="card max-w-md w-full text-center">
          <p className="text-[var(--danger)] font-bold mb-4">{error}</p>
          <a href="/login" className="btn-primary inline-flex items-center gap-2 no-underline">
            <ArrowLeftIcon className="w-4 h-4" />
            Back to login
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <LoadingScreen label="Signing you in..." />
    </main>
  );
}
