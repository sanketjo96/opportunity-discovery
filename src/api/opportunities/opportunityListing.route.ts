import { Router } from "express";

import { handleListOpportunities } from "./opportunityListing.controller";

export const opportunityListingRouter = Router();

opportunityListingRouter.get("/", handleListOpportunities);
