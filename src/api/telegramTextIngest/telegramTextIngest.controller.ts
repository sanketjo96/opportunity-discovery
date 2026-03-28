import type { Request, Response, NextFunction } from "express";

import { parseTelegramTextIngestPayload } from "../../dataValidators/telegramTextIngest.validator";
import { ingestQueue } from "../../queue/ingest.queue";

export async function handleTelegramTextIngest(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const payload = parseTelegramTextIngestPayload(req.body);

    if (payload === null) {
      res.status(400).json({
        error: "Bad Request",
        message:
          "Request body must be a Telegram update with numeric update_id and message (message_id, from, chat, date, and non-empty text or caption)",
      });
      return;
    }


    const job = await ingestQueue.add("process-message", payload);

    res.status(200).json({
      success: true,
      jobId: job.id,
    });
  } catch (err) {
    next(err);
  }
}
