import { getDatabase } from "../database/index.js";
import { MACHINE_EVENT_TYPES } from "../utils/index.js";

const mapMachineRow = (row) => {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    type: row.type,
    targetRatePerHour: row.targetRatePerHour,
    createdAt: row.createdAt,
  };
};

const mapStateEventRow = (row) => {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    machineId: row.machineId,
    previousState: row.previousState,
    newState: row.newState,
    timestamp: row.timestamp,
  };
};

const mapAlarmEventRow = (row) => {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    machineId: row.machineId,
    alarmCode: row.alarmCode,
    alarmMessage: row.alarmMessage,
    timestamp: row.timestamp,
  };
};

export const findAllMachines = async () => {
  const database = await getDatabase();

  const rows = await database.all(
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

  return rows.map(mapMachineRow);
};

export const findMachineById = async (machineId) => {
  const database = await getDatabase();

  const row = await database.get(
    `
      SELECT
        id,
        name,
        type,
        target_rate_per_hour AS targetRatePerHour,
        created_at AS createdAt
      FROM machines
      WHERE id = ?
    `,
    [machineId],
  );

  return mapMachineRow(row);
};

export const findLatestStateChangeByMachineId = async (machineId) => {
  const database = await getDatabase();

  const row = await database.get(
    `
      SELECT
        id,
        machine_id AS machineId,
        previous_state AS previousState,
        new_state AS newState,
        timestamp
      FROM machine_events
      WHERE machine_id = ?
        AND event_type = ?
      ORDER BY timestamp DESC, id DESC
      LIMIT 1
    `,
    [machineId, MACHINE_EVENT_TYPES.STATE_CHANGE],
  );

  return mapStateEventRow(row);
};

export const findLatestAlarmByMachineId = async (machineId) => {
  const database = await getDatabase();

  const row = await database.get(
    `
      SELECT
        id,
        machine_id AS machineId,
        alarm_code AS alarmCode,
        alarm_message AS alarmMessage,
        timestamp
      FROM machine_events
      WHERE machine_id = ?
        AND event_type = ?
      ORDER BY timestamp DESC, id DESC
      LIMIT 1
    `,
    [machineId, MACHINE_EVENT_TYPES.ALARM],
  );

  return mapAlarmEventRow(row);
};