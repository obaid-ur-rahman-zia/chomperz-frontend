export const dynamic = "force-dynamic";

/** Runs before React hydrates so sign-in works even if client bundles fail to load. */
const CALLBACK_SCRIPT = `
(function () {
  try {
    var hash = window.location.hash.slice(1);
    var token = new URLSearchParams(hash).get("token");
    if (!token) {
      window.location.replace("/login?error=no_token");
      return;
    }
    localStorage.setItem("chomperz_token", token);
    document.cookie = "chomperz_session=1; path=/; max-age=604800; samesite=lax";
    window.location.replace("/dashboard");
  } catch (e) {
    window.location.replace("/login?error=callback_failed");
  }
})();
`.trim();

export default function AuthCallbackPage() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: CALLBACK_SCRIPT }} />
      <main className="min-h-screen flex flex-col items-center justify-center gap-4">
        <span
          role="status"
          aria-label="Loading"
          className="inline-block w-12 h-12 rounded-full border-[3px] border-[#3a453d] border-t-[var(--green)] animate-spin"
        />
        <p className="text-sm font-bold text-[var(--muted)]">Signing you in...</p>
      </main>
    </>
  );
}
