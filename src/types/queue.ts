import type { Opportunity } from "./opportunity";

export enum IngestJobStage {
  RECEIVED = "RECEIVED",
  TEXT_EXTRACTED = "TEXT_EXTRACTED",
  LLM_PROCESSING = "LLM_PROCESSING",
  COMPLETED = "COMPLETED",
}

/** Returned from successful `process-message` jobs (available as BullMQ `returnvalue`). */
export interface IngestJobResult {
  updateId: number;
  messageId: number;
  extractedText: string;
  opportunity: Opportunity;
}
