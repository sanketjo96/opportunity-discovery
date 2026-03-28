import { Router } from "express";

import { handleTextIngest } from "./textIngest.controller";

export const textIngestRouter = Router();

textIngestRouter.post("/", handleTextIngest);
