import "dotenv/config";

import { Worker, type Job } from "bullmq";

import { getBullMQConnectionOptions } from "../config/redis";
import { ProcessQueueStatus } from "../types/queue";

const PROCESS_MESSAGE = "process-message";

export const ingestWorker = new Worker(
  "ingest",
  async (job: Job) => {
    if (job.name !== PROCESS_MESSAGE) {
      console.warn("[ingest.worker] skipping job with unexpected name:", job.name);
      return;
    }

    await job.updateProgress({ status: ProcessQueueStatus.InProcess });
    console.log("[ingest.worker] job data:", JSON.stringify(job.data));
    await job.updateProgress({ status: ProcessQueueStatus.Completed });
  },
  {
    connection: getBullMQConnectionOptions(),
    concurrency: 2,
  }
);

ingestWorker.on("completed", (job: Job) => {
  console.log("[ingest.worker] completed", { jobId: job.id, name: job.name });
});

ingestWorker.on("failed", (job: Job | undefined, err: Error) => {
  console.error("[ingest.worker] failed", { jobId: job?.id, name: job?.name, error: err.message });
});
