import { connectMongo } from "../../config/mongodb";
import { OpportunityModel } from "../../models/opportunity.models";
import type {
  OpportunityListingFilters,
  OpportunityListingItem,
  OpportunityListingResponse,
} from "../../types/api/opportunityListing.types";
import { OpportunityListingItemDoc } from "../../types/mongo/opportunityDBItem";

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildMongoFilter(filters: OpportunityListingFilters): Record<string, unknown> {
  const mongoFilter: Record<string, unknown> = {};

  if (filters.category !== undefined) {
    mongoFilter.category = filters.category;
  }
  if (filters.gender !== undefined) {
    mongoFilter.gender = filters.gender;
  }
  if (filters.location !== undefined) {
    mongoFilter.location = { $regex: escapeRegex(filters.location), $options: "i" };
  }
  if (filters.language !== undefined) {
    mongoFilter.language = { $regex: escapeRegex(filters.language), $options: "i" };
  }

  return mongoFilter;
}

function mapDocToItem(doc: OpportunityListingItemDoc): OpportunityListingItem {
  const { _id, createdAt, updatedAt, ...rest } = doc;
  return {
    ...rest,
    id: _id.toString(),
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
  };
}

/**
 * Returns opportunity documents from MongoDB, newest first, optionally filtered by query params.
 */
export async function listOpportunities(
  filters: OpportunityListingFilters = {}
): Promise<OpportunityListingResponse> {
  await connectMongo();
  const mongoFilter = buildMongoFilter(filters);
  const docs = await OpportunityModel.find(mongoFilter as object)
    .select("-metadata -__v")
    .sort({ createdAt: -1 })
    .lean()
    .exec();
  const items = docs.map((doc) => mapDocToItem(doc as unknown as OpportunityListingItemDoc));
  return { items, count: items.length };
}
