import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { getDatabase } from "./connection.js";
import { seedInitialData } from "./seeds/seedInitialData.js";

const currentFilePath = fileURLToPath(import.meta.url);
const currentDirectory = dirname(currentFilePath);

const schemaPath = resolve(
  currentDirectory,
  "migrations",
  "001_initial_schema.sql",
);

export const initializeDatabase = async ({ seed = true } = {}) => {
  const database = await getDatabase();
  const schema = await readFile(schemaPath, "utf8");

  await database.exec(schema);

  if (seed) {
    await seedInitialData(database);
  }

  return database;
};
