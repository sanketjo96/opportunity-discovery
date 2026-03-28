import type { OpportunityListingFilters } from "../types/api/opportunityListing.types";

const VALID_CATEGORIES = new Set([
  "casting",
  "workshop",
  "music",
  "voiceover",
  "other",
]);

const VALID_GENDERS = new Set(["male", "female", "unisex"]);

function firstQueryString(value: unknown): string | undefined {
  if (typeof value === "string") {
    const t = value.trim();
    return t.length > 0 ? t : undefined;
  }
  if (Array.isArray(value) && typeof value[0] === "string") {
    const t = value[0].trim();
    return t.length > 0 ? t : undefined;
  }
  return undefined;
}

export type ParsedListingQuery =
  | { ok: true; filters: OpportunityListingFilters }
  | { ok: false; message: string };

/**
 * Parses `category`, `gender`, `location`, and `language` from Express `req.query`.
 * Unknown or invalid enum values yield a failed parse with a message for HTTP 400.
 */
export function parseOpportunityListingQuery(query: Record<string, unknown>): ParsedListingQuery {
  const category = firstQueryString(query.category);
  const gender = firstQueryString(query.gender);
  const location = firstQueryString(query.location);
  const language = firstQueryString(query.language);

  if (category !== undefined && !VALID_CATEGORIES.has(category)) {
    return {
      ok: false,
      message: `Invalid category. Allowed: ${[...VALID_CATEGORIES].join(", ")}`,
    };
  }

  if (gender !== undefined && !VALID_GENDERS.has(gender)) {
    return {
      ok: false,
      message: `Invalid gender. Allowed: ${[...VALID_GENDERS].join(", ")}`,
    };
  }

  const filters: OpportunityListingFilters = {};
  if (category !== undefined) {
    filters.category = category as OpportunityListingFilters["category"];
  }
  if (gender !== undefined) {
    filters.gender = gender as OpportunityListingFilters["gender"];
  }
  if (location !== undefined) {
    filters.location = location;
  }
  if (language !== undefined) {
    filters.language = language;
  }

  return { ok: true, filters };
}
