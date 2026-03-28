import type { OpportunityListingItem } from "../api/opportunityListing.types";/** Mongo lean row before serialization: same fields as {@link OpportunityListingItem} except id/timestamps. */

export type OpportunityListingItemDoc = Omit<OpportunityListingItem, "id" | "createdAt" | "updatedAt"> & {
    _id: { toString(): string };
    createdAt: Date;
    updatedAt: Date;
};

