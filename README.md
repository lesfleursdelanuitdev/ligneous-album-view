# @ligneous/album-view

Shared types and small helpers for showing photo albums and other media sets from a genealogy tree.

A Ligneous site has two kinds of albums. **Curated** albums are rows that an editor builds by hand. **Generated** albums are virtual: "all media for this person", "media from this place", "media tagged Weddings". This package defines one view model that covers both, so the admin app and the public site render them the same way. It has no runtime dependencies and makes no database calls.

## What it does

- **`MediaSetViewModel`**: the payload for any media set. It holds the kind (`curated` or `generated`), the qualifier that defines it, title, cover, members, counts, visibility, edit rights and presentation (`album`, `gallery`, `timeline` or `map`).
- **`MediaQualifier`**: what defines the set. One of `album`, `individual`, `family`, `event`, `place`, `note`, `date` or `tag`, each with its id.
- **`MediaSummary`**: a minimal media row (id, title, file reference, GEDCOM `FORM`, description) plus the people, places, dates and tags linked to it.
- **Cover selection**: `resolveAlbumCoverMedia` uses an explicit profile image when one is set. Otherwise `pickCoverMediaFromSummaries` picks a raster image with a stable hash of a key, so the same album shows the same cover on every load.
- **Media kind**: `inferMediaBucketKind` sorts a media row into `image`, `video`, `audio`, `document` or `other` from its GEDCOM `FORM` value and file extension.
- **Names**: `gedcomNameToDisplayName` turns GEDCOM names like `Maria /Silva/` into `Maria Silva`. `matchesAlbumIndividualSearch` does forgiving name search for the album people filter, including token prefix matching (`mar s` matches `Maria Silva`).

## Where it fits in Ligneous

Ligneous is a genealogy platform. A Go library parses GEDCOM files; the data lives in Postgres and is read through Prisma by Next.js apps.

Used by:

- `the-gonsalves-family` (private): public album and media pages (`lib/album/`, `src/app/media/`, `src/app/api/album-view/`, `src/components/album/`).
- `the-gonsalves-family-admin` (private): album pages and the album API (`lib/album/`, `src/components/album/`, `src/app/api/admin/album-view/`).
- [ligneous-album-generated-queries](https://github.com/lesfleursdelanuitdev/ligneous-album-generated-queries): uses `MediaQualifier` (as `AlbumViewSource`) to decide which media belong to a generated album.

### Data it consumes

Plain TypeScript objects that the apps build from Prisma rows. The field names follow the Postgres media tables (`gedcom_media_v2` and its junctions with individuals, families, events, places, dates and tags) and GEDCOM `OBJE` records. The package does not read the Go parser's intermediate representation directly. Those tables are the database form of the parser's `EnrichedDocument` (see `docs/INTERMEDIATE_FORMAT.md` in [ligneous-gedcom-lib](https://github.com/lesfleursdelanuitdev/ligneous-gedcom-lib)).

## Install

The package is not published to npm (`"private": true`). It ships TypeScript source (`exports` points at `src/index.ts`), so your bundler compiles it.

```json
{
  "dependencies": {
    "@ligneous/album-view": "file:../ligneous-album-view"
  }
}
```

## Usage

```ts
import {
  inferMediaBucketKind,
  resolveAlbumCoverMedia,
  gedcomNameToDisplayName,
  type MediaSummary,
  type MediaSetViewModel,
} from "@ligneous/album-view";

const media: MediaSummary[] = [
  { id: "m1", title: "Wedding", fileRef: "/uploads/wedding.jpg", form: "jpg" },
  { id: "m2", title: "Letter", fileRef: "/uploads/letter.pdf", form: "pdf" },
];

inferMediaBucketKind(media[1]);                      // "document"
const cover = resolveAlbumCoverMedia(null, media, "individual:abc"); // the .jpg
gedcomNameToDisplayName("Maria /Silva/", "@I12@");  // "Maria Silva"

const view: MediaSetViewModel = {
  kind: "generated",
  source: { type: "individual", individualId: "abc" },
  title: "Media for Maria Silva",
  coverMedia: cover,
  media,
  totalCount: media.length,
  visibility: "public",
  canEditAlbumMetadata: false,
  canEditMembership: false,
  gridMode: "static",
  presentation: "album",
};
```

## API summary

| Export | Kind | Purpose |
| --- | --- | --- |
| `MediaSetViewModel` (`AlbumViewModel`) | type | View payload for any media set |
| `MediaQualifier` (`AlbumViewSource`) | type | What defines the set |
| `MediaSetViewKind` (`AlbumViewKind`) | type | `"curated"` or `"generated"` |
| `MediaSummary` | type | Minimal media row |
| `AlbumMediaLinkedIndividual`, `AlbumMediaLinkedPlace`, `AlbumMediaLinkedDate`, `AlbumMediaLinkedTag` | types | Records linked to media |
| `MediaSetGridMode`, `MediaSetPresentation` | types | Grid loading mode and layout |
| `resolveAlbumCoverMedia`, `pickCoverMediaFromSummaries` | functions | Cover selection |
| `inferMediaBucketKind`, `MediaBucketKind` | function, type | Media type bucket |
| `gedcomNameToDisplayName`, `normalizeGedcomName`, `normalizeNameForSearch`, `tokenPrefixMatch`, `matchesAlbumIndividualSearch` | functions | Name display and search |

Names in brackets are older aliases kept for compatibility.

## Build and test

`package.json` has no scripts and the repo has no tests yet. To type-check:

```sh
npx tsc --noEmit
```

Next step: add unit tests for cover picking, media kind and name matching. They are pure functions and easy to test.

## Stack

TypeScript (strict, ES2022 modules). No runtime dependencies.

## Related repos

- [Ligneous](https://github.com/lesfleursdelanuitdev/Ligneous): project overview
- [ligneous-album-generated-queries](https://github.com/lesfleursdelanuitdev/ligneous-album-generated-queries): Prisma queries that fill generated albums
- [ligneous-gedcom-lib](https://github.com/lesfleursdelanuitdev/ligneous-gedcom-lib): Go GEDCOM parser

## License

No license file: all rights reserved.

Part of Ligneous: https://github.com/lesfleursdelanuitdev/Ligneous
