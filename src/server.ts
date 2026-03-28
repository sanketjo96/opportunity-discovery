import "dotenv/config";

import express from "express";
import swaggerUi from "swagger-ui-express";

import "./config/redis";
import { apiRouter } from "./api";
import { swaggerSpec } from "./config/swagger";
import { errorMiddleware } from "./middleware/error.middleware";

const PORT = Number(process.env.PORT) || 3000;

function createApp(): express.Application {
  const app = express();

  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.use("/api", apiRouter);

  app.use(errorMiddleware);

  return app;
}

const app = createApp();

const isPrimaryModule = typeof require !== "undefined" && require.main === module;

if (isPrimaryModule) {
  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

export { app, createApp };
