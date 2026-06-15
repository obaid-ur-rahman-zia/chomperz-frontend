"use client";

import { useEffect, useState } from "react";
import { setToken } from "@/lib/api";

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
          <a href="/login" className="btn-primary inline-block no-underline">
            Back to login
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <p className="text-[var(--muted)] font-bold">Signing you in...</p>
    </main>
  );
}
