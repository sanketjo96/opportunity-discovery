import { randomUUID } from "node:crypto";

import type {
  TelegramTextIngestPayload,
  TelegramTextIngestStructuredResult,
} from "../../types/telegramTextIngest.types";

const PREVIEW_MAX_LENGTH = 1000;

/**
 * Processes a Telegram webhook update. Currently logs and returns a mock structured result.
 */
export async function processTelegramTextIngestMessage(
  input: TelegramTextIngestPayload
): Promise<TelegramTextIngestStructuredResult> {
  console.log("[telegramTextIngest.service] received update:", JSON.stringify(input));

  const text = input.message.text?.trim() || input.message.caption?.trim() || "";
  const preview =
    text.length <= PREVIEW_MAX_LENGTH ? text : `${text.slice(0, PREVIEW_MAX_LENGTH)}…`;

  return {
    id: randomUUID(),
    receivedAt: new Date().toISOString(),
    preview,
    sourceLabel: `telegram:${input.message.chat.type}`,
  };
}
