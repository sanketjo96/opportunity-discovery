import "dotenv/config";

import { Worker, type Job } from "bullmq";

import { getBullMQConnectionOptions } from "../config/redis";

const PROCESS_MESSAGE = "process-message";

export const ingestWorker = new Worker(
  "ingest",
  async (job: Job) => {
    if (job.name !== PROCESS_MESSAGE) {
      console.warn("[ingest.worker] skipping job with unexpected name:", job.name);
      return;
    }

    console.log("[ingest.worker] job data:", JSON.stringify(job.data));
  },
  {
    connection: getBullMQConnectionOptions(),
    concurrency: 2,
  }
);

ingestWorker.on("completed", (job: Job, result: unknown) => {
  console.log("[ingest.worker] completed", { jobId: job.id, name: job.name, result });
});

ingestWorker.on("failed", (job: Job | undefined, err: Error) => {
  console.error("[ingest.worker] failed", { jobId: job?.id, name: job?.name, error: err.message });
});
