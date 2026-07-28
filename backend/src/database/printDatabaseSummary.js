import { initializeDatabase } from "./database.service.js";
import { closeDatabase, getDatabase } from "./connection.js";

const printDatabaseSummary = async () => {
  await initializeDatabase();

  const database = await getDatabase();

  const machines = await database.all(
    `
      SELECT
        id,
        name,
        type,
        target_rate_per_hour AS targetRatePerHour,
        created_at AS createdAt
      FROM machines
      ORDER BY id ASC
    `,
  );

  const events = await database.all(
    `
      SELECT
        id,
        machine_id AS machineId,
        event_type AS eventType,
        previous_state AS previousState,
        new_state AS newState,
        alarm_code AS alarmCode,
        alarm_message AS alarmMessage,
        units_produced AS unitsProduced,
        timestamp
      FROM machine_events
      ORDER BY timestamp ASC, id ASC
      LIMIT 20
    `,
  );

  console.log("\nMachines");
  console.table(machines);

  console.log("\nMachine events");
  console.table(events);
};

printDatabaseSummary()
  .catch((error) => {
    console.error("Could not print database summary:");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDatabase();
  });
