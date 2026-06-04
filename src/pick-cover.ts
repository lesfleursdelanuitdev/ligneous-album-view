import type { MediaSummary } from "./model";

const RASTER_EXT =
  /\.(jpe?g|png|gif|webp|avif|bmp|heic|heif)(\?|#|$)/i;

function isRasterCandidate(m: MediaSummary): boolean {
  const ref = (m.fileRef ?? "").trim().toLowerCase();
  if (RASTER_EXT.test(ref)) return true;
  const form = (m.form ?? "").toLowerCase();
  return form.startsWith("image/") && !form.includes("svg");
}

/** Deterministic “random” index in [0, n) from a stable string key. */
function stableIndexFromKey(key: string, modulo: number): number {
  if (modulo <= 0) return 0;
  let h = 0;
  for (let i = 0; i < key.length; i++) {
    h = (h * 31 + key.charCodeAt(i)) >>> 0;
  }
  return h % modulo;
}

/**
 * Pick a cover item from a **media set** for generated views (often a raster image; falls back to any member).
 * The index is **stable** for a given `stableKey` (same key → same pick across refreshes).
 */
export function pickCoverMediaFromSummaries(
  media: MediaSummary[],
  stableKey: string,
): MediaSummary | null {
  if (media.length === 0) return null;
  const raster = media.filter(isRasterCandidate);
  const pool = raster.length > 0 ? raster : media;
  const idx = stableIndexFromKey(stableKey, pool.length);
  return pool[idx] ?? null;
}

/**
 * Preferred album / virtual-album cover: explicit profile media id when that row is in `summaries`,
 * otherwise the same deterministic pick as {@link pickCoverMediaFromSummaries}.
 */
export function resolveAlbumCoverMedia(
  preferredMediaId: string | null | undefined,
  summaries: MediaSummary[],
  stableKey: string,
): MediaSummary | null {
  const id = preferredMediaId?.trim();
  if (id) {
    const hit = summaries.find((m) => m.id === id);
    if (hit) return hit;
  }
  return pickCoverMediaFromSummaries(summaries, stableKey);
}
