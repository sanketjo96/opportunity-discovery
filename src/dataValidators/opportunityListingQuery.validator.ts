import type {
  OpportunityListingFilters,
  OpportunityListingPagination,
} from "../types/api/opportunityListing.types";

const VALID_CATEGORIES = new Set([
  "casting",
  "workshop",
  "music",
  "voiceover",
  "other",
]);

const VALID_GENDERS = new Set(["male", "female", "unisex"]);

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

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

function parsePositiveIntParam(
  raw: unknown,
  name: string,
  options: { min: number; max?: number }
): { ok: true; value: number } | { ok: false; message: string } {
  const s = firstQueryString(raw);
  if (s === undefined) {
    return { ok: false, message: `${name} must be a positive integer` };
  }
  const n = Number(s);
  if (!Number.isFinite(n) || !Number.isInteger(n)) {
    return { ok: false, message: `${name} must be a positive integer` };
  }
  if (n < options.min) {
    return { ok: false, message: `${name} must be at least ${options.min}` };
  }
  if (options.max !== undefined && n > options.max) {
    return { ok: false, message: `${name} must be at most ${options.max}` };
  }
  return { ok: true, value: n };
}

export type ParsedListingQuery =
  | { ok: true; filters: OpportunityListingFilters; pagination: OpportunityListingPagination }
  | { ok: false; message: string };

/**
 * Parses filter query params plus `page` (1-based, default 1) and `pageSize` (default 20, max 100).
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

  const pageRaw = query.page;
  const pageSizeRaw = query.pageSize;

  const pageParsed =
    pageRaw === undefined || pageRaw === null || pageRaw === ""
      ? { ok: true as const, value: DEFAULT_PAGE }
      : parsePositiveIntParam(pageRaw, "page", { min: 1 });

  if (!pageParsed.ok) {
    return { ok: false, message: pageParsed.message };
  }

  const pageSizeParsed =
    pageSizeRaw === undefined || pageSizeRaw === null || pageSizeRaw === ""
      ? { ok: true as const, value: DEFAULT_PAGE_SIZE }
      : parsePositiveIntParam(pageSizeRaw, "pageSize", { min: 1, max: MAX_PAGE_SIZE });

  if (!pageSizeParsed.ok) {
    return { ok: false, message: pageSizeParsed.message };
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

  const pagination: OpportunityListingPagination = {
    page: pageParsed.value,
    pageSize: pageSizeParsed.value,
  };

  return { ok: true, filters, pagination };
}
