import type { Request, Response, NextFunction } from "express";

import { parseTelegramTextIngestPayload } from "../../dataValidators/telegramTextIngest.validator";
import { processTelegramTextIngestMessage } from "./telegramTextIngest.service";

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
          "Request body must be a Telegram update with numeric update_id and message (message_id, from, chat, date, non-empty text)",
      });
      return;
    }

    const result = await processTelegramTextIngestMessage(payload);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}
