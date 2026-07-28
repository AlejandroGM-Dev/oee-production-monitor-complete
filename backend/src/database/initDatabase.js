import { closeDatabase } from "./connection.js";
import { initializeDatabase } from "./database.service.js";

initializeDatabase()
  .then(() => {
    console.log("Database initialized successfully.");
  })
  .catch((error) => {
    console.error("Database initialization failed:");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDatabase();
  });
