import { Router } from "express";

import { textIngestRouter } from "./textIngest/textIngest.route";

/**
 * Single API entry: register all feature routers here.
 */
export const apiRouter = Router();

apiRouter.use("/ingest", textIngestRouter);
