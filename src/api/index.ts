import { Router } from "express";

import { opportunityListingRouter } from "./opportunities/opportunityListing.route";
import { telegramTextIngestRouter } from "./telegramTextIngest/telegramTextIngest.route";

/**
 * Single API entry: register all feature routers here.
 */
export const apiRouter = Router();

apiRouter.use("/ingest", telegramTextIngestRouter);
apiRouter.use("/opportunities", opportunityListingRouter);
