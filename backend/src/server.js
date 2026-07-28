import { createApp } from "./app.js";
import { env } from "./config/index.js";
import {
  closeDatabase,
  initializeDatabase,
} from "./database/index.js";

let server = null;

const startServer = async () => {
  await initializeDatabase();

  const app = createApp();

  server = app.listen(env.port, () => {
    console.log(
      `OEE Production Monitor API running at http://localhost:${env.port}`,
    );
  });
};

const shutdown = async (signal) => {
  console.log(`\n${signal} received. Closing application...`);

  if (server) {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });

    console.log("HTTP server closed.");
  }

  await closeDatabase();
  console.log("Database connection closed.");

  process.exit(0);
};

process.on("SIGINT", () => {
  shutdown("SIGINT").catch((error) => {
    console.error("Error during shutdown:", error);
    process.exit(1);
  });
});

process.on("SIGTERM", () => {
  shutdown("SIGTERM").catch((error) => {
    console.error("Error during shutdown:", error);
    process.exit(1);
  });
});

startServer().catch(async (error) => {
  console.error("Could not start the application:");
  console.error(error);

  await closeDatabase();

  process.exit(1);
});