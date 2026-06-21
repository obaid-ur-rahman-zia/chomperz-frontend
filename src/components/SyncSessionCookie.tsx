"use client";

import { useEffect } from "react";
import { getToken } from "@/lib/api";
import { SESSION_COOKIE, sessionCookieValue } from "@/lib/auth";

/** Backfill session flag cookie for logins created before cookie sync existed. */
export function SyncSessionCookie() {
  useEffect(() => {
    if (!getToken()) return;
    if (document.cookie.includes(`${SESSION_COOKIE}=1`)) return;
    document.cookie = sessionCookieValue();
  }, []);

  return null;
}
