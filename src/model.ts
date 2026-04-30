/** Curated rows in `albums` vs. virtual sets from GEDCOM relationships. */
export type MediaSetViewKind = "curated" | "generated";

/** Legacy name — same as {@link MediaSetViewKind}. */
export type AlbumViewKind = MediaSetViewKind;

/**
 * What slice of the tree (or DB album) defines this set.
 * Serves as the **qualifier** for `MediaSetViewModel` (any qualified set → one view).
 */
export type MediaQualifier =
  | { type: "album"; albumId: string }
  | { type: "individual"; individualId: string }
  | { type: "family"; familyId: string }
  | { type: "event"; eventId: string }
  | { type: "place"; placeId: string }
  | { type: "note"; noteId: string }
  | { type: "date"; dateId: string }
  | { type: "tag"; tagId: string };

/** @deprecated Prefer {@link MediaQualifier}. */
export type AlbumViewSource = MediaQualifier;

/** Individuals tied to album media via GEDCOM OBJE junctions (About tab, lightbox, people filter). */
export type AlbumMediaLinkedIndividual = {
  id: string;
  xref: string;
  /** Raw name from tree (often `Given /Surname/`) */
  gedcomName: string;
  /** Readable display name */
  displayName: string;
  /** Album-level aggregate: media items in this set that include this person */
  mediaCount?: number;
  thumbnailUrl?: string | null;
};

export type AlbumMediaLinkedPlace = {
  id: string;
  original: string;
  name: string | null;
  county: string | null;
  state: string | null;
  country: string | null;
};

export type AlbumMediaLinkedDate = {
  id: string;
  original: string | null;
  dateType: string;
  year: number | null;
  month: number | null;
  day: number | null;
  endYear: number | null;
  endMonth: number | null;
  endDay: number | null;
};

/** App tags attached to tree media (`GedcomMediaAppTag` → `Tag`). */
export type AlbumMediaLinkedTag = {
  id: string;
  name: string;
};

/** Minimal OBJE / media row for cards and cover selection (images, PDFs, video, etc.). */
export type MediaSummary = {
  id: string;
  title: string | null;
  fileRef: string | null;
  form: string | null;
  /** OBJE text; filled by public album resolver when present. */
  description?: string | null;
  /**
   * Individuals tied to this OBJE only (INDI↔OBJE, FAM↔OBJE spouses, event principals).
   * Filled by public album resolver for lightbox; omitted elsewhere.
   */
  linkedIndividuals?: AlbumMediaLinkedIndividual[];
  /** Places linked to this OBJE only; filled by public album resolver for lightbox. */
  linkedPlaces?: AlbumMediaLinkedPlace[];
  /** Dates linked to this OBJE only; filled by public album resolver for lightbox. */
  linkedDates?: AlbumMediaLinkedDate[];
  /** App tags on this OBJE; filled by public album resolver for lightbox. */
  linkedTags?: AlbumMediaLinkedTag[];
};

/** How rows are loaded for the grid (admin curated junction vs. inlined list). */
export type MediaSetGridMode = "junction" | "static";

/** @deprecated Prefer {@link MediaSetGridMode}. */
export type AlbumGridMode = MediaSetGridMode;

export type MediaSetPresentation = "album" | "gallery" | "timeline" | "map";

/**
 * Reusable payload: **any qualified media set** + how to present it.
 * **Album** is only `presentation: "album"` (Facebook-style cover + grid when the set is image-heavy).
 */
export type MediaSetViewModel = {
  kind: MediaSetViewKind;
  /** Qualifier: which entity or curated album defines membership. */
  source: MediaQualifier;
  title: string;
  description?: string | null;
  /**
   * Curated album `created_at` as ISO 8601 (public views only).
   * Omitted for generated sets.
   */
  albumCreatedAt?: string | null;
  coverMedia: MediaSummary | null;
  /** Members of the set (summaries). Empty when `gridMode` is `"junction"` and the grid loads pages server-side. */
  media: MediaSummary[];
  totalCount: number;
  visibility: "public" | "private";
  canEditAlbumMetadata: boolean;
  canEditMembership: boolean;
  gridMode: MediaSetGridMode;
  /** When `gridMode` is `"junction"`, paginated grid loads via this album id. */
  albumId?: string | null;
  /** Layout mode; **album** is the current Facebook-style shell. */
  presentation: MediaSetPresentation;
  /** Optional hint for mixed sets (documents, audio, etc.). */
  mediaTypes?: Array<"image" | "video" | "audio" | "document">;
  /**
   * Counts per media bucket for filter UI (public resolver).
   * Omits buckets with zero items.
   */
  availableMediaTypes?: Array<{
    type: "image" | "video" | "audio" | "document" | "other";
    count: number;
  }>;
  /**
   * People linked to any media in this set (individual ↔ media, family ↔ media spouses,
   * and event ↔ media principals). Sorted by display name. Omitted or empty when none.
   */
  linkedIndividuals?: AlbumMediaLinkedIndividual[];
  /** Places linked to any media in this set. */
  linkedPlaces?: AlbumMediaLinkedPlace[];
  /** Dates linked to any media in this set. */
  linkedDates?: AlbumMediaLinkedDate[];
};

/**
 * @deprecated Use {@link MediaSetViewModel}. Kept for incremental renames (`AlbumView` routes, APIs).
 * Same shape; always set `presentation` on new code paths.
 */
export type AlbumViewModel = MediaSetViewModel;
