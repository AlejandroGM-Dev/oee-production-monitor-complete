import { getDatabase } from "../database/index.js";
import { AppError } from "../errors/index.js";
import {
  countEventsByMachineId,
  findEventsByMachineId,
  findLatestStateChangeByMachineId,
  findMachineById,
  insertMachineEvent,
} from "../repositories/index.js";
import {
  DEFAULT_MACHINE_STATE,
  MACHINE_EVENT_TYPES,
  MACHINE_STATES,
} from "../utils/index.js";

export const getMachineEvents = async ({
  machineId,
  filters,
}) => {
  const machine = await findMachineById(machineId);

  if (!machine) {
    throw new AppError({
      statusCode: 404,
      code: "MACHINE_NOT_FOUND",
      message: `Machine with id ${machineId} was not found.`,
    });
  }

  const [events, total] = await Promise.all([
    findEventsByMachineId({
      machineId,
      ...filters,
    }),
    countEventsByMachineId({
      machineId,
      from: filters.from,
      to: filters.to,
      type: filters.type,
    }),
  ]);

  return {
    machine,
    events,
    pagination: {
      total,
      limit: filters.limit,
      offset: filters.offset,
      returned: events.length,
    },
    filters: {
      from: filters.from,
      to: filters.to,
      type: filters.type,
    },
  };
};

const getCurrentMachineState = async (machineId) => {
  const latestStateChange = await findLatestStateChangeByMachineId(machineId);

  return latestStateChange?.newState ?? DEFAULT_MACHINE_STATE;
};

const createStateChangeEvent = async ({
  database,
  machineId,
  currentState,
  newState,
  timestamp,
}) => {
  if (currentState === newState) {
    throw new AppError({
      statusCode: 409,
      code: "REDUNDANT_STATE_CHANGE",
      message: `Machine is already in state ${newState}.`,
      details: {
        currentState,
        newState,
      },
    });
  }

  return insertMachineEvent({
    database,
    machineId,
    eventType: MACHINE_EVENT_TYPES.STATE_CHANGE,
    previousState: currentState,
    newState,
    timestamp,
  });
};

const createAlarmEvent = async ({
  database,
  machineId,
  currentState,
  alarmCode,
  alarmMessage,
  timestamp,
}) => {
  const createdEvents = [];

  if (currentState !== MACHINE_STATES.ALARM) {
    const stateChangeEvent = await insertMachineEvent({
      database,
      machineId,
      eventType: MACHINE_EVENT_TYPES.STATE_CHANGE,
      previousState: currentState,
      newState: MACHINE_STATES.ALARM,
      timestamp,
    });

    createdEvents.push(stateChangeEvent);
  }

  const alarmEvent = await insertMachineEvent({
    database,
    machineId,
    eventType: MACHINE_EVENT_TYPES.ALARM,
    alarmCode,
    alarmMessage,
    timestamp,
  });

  createdEvents.push(alarmEvent);

  return createdEvents;
};

const createProductionCountEvent = async ({
  database,
  machineId,
  unitsProduced,
  timestamp,
}) =>
  insertMachineEvent({
    database,
    machineId,
    eventType: MACHINE_EVENT_TYPES.PRODUCTION_COUNT,
    unitsProduced,
    timestamp,
  });

export const createMachineEvent = async ({
  machineId,
  eventInput,
}) => {
  const machine = await findMachineById(machineId);

  if (!machine) {
    throw new AppError({
      statusCode: 404,
      code: "MACHINE_NOT_FOUND",
      message: `Machine with id ${machineId} was not found.`,
    });
  }

  const database = await getDatabase();
  const currentState = await getCurrentMachineState(machineId);

  await database.exec("BEGIN TRANSACTION;");

  try {
    let createdEvents;

    if (eventInput.eventType === MACHINE_EVENT_TYPES.STATE_CHANGE) {
      const event = await createStateChangeEvent({
        database,
        machineId,
        currentState,
        newState: eventInput.newState,
        timestamp: eventInput.timestamp,
      });

      createdEvents = [event];
    }

    if (eventInput.eventType === MACHINE_EVENT_TYPES.ALARM) {
      createdEvents = await createAlarmEvent({
        database,
        machineId,
        currentState,
        alarmCode: eventInput.alarmCode,
        alarmMessage: eventInput.alarmMessage,
        timestamp: eventInput.timestamp,
      });
    }

    if (eventInput.eventType === MACHINE_EVENT_TYPES.PRODUCTION_COUNT) {
      const event = await createProductionCountEvent({
        database,
        machineId,
        unitsProduced: eventInput.unitsProduced,
        timestamp: eventInput.timestamp,
      });

      createdEvents = [event];
    }

    await database.exec("COMMIT;");

    return {
      machine,
      previousState: currentState,
      currentState:
        createdEvents.find(
          (event) => event.eventType === MACHINE_EVENT_TYPES.STATE_CHANGE,
        )?.newState ?? currentState,
      createdEvents,
    };
  } catch (error) {
    await database.exec("ROLLBACK;");
    throw error;
  }
};