import { unlink } from "node:fs/promises";

import {
  closeDatabase,
  resolveDatabasePath,
} from "./connection.js";
import { initializeDatabase } from "./database.service.js";

const resetDatabase = async () => {
  await closeDatabase();

  const databasePath = resolveDatabasePath();

  try {
    await unlink(databasePath);
    console.log(`Deleted existing database at ${databasePath}`);
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }

    console.log("No existing database file found. Creating a new one.");
  }

  await initializeDatabase({
    seed: true,
  });

  console.log("Database reset successfully.");
};

resetDatabase()
  .catch((error) => {
    console.error("Database reset failed:");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDatabase();
  });
