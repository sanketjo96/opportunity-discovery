/**
 * Public API types for GET /api/opportunities (structured fields suitable for clients / downstream use;
 * Telegram ingest metadata stays in MongoDB only).
 */

export type OpportunityListingCategory =
  | "casting"
  | "workshop"
  | "music"
  | "voiceover"
  | "other";

export type OpportunityListingGender = "male" | "female" | "unisex";

/** Optional filters from query string (all ANDed). */
export interface OpportunityListingFilters {
  category?: OpportunityListingCategory;
  gender?: OpportunityListingGender;
  /** Case-insensitive substring match on stored location. */
  location?: string;
  /** Case-insensitive substring match on stored language. */
  language?: string;
}

export interface OpportunityListingItem {
  id: string;
  source: string;
  rawText: string;
  title: string;
  description: string;
  category: OpportunityListingCategory;
  gender?: OpportunityListingGender;
  roles?: string[];
  ageRange?: string;
  location?: string;
  language?: string;
  email?: string;
  url?: string;
  contact?: string;
  deadline?: string;
  /** ISO 8601 */
  createdAt: string;
  /** ISO 8601 */
  updatedAt: string;
}

/** Resolved pagination (defaults applied). */
export interface OpportunityListingPagination {
  /** 1-based page index */
  page: number;
  pageSize: number;
}

export interface OpportunityListingResponse {
  items: OpportunityListingItem[];
  /** Number of items in this response (page). */
  count: number;
  /** Total documents matching the filters (all pages). */
  total: number;
  page: number;
  pageSize: number;
  /** Total pages for the current filter set (ceil(total / pageSize)). */
  totalPages: number;
}
