/**
 * GEDCOM-style names (`Given /Surname/`) → readable strings and soft archival search.
 */

/** Strip slashes, collapse whitespace (display-oriented). */
export function normalizeGedcomName(name: string): string {
  return name
    .replace(/\//g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Readable label for UI (falls back to xref). */
export function gedcomNameToDisplayName(raw: string | null | undefined, xref: string): string {
  const s = normalizeGedcomName((raw ?? "").trim());
  return s || xref;
}

export function normalizeNameForSearch(s: string): string {
  return normalizeGedcomName(s).toLowerCase();
}

/**
 * Token-aligned prefix match: each query token must be a prefix of the candidate token at the same index.
 * e.g. query `monica g` matches `Monica Gonsalves` as ["monica","g"] vs ["monica","gonsalves"].
 */
export function tokenPrefixMatch(queryNormalized: string, candidateNormalized: string): boolean {
  const queryTokens = queryNormalized.trim().split(/\s+/).filter(Boolean);
  if (queryTokens.length === 0) return false;
  const candidateTokens = candidateNormalized.split(/\s+/).filter(Boolean);
  if (candidateTokens.length < queryTokens.length) return false;
  return queryTokens.every((qt, i) => (candidateTokens[i] ?? "").startsWith(qt));
}

/** Whether `queryRaw` matches this person for album picker search. */
export function matchesAlbumIndividualSearch(
  queryRaw: string,
  person: { gedcomName: string; displayName: string },
): boolean {
  const q = queryRaw.trim().toLowerCase();
  if (!q) return true;
  const gedcomNorm = normalizeNameForSearch(person.gedcomName);
  const displayNorm = normalizeNameForSearch(person.displayName);
  if (displayNorm.includes(q) || gedcomNorm.includes(q)) return true;
  if (tokenPrefixMatch(q, displayNorm)) return true;
  const parts = displayNorm.split(/\s+/).filter(Boolean);
  const given = parts[0] ?? "";
  const surname = parts.length > 1 ? parts[parts.length - 1]! : "";
  if (surname.startsWith(q) || given.startsWith(q)) return true;
  return false;
}
