import { toast as sonner } from "sonner";

const recent = new Map<string, number>();
const DEDUPE_MS = 2500;

function shouldSkip(message: string): boolean {
  const now = Date.now();
  const last = recent.get(message) ?? 0;
  if (now - last < DEDUPE_MS) return true;
  recent.set(message, now);
  return false;
}

export const toast = {
  success: (message: string) => {
    if (shouldSkip(`success:${message}`)) return;
    sonner.success(message);
  },
  error: (message: string) => {
    if (shouldSkip(`error:${message}`)) return;
    sonner.error(message);
  },
  info: (message: string) => {
    if (shouldSkip(`info:${message}`)) return;
    sonner.info(message);
  },
};
