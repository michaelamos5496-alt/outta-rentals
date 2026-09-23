/**
 * Product and category edits still live in the in-memory admin store
 * (`./store`), which on a serverless host is per-instance and reset on every
 * deploy — and the public catalogue reads that same store. Editing them on
 * the live site would make listings flicker between visitors and silently
 * revert, so it's development-only until products move into the database.
 * (Stock status and units owned ARE saved — see `./quotes`.)
 */
export const catalogueEditable = process.env.NODE_ENV !== "production";
