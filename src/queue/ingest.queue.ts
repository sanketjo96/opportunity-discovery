import { Queue } from "bullmq";

import { getBullMQConnectionOptions } from "../config/redis";

export const ingestQueue = new Queue("ingest", {
  connection: getBullMQConnectionOptions(),
});
