import { lazy } from "react";

export const CHUNK_RELOAD_SESSION_KEY = "swag-chunk-reload-once";

function isLikelyStaleChunkError(error) {
  if (!error) return false;
  const msg = String(error.message || error);
  const name = error.name ? String(error.name) : "";
  return (
    name === "ChunkLoadError" ||
    msg.includes("Failed to fetch dynamically imported module") ||
    msg.includes("Importing a module script failed") ||
    msg.includes("error loading dynamically imported module") ||
    msg.includes("Loading chunk") ||
    msg.includes("Unable to preload CSS")
  );
}

function ChunkStaleBuildFallback() {
  return (
    <div
      role="alert"
      className="flex min-h-[40vh] flex-col items-center justify-center gap-4 px-4 py-12 text-center"
    >
      <p className="max-w-md text-muted-foreground text-sm md:text-base">
        This screen could not load the latest scripts (often after a site update).
        Refresh the page, or click below if the problem continues.
      </p>
      <button
        type="button"
        className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
        onClick={() => {
          try {
            sessionStorage.removeItem(CHUNK_RELOAD_SESSION_KEY);
          } catch (_) {
            /* ignore */
          }
          window.location.reload();
        }}
      >
        Refresh page
      </button>
    </div>
  );
}

/**
 * Wraps React.lazy imports: retries with one full reload on stale hashed chunks,
 * then shows a small fallback UI.
 */
export function lazyRoute(importFactory) {
  return lazy(async () => {
    try {
      const mod = await importFactory();
      try {
        sessionStorage.removeItem(CHUNK_RELOAD_SESSION_KEY);
      } catch (_) {
        /* ignore */
      }
      return mod;
    } catch (err) {
      const canReload =
        typeof sessionStorage !== "undefined" &&
        isLikelyStaleChunkError(err) &&
        !sessionStorage.getItem(CHUNK_RELOAD_SESSION_KEY);

      if (canReload) {
        try {
          sessionStorage.setItem(CHUNK_RELOAD_SESSION_KEY, "1");
        } catch (_) {
          /* ignore */
        }
        window.location.reload();
        return new Promise(() => {});
      }

      console.error(err);
      return { default: ChunkStaleBuildFallback };
    }
  });
}
