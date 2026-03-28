import type { Request, Response, NextFunction } from "express";

import { parseOpportunityListingQuery } from "../../dataValidators/opportunityListingQuery.validator";
import { listOpportunities } from "./opportunityListing.service";

export async function handleListOpportunities(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  console.log("[api] GET /api/opportunities invoked");
  try {
    const parsed = parseOpportunityListingQuery(req.query as Record<string, unknown>);
    if (!parsed.ok) {
      console.warn("[api] GET /api/opportunities rejected: bad query", { message: parsed.message });
      res.status(400).json({ error: "Bad Request", message: parsed.message });
      return;
    }

    const body = await listOpportunities(parsed.filters);
    console.log("[api] GET /api/opportunities success", {
      count: body.count,
      filters: parsed.filters,
    });
    res.status(200).json(body);
  } catch (err) {
    console.error("[api] GET /api/opportunities failed", err);
    next(err);
  }
}
