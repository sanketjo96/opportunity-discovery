import type { Request, Response, NextFunction } from "express";

import type { TextIngestPayload } from "../../types/textIngest.types";
import { processTextIngestMessage } from "./textIngest.service";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseTextIngestPayload(body: unknown): TextIngestPayload | null {
  if (!isRecord(body)) {
    return null;
  }

  const { text, source } = body;

  if (typeof text !== "string" || text.trim().length === 0) {
    return null;
  }

  if (source !== undefined && typeof source !== "string") {
    return null;
  }

  return {
    text: text.trim(),
    ...(typeof source === "string" && source.length > 0 ? { source: source.trim() } : {}),
  };
}

export async function handleTextIngest(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    console.log(req.body);
    const payload = parseTextIngestPayload(req.body);

    if (payload === null) {
      res.status(400).json({
        error: "Bad Request",
        message: "Request body must include a non-empty string field: text",
      });
      return;
    }

    const result = await processTextIngestMessage(payload);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}
