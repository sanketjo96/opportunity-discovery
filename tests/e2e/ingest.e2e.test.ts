import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "../../src/server";

/**
 * E2E tests for POST /api/ingest.
 * Positive path (queue + Redis) requires a reachable Redis matching REDIS_* in `.env`.
 */
describe("POST /api/ingest", () => {
  const app = createApp();

  const validTelegramUpdate = {
    update_id: 123456789,
    message: {
      message_id: 1,
      from: {
        id: 987654321,
        is_bot: false,
        first_name: "Sanket",
        username: "sanket_user",
      },
      chat: {
        id: 987654321,
        first_name: "Sanket",
        username: "sanket_user",
        type: "private",
      },
      date: 1710000000,
      text: "Looking for actors for web series",
    },
  };

  it("returns 200 with jobId for a valid Telegram update", async () => {
    const res = await request(app).post("/api/ingest").send(validTelegramUpdate).expect(200);

    expect(res.body).toMatchObject({ success: true });
    expect(typeof res.body.jobId).toBe("string");
    expect(res.body.jobId.length).toBeGreaterThan(0);
  });

  it("returns 400 when body is not a Telegram-shaped update", async () => {
    const res = await request(app).post("/api/ingest").send({ update_id: 1 }).expect(400);

    expect(res.body).toMatchObject({
      error: "Bad Request",
    });
    expect(typeof res.body.message).toBe("string");
  });

  it("returns 400 when message.text is missing or empty", async () => {
    await request(app)
      .post("/api/ingest")
      .send({
        ...validTelegramUpdate,
        message: { ...validTelegramUpdate.message, text: "   " },
      })
      .expect(400);
  });

  it("returns 400 when update_id is not a number", async () => {
    await request(app)
      .post("/api/ingest")
      .send({
        ...validTelegramUpdate,
        update_id: "123456789",
      })
      .expect(400);
  });

  it("returns 400 for malformed JSON body", async () => {
    const res = await request(app)
      .post("/api/ingest")
      .set("Content-Type", "application/json")
      .send("not valid json{")
      .expect(400);

    expect(res.body).toMatchObject({
      error: "Bad Request",
      message: "Invalid JSON body",
    });
  });
});

describe("GET /health", () => {
  it("returns ok", async () => {
    const app = createApp();
    await request(app).get("/health").expect(200).expect({ status: "ok" });
  });
});
