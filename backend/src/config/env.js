import dotenv from "dotenv";

dotenv.config();

const parsePort = (value) => {
  const port = Number(value);

  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error("PORT must be a valid integer between 1 and 65535.");
  }

  return port;
};

export const env = Object.freeze({
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: parsePort(process.env.PORT ?? "3000"),
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:5173",
  databasePath: process.env.DATABASE_PATH ?? "./data/oee-monitor.sqlite",
});
