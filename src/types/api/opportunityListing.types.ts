/**
 * Public API types for GET /api/opportunities (structured fields suitable for clients / downstream use;
 * Telegram ingest metadata stays in MongoDB only).
 */

export interface OpportunityListingItem {
  id: string;
  source: string;
  rawText: string;
  title: string;
  description: string;
  category: "casting" | "workshop" | "other";
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

export interface OpportunityListingResponse {
  items: OpportunityListingItem[];
  count: number;
}
