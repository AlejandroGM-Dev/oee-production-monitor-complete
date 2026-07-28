import cors from "cors";
import express from "express";

import { env } from "./config/index.js";
import { errorHandler, notFoundHandler } from "./middleware/index.js";
import { healthRouter, machinesRouter } from "./routes/index.js";

export const createApp = () => {
  const app = express();

  app.disable("x-powered-by");

  app.use(
    cors({
      origin: env.frontendUrl,
    }),
  );

  app.use(
    express.json({
      limit: "100kb",
    }),
  );

  app.get("/", (request, response) => {
    response.status(200).json({
      data: {
        name: "OEE Production Monitor API",
        version: "1.0.0",
      },
    });
  });

  app.use("/api/health", healthRouter);
  app.use("/api/machines", machinesRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};