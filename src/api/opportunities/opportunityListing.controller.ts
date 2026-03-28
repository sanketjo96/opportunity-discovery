import type { Request, Response, NextFunction } from "express";

import { listOpportunities } from "./opportunityListing.service";

export async function handleListOpportunities(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  console.log("[api] GET /api/opportunities invoked");
  try {
    const body = await listOpportunities();
    console.log("[api] GET /api/opportunities success", { count: body.count });
    res.status(200).json(body);
  } catch (err) {
    console.error("[api] GET /api/opportunities failed", err);
    next(err);
  }
}
