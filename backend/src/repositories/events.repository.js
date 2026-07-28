import { getDatabase } from "../database/index.js";

const mapEventRow = (row) => ({
  id: row.id,
  machineId: row.machineId,
  eventType: row.eventType,
  previousState: row.previousState,
  newState: row.newState,
  alarmCode: row.alarmCode,
  alarmMessage: row.alarmMessage,
  unitsProduced: row.unitsProduced,
  timestamp: row.timestamp,
  createdAt: row.createdAt,
});

const buildEventFilters = ({ machineId, from, to, type }) => {
  const whereClauses = ["machine_id = ?"];
  const params = [machineId];

  if (from) {
    whereClauses.push("timestamp >= ?");
    params.push(from);
  }

  if (to) {
    whereClauses.push("timestamp < ?");
    params.push(to);
  }

  if (type) {
    whereClauses.push("event_type = ?");
    params.push(type);
  }

  return {
    whereSql: whereClauses.join(" AND "),
    params,
  };
};

export const findEventsByMachineId = async ({
  machineId,
  from,
  to,
  type,
  limit,
  offset,
}) => {
  const database = await getDatabase();
  const { whereSql, params } = buildEventFilters({
    machineId,
    from,
    to,
    type,
  });

  const rows = await database.all(
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
        timestamp,
        created_at AS createdAt
      FROM machine_events
      WHERE ${whereSql}
      ORDER BY timestamp DESC, id DESC
      LIMIT ?
      OFFSET ?
    `,
    [...params, limit, offset],
  );

  return rows.map(mapEventRow);
};

export const countEventsByMachineId = async ({
  machineId,
  from,
  to,
  type,
}) => {
  const database = await getDatabase();
  const { whereSql, params } = buildEventFilters({
    machineId,
    from,
    to,
    type,
  });

  const row = await database.get(
    `
      SELECT COUNT(*) AS total
      FROM machine_events
      WHERE ${whereSql}
    `,
    params,
  );

  return row.total;
};

export const insertMachineEvent = async ({
  database,
  machineId,
  eventType,
  previousState = null,
  newState = null,
  alarmCode = null,
  alarmMessage = null,
  unitsProduced = null,
  timestamp,
}) => {
  const result = await database.run(
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
      machineId,
      eventType,
      previousState,
      newState,
      alarmCode,
      alarmMessage,
      unitsProduced,
      timestamp,
    ],
  );

  const row = await database.get(
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
        timestamp,
        created_at AS createdAt
      FROM machine_events
      WHERE id = ?
    `,
    [result.lastID],
  );

  return mapEventRow(row);
};

export const findLastStateChangeAtOrBefore = async ({
  machineId,
  timestamp,
}) => {
  const database = await getDatabase();

  const row = await database.get(
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
        timestamp,
        created_at AS createdAt
      FROM machine_events
      WHERE machine_id = ?
        AND event_type = 'STATE_CHANGE'
        AND timestamp <= ?
      ORDER BY timestamp DESC, id DESC
      LIMIT 1
    `,
    [machineId, timestamp],
  );

  return row ? mapEventRow(row) : null;
};

export const findStateChangesInsideRange = async ({
  machineId,
  from,
  to,
}) => {
  const database = await getDatabase();

  const rows = await database.all(
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
        timestamp,
        created_at AS createdAt
      FROM machine_events
      WHERE machine_id = ?
        AND event_type = 'STATE_CHANGE'
        AND timestamp > ?
        AND timestamp < ?
      ORDER BY timestamp ASC, id ASC
    `,
    [machineId, from, to],
  );

  return rows.map(mapEventRow);
};

export const sumProducedUnitsInsideRange = async ({
  machineId,
  from,
  to,
}) => {
  const database = await getDatabase();

  const row = await database.get(
    `
      SELECT
        COALESCE(SUM(units_produced), 0) AS totalUnits
      FROM machine_events
      WHERE machine_id = ?
        AND event_type = 'PRODUCTION_COUNT'
        AND timestamp >= ?
        AND timestamp < ?
    `,
    [machineId, from, to],
  );

  return row.totalUnits;
};