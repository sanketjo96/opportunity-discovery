import { randomUUID } from "node:crypto";

import type { TextIngestPayload, TextIngestStructuredResult } from "../../types/textIngest.types";

const PREVIEW_MAX_LENGTH = 1000;

/**
 * Processes a raw webhook message. Currently logs and returns a mock structured result.
 */
export async function processTextIngestMessage(
  input: TextIngestPayload
): Promise<TextIngestStructuredResult> {
  const payloadForLog: TextIngestPayload = {
    text: input.text,
    ...(input.source !== undefined ? { source: input.source } : {}),
  };

  console.log("[textIngest.service] received message:", JSON.stringify(payloadForLog));

  const preview =
    input.text.length <= PREVIEW_MAX_LENGTH
      ? input.text
      : `${input.text.slice(0, PREVIEW_MAX_LENGTH)}…`;

  return {
    id: randomUUID(),
    receivedAt: new Date().toISOString(),
    preview,
    sourceLabel: input.source ?? "unknown",
  };
}
