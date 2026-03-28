import { Router } from "express";

import { handleTelegramTextIngest } from "./telegramTextIngest.controller";

export const telegramTextIngestRouter = Router();

telegramTextIngestRouter.post("/", handleTelegramTextIngest);
