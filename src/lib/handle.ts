/** Ensure exactly one @ prefix (usernames are stored with @ in the DB). */
export function formatHandle(raw: string | null | undefined): string {
  if (!raw) return "@unknown";
  const trimmed = raw.trim().replace(/^@+/, "");
  return trimmed ? `@${trimmed}` : "@unknown";
}
