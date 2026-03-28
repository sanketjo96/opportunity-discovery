/**
 * Payload accepted by POST /api/ingest (e.g. Telegram webhook forwarding).
 */
export interface TextIngestPayload {
  text: string;
  source?: string;
}

/**
 * Mock structured output from the text ingest pipeline (placeholder until parsing/DB exist).
 */
export interface TextIngestStructuredResult {
  id: string;
  receivedAt: string;
  preview: string;
  sourceLabel: string;
}
