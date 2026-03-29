import { connectMongo } from "../../config/mongodb";
import { OpportunityModel } from "../../models/opportunity.models";
import type {
  OpportunityListingFilters,
  OpportunityListingItem,
  OpportunityListingPagination,
  OpportunityListingResponse,
} from "../../types/api/opportunityListing.types";
import { OpportunityListingItemDoc } from "../../types/mongo/opportunityDBItem";

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildMongoFilter(filters: OpportunityListingFilters): Record<string, unknown> {
  const mongoFilter: Record<string, unknown> = {};

  if (filters.categories !== undefined && filters.categories.length > 0) {
    mongoFilter.category = { $in: filters.categories };
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
 * Returns a page of opportunity documents from MongoDB, newest first, optionally filtered.
 */
export async function listOpportunities(
  filters: OpportunityListingFilters = {},
  pagination: OpportunityListingPagination
): Promise<OpportunityListingResponse> {
  await connectMongo();
  const mongoFilter = buildMongoFilter(filters);
  const filterArg = mongoFilter as object;

  const total = await OpportunityModel.countDocuments(filterArg).exec();

  const { page, pageSize } = pagination;
  const skip = (page - 1) * pageSize;
  const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize);

  const docs = await OpportunityModel.find(filterArg)
    .select("-metadata -__v")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(pageSize)
    .lean()
    .exec();

  const items = docs.map((doc) => mapDocToItem(doc as unknown as OpportunityListingItemDoc));
  return {
    items,
    count: items.length,
    total,
    page,
    pageSize,
    totalPages,
  };
}
