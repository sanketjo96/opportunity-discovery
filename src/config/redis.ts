import Redis, { type RedisOptions } from "ioredis";

function readPort(): number {
  const raw = process.env.REDIS_PORT?.trim();
  if (raw === undefined || raw.length === 0) {
    return 6379;
  }
  const port = Number.parseInt(raw, 10);
  if (Number.isNaN(port) || port < 1 || port > 65535) {
    throw new Error(`REDIS_PORT must be an integer 1–65535, received: ${JSON.stringify(raw)}`);
  }
  return port;
}

function readPassword(): string | undefined {
  const raw = process.env.REDIS_PASSWORD;
  if (raw === undefined || raw.length === 0) {
    return undefined;
  }
  return raw;
}

/**
 * Builds ioredis options from environment.
 * Requires `REDIS_HOST`. Uses `REDIS_PORT` (default 6379) and optional `REDIS_PASSWORD`.
 */
function buildRedisOptions(): RedisOptions {
  const host = process.env.REDIS_HOST?.trim();
  if (host === undefined || host.length === 0) {
    throw new Error("REDIS_HOST is required to initialize the Redis client");
  }

  const port = readPort();
  const password = readPassword();

  return {
    host,
    port,
    ...(password !== undefined ? { password } : {}),
    connectTimeout: 10_000,
    maxRetriesPerRequest: 3,
    retryStrategy(times: number): number | null {
      const delay = Math.min(times * 200, 2_000);
      return delay;
    },
  };
}

/**
 * Connection options for BullMQ ({@link https://docs.bullmq.io/guide/connections}).
 * Reuses the same host/port/password as {@link redis} with `maxRetriesPerRequest: null` as required by BullMQ.
 */
export function getBullMQConnectionOptions(): RedisOptions {
  return {
    ...buildRedisOptions(),
    maxRetriesPerRequest: null,
  };
}

function attachRedisListeners(client: Redis): void {
  client.on("error", (err: Error) => {
    console.error("[redis] error:", err.message);
  });

  client.on("connect", () => {
    console.log("[redis] socket connected");
  });

  client.on("ready", () => {
    console.log("[redis] ready to accept commands");
  });

  client.on("close", () => {
    console.warn("[redis] connection closed");
  });

  client.on("reconnecting", (timeUntilRetry: number) => {
    console.warn("[redis] reconnecting in", timeUntilRetry, "ms");
  });
}

/**
 * Shared Redis connection. Import this module early (e.g. from `server.ts`) so listeners attach at startup.
 */
export const redis: Redis = (() => {
  const options = buildRedisOptions();
  const client = new Redis(options);
  attachRedisListeners(client);
  return client;
})();
