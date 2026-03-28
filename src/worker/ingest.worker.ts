import "dotenv/config";

import express from "express";

import { Worker, type Job } from "bullmq";

import { getBullMQConnectionOptions } from "../config/redis";
import { extractOpportunity } from "../services/llm.service";
import type { TelegramTextIngestPayload } from "../types/telegramTextIngest.types";
import { IngestJobStage, type IngestJobResult } from "../types/queue";

const PROCESS_MESSAGE = "process-message";

function getTelegramPlainText(message: TelegramTextIngestPayload["message"]): string {
  const fromText = message.text?.trim() ?? "";
  const fromCaption = message.caption?.trim() ?? "";
  return fromText.length > 0 ? fromText : fromCaption;
}

export const ingestWorker = new Worker(
  "ingest",
  async (job: Job<TelegramTextIngestPayload>): Promise<IngestJobResult | void> => {
    if (job.name !== PROCESS_MESSAGE) {
      console.warn("[ingest.worker] skipping job with unexpected name:", job.name);
      return;
    }

    await job.updateProgress({ stage: IngestJobStage.RECEIVED });
    console.log("[ingest.worker] job data:", JSON.stringify(job.data));

    const payload = job.data;
    const extractedText = getTelegramPlainText(payload.message);
    if (!extractedText) {
      throw new Error("No message text or caption to process");
    }

    await job.updateProgress({ stage: IngestJobStage.TEXT_EXTRACTED });

    await job.updateProgress({ stage: IngestJobStage.LLM_PROCESSING });
    const opportunity = await extractOpportunity(extractedText);

    await job.updateProgress({ stage: IngestJobStage.COMPLETED });

    const result: IngestJobResult = {
      updateId: payload.update_id,
      messageId: payload.message.message_id,
      extractedText,
      opportunity,
    };

    console.log("[ingest.worker] extracted opportunity:", JSON.stringify(result, null, 2));

    return result;
  },
  {
    connection: getBullMQConnectionOptions(),
    concurrency: 2,
  }
);

ingestWorker.on("completed", (job: Job) => {
  console.log("[ingest.worker] completed", {
    jobId: job.id,
    name: job.name,
    returnvalue: job.returnvalue,
  });
});

ingestWorker.on("failed", (job: Job | undefined, err: Error) => {
  console.error("[ingest.worker] failed", { jobId: job?.id, name: job?.name, error: err.message });
});


const app = express();
app.listen(3001, () => {
  console.log(`Server listening on http://localhost:${3001}`);
});