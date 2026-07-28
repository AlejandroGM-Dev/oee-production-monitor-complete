import { mkdir } from "node:fs/promises";
import { dirname, isAbsolute, resolve } from "node:path";

import sqlite3 from "sqlite3";
import { open } from "sqlite";

import { env } from "../config/index.js";

let database = null;

export const resolveDatabasePath = () => {
  if (isAbsolute(env.databasePath)) {
    return env.databasePath;
  }

  return resolve(process.cwd(), env.databasePath);
};

export const openDatabase = async () => {
  if (database) {
    return database;
  }

  const databasePath = resolveDatabasePath();

  await mkdir(dirname(databasePath), {
    recursive: true,
  });

  database = await open({
    filename: databasePath,
    driver: sqlite3.Database,
  });

  await database.exec("PRAGMA foreign_keys = ON;");

  return database;
};

export const getDatabase = async () => openDatabase();

export const closeDatabase = async () => {
  if (!database) {
    return;
  }

  await database.close();
  database = null;
};