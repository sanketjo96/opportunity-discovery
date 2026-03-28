import "dotenv/config";

import express from "express";
import { Worker, type Job } from "bullmq";

import { connectMongo } from "../config/mongodb";
import { getBullMQConnectionOptions } from "../config/redis";
import { OpportunityModel } from "../models/opportunity.models";
import { extractOpportunity } from "../services/llm.service";
import type { Opportunity } from "../types/llm/opportunity";
import type { TelegramTextIngestPayload } from "../types/telegramTextIngest.types";
import { IngestJobStage, type IngestJobResult } from "../types/queue";

const PROCESS_MESSAGE = "process-message";

function getTelegramPlainText(message: TelegramTextIngestPayload["message"]): string {
  const fromText = message.text?.trim() ?? "";
  const fromCaption = message.caption?.trim() ?? "";
  return fromText.length > 0 ? fromText : fromCaption;
}

function buildMongoDoc(
  payload: TelegramTextIngestPayload,
  rawText: string,
  opportunity: Opportunity
): Parameters<typeof OpportunityModel.create>[0] {
  const { message } = payload;

  return {
    source: "telegram",
    rawText,
    title: opportunity.title,
    description: opportunity.description,
    category: opportunity.category,
    ...(opportunity.roles?.length ? { roles: opportunity.roles } : {}),
    ...(opportunity.ageRange ? { ageRange: opportunity.ageRange } : {}),
    ...(opportunity.location ? { location: opportunity.location } : {}),
    ...(opportunity.language ? { language: opportunity.language } : {}),
    ...(opportunity.email ? { email: opportunity.email } : {}),
    ...(opportunity.url ? { url: opportunity.url } : {}),
    ...(opportunity.contact ? { contact: opportunity.contact } : {}),
    ...(opportunity.deadline ? { deadline: opportunity.deadline } : {}),
    metadata: {
      updateId: payload.update_id,
      messageId: message.message_id,
      date: message.date,
      chatId: message.chat.id,
      chatType: message.chat.type,
      ...(message.chat.username ? { chatUsername: message.chat.username } : {}),
      fromUserId: message.from.id,
      fromIsBot: message.from.is_bot,
      fromFirstName: message.from.first_name,
      ...(message.from.username ? { fromUsername: message.from.username } : {}),
      ...(message.from.last_name ? { fromLastName: message.from.last_name } : {}),
    },
  };
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
    let opportunity: Opportunity;
    try {
      opportunity = await extractOpportunity(extractedText);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("[ingest.worker] LLM extraction failed", { jobId: job.id, error: message });
      throw err;
    }

    try {
      await connectMongo();
      const doc = await OpportunityModel.create(buildMongoDoc(payload, extractedText, opportunity));
      const mongoDocumentId = String(doc._id);
      console.log("[ingest.worker] MongoDB save success", { jobId: job.id, mongoDocumentId });

      await job.updateProgress({ stage: IngestJobStage.COMPLETED });

      const result: IngestJobResult = {
        updateId: payload.update_id,
        messageId: payload.message.message_id,
        extractedText,
        opportunity,
        mongoDocumentId,
      };

      console.log("[ingest.worker] extracted opportunity:", JSON.stringify(result, null, 2));

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("[ingest.worker] MongoDB save failed", {
        jobId: job.id,
        updateId: payload.update_id,
        messageId: payload.message.message_id,
        error: message,
      });
      throw err;
    }
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
  console.error("[ingest.worker] failed", {
    jobId: job?.id,
    name: job?.name,
    error: err.message,
  });
});

// This is to handle deployment of worker at free tier servers of render.com
// Remove this code post MVP
const app = express();
const WORKER_PORT = Number(process.env.WORKER_PORT) || 3000;
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", service: "ingest-worker" });
});

app.listen(WORKER_PORT, () => {
  console.log(`Server listening on http://localhost:${WORKER_PORT}`);
});