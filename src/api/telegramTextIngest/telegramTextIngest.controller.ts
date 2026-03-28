import type { Request, Response, NextFunction } from "express";

import { parseTelegramTextIngestPayload } from "../../dataValidators/telegramTextIngest.validator";
import { ingestQueue } from "../../queue/ingest.queue";

export async function handleTelegramTextIngest(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  console.log("[api] POST /api/ingest invoked");
  try {
    const payload = parseTelegramTextIngestPayload(req.body);

    if (payload === null) {
      console.warn("[api] POST /api/ingest rejected: invalid payload");
      res.status(400).json({
        error: "Bad Request",
        message:
          "Request body must be a Telegram update with numeric update_id and message (message_id, from, chat, date, and non-empty text or caption)",
      });
      return;
    }

    const job = await ingestQueue.add("process-message", payload);

    console.log("[api] POST /api/ingest queued", { jobId: job.id, updateId: payload.update_id });
    res.status(200).json({
      success: true,
      jobId: job.id,
    });
  } catch (err) {
    console.error("[api] POST /api/ingest failed", err);
    next(err);
  }
}
