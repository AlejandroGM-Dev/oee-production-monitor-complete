const getIsoMinutesAgo = (baseDate, minutesAgo) =>
  new Date(baseDate.getTime() - minutesAgo * 60 * 1000).toISOString();

const machines = [
  {
    id: 1,
    name: "Llenadora",
    type: "FILLER",
    targetRatePerHour: 1200,
  },
  {
    id: 2,
    name: "Etiquetadora",
    type: "LABELER",
    targetRatePerHour: 1000,
  },
  {
    id: 3,
    name: "Empacadora",
    type: "PACKER",
    targetRatePerHour: 900,
  },
];

export const seedInitialData = async (database) => {
  const now = new Date();
  const createdAt = now.toISOString();

  await database.exec("BEGIN TRANSACTION;");

  try {
    for (const machine of machines) {
      await database.run(
        `
          INSERT INTO machines (
            id,
            name,
            type,
            target_rate_per_hour,
            created_at
          )
          VALUES (?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            name = excluded.name,
            type = excluded.type,
            target_rate_per_hour = excluded.target_rate_per_hour
        `,
        [
          machine.id,
          machine.name,
          machine.type,
          machine.targetRatePerHour,
          createdAt,
        ],
      );
    }

    const existingEvents = await database.get(
      `
        SELECT COUNT(*) AS count
        FROM machine_events
      `,
    );

    if (existingEvents.count === 0) {
      const events = [
        {
          machineId: 1,
          eventType: "STATE_CHANGE",
          previousState: "STOPPED",
          newState: "RUNNING",
          timestamp: getIsoMinutesAgo(now, 480),
        },
        {
          machineId: 1,
          eventType: "PRODUCTION_COUNT",
          unitsProduced: 900,
          timestamp: getIsoMinutesAgo(now, 420),
        },
        {
          machineId: 1,
          eventType: "STATE_CHANGE",
          previousState: "RUNNING",
          newState: "STOPPED",
          timestamp: getIsoMinutesAgo(now, 300),
        },
        {
          machineId: 1,
          eventType: "STATE_CHANGE",
          previousState: "STOPPED",
          newState: "RUNNING",
          timestamp: getIsoMinutesAgo(now, 240),
        },
        {
          machineId: 1,
          eventType: "PRODUCTION_COUNT",
          unitsProduced: 1200,
          timestamp: getIsoMinutesAgo(now, 180),
        },
        {
          machineId: 1,
          eventType: "PRODUCTION_COUNT",
          unitsProduced: 900,
          timestamp: getIsoMinutesAgo(now, 60),
        },
        {
          machineId: 2,
          eventType: "STATE_CHANGE",
          previousState: "STOPPED",
          newState: "RUNNING",
          timestamp: getIsoMinutesAgo(now, 360),
        },
        {
          machineId: 2,
          eventType: "PRODUCTION_COUNT",
          unitsProduced: 700,
          timestamp: getIsoMinutesAgo(now, 300),
        },
        {
          machineId: 2,
          eventType: "STATE_CHANGE",
          previousState: "RUNNING",
          newState: "ALARM",
          timestamp: getIsoMinutesAgo(now, 120),
        },
        {
          machineId: 2,
          eventType: "ALARM",
          alarmCode: "E-204",
          alarmMessage: "Presión insuficiente en el sistema de etiquetado.",
          timestamp: getIsoMinutesAgo(now, 119),
        },
        {
          machineId: 3,
          eventType: "STATE_CHANGE",
          previousState: "STOPPED",
          newState: "MAINTENANCE",
          timestamp: getIsoMinutesAgo(now, 240),
        },
      ];

      for (const event of events) {
        await database.run(
          `
            INSERT INTO machine_events (
              machine_id,
              event_type,
              previous_state,
              new_state,
              alarm_code,
              alarm_message,
              units_produced,
              timestamp
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            event.machineId,
            event.eventType,
            event.previousState ?? null,
            event.newState ?? null,
            event.alarmCode ?? null,
            event.alarmMessage ?? null,
            event.unitsProduced ?? null,
            event.timestamp,
          ],
        );
      }
    }

    await database.exec("COMMIT;");
  } catch (error) {
    await database.exec("ROLLBACK;");
    throw error;
  }
};