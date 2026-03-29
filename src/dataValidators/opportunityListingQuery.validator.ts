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

/**
 * Single `category` query param only: comma-separated values, e.g. `category=casting,workshop`.
 * Repeated `category=` keys are not accepted.
 */
function parseCategoryCommaList(
  raw: unknown
): { ok: true; tokens: string[] } | { ok: false; message: string } {
  if (raw === undefined || raw === null || raw === "") {
    return { ok: true, tokens: [] };
  }
  if (Array.isArray(raw)) {
    return {
      ok: false,
      message:
        "Use a single category parameter with comma-separated values, e.g. ?category=casting,workshop",
    };
  }
  if (typeof raw !== "string") {
    return { ok: false, message: "category must be a string" };
  }
  const tokens = raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  return { ok: true, tokens: [...new Set(tokens)] };
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
  const categoryParsed = parseCategoryCommaList(query.category);
  if (!categoryParsed.ok) {
    return { ok: false, message: categoryParsed.message };
  }
  const categoryTokens = categoryParsed.tokens;
  for (const c of categoryTokens) {
    if (!VALID_CATEGORIES.has(c)) {
      return {
        ok: false,
        message: `Invalid category "${c}". Allowed: ${[...VALID_CATEGORIES].join(", ")}`,
      };
    }
  }

  const gender = firstQueryString(query.gender);
  const location = firstQueryString(query.location);
  const language = firstQueryString(query.language);

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
  if (categoryTokens.length > 0) {
    filters.categories = categoryTokens as OpportunityListingFilters["categories"];
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
