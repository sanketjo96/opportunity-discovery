import { connectMongo } from "../../config/mongodb";
import { OpportunityModel } from "../../models/opportunity.models";
import type {
  OpportunityListingItem,
  OpportunityListingResponse,
} from "../../types/api/opportunityListing.types";
import { OpportunityListingItemDoc } from "../../types/mongo/opportunityDBItem";

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
 * Returns all opportunity documents from MongoDB, newest first.
 */
export async function listOpportunities(): Promise<OpportunityListingResponse> {
  await connectMongo();
  const docs = await OpportunityModel.find()
    .select("-metadata -__v")
    .sort({ createdAt: -1 })
    .lean()
    .exec();
  const items = docs.map((doc) => mapDocToItem(doc as unknown as OpportunityListingItemDoc));
  return { items, count: items.length };
}
