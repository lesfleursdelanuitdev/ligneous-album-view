import type { MediaSummary } from "./model";

export type MediaBucketKind = "image" | "video" | "audio" | "document" | "other";

function normalizePath(ref: string): string {
  const t = ref.trim();
  if (!t) return t;
  if (t.startsWith("http://") || t.startsWith("https://")) return t;
  if (t.startsWith("/")) return t.replace(/^\/+/, "/");
  return t;
}

function isLikelyRasterImage(fileRef: string, formStr: string): boolean {
  const f = normalizePath(fileRef).trim().toLowerCase();
  if (/\.(jpe?g|png|gif|webp|avif|bmp|heic|heif|tiff?)(\?|$)/i.test(f)) return true;
  const fm = (formStr || "").toLowerCase();
  if (/\b(jpe?g|png|gif|webp|avif|bmp|heic|heif|tiff?)\b/.test(fm)) return true;
  return false;
}

/** Infer media bucket from `fileRef` + GEDCOM `form` (aligned with public album filters). */
export function inferMediaBucketKind(m: MediaSummary): MediaBucketKind {
  const ref = normalizePath(m.fileRef ?? "").trim().toLowerCase();
  const form = (m.form ?? "").trim().toLowerCase();

  if (form.startsWith("video/") || /\bvideo\b/.test(form)) return "video";
  if (form.startsWith("audio/") || /\baudio\b/.test(form)) return "audio";
  if (form.startsWith("image/")) return "image";
  if (
    /\bpdf\b/.test(form) ||
    /\b(msword|wordprocessingml|officedocument)\b/.test(form) ||
    form === "pdf" ||
    form === "doc" ||
    form === "txt"
  ) {
    return "document";
  }

  if (/\.(mp4|webm|mov|m4v|mkv|avi|ogv)(\?|$)/i.test(ref)) return "video";
  if (/\.(mp3|wav|ogg|flac|m4a|aac|opus|wma)(\?|$)/i.test(ref)) return "audio";
  if (/\.(pdf|doc|docx|odt|rtf|txt)(\?|$)/i.test(ref)) return "document";
  if (isLikelyRasterImage(m.fileRef ?? "", m.form ?? "") || /\.svg(\?|$)/i.test(ref)) return "image";

  if (/^(jpe?g|png|gif|webp|tiff?|bmp)$/i.test(form)) return "image";

  return "other";
}
