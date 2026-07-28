import { AppError } from "../errors/index.js";
import {
  findLastStateChangeAtOrBefore,
  findMachineById,
  findStateChangesInsideRange,
  sumProducedUnitsInsideRange,
} from "../repositories/index.js";
import {
  DEFAULT_MACHINE_STATE,
  MACHINE_STATES,
} from "../utils/index.js";

const initializeDurations = () => ({
  [MACHINE_STATES.RUNNING]: 0,
  [MACHINE_STATES.STOPPED]: 0,
  [MACHINE_STATES.ALARM]: 0,
  [MACHINE_STATES.MAINTENANCE]: 0,
});

const getDurationMs = (from, to) =>
  new Date(to).getTime() - new Date(from).getTime();

export const calculateStateDurations = ({
  initialState,
  stateChanges,
  from,
  to,
}) => {
  const durations = initializeDurations();

  let currentState = initialState;
  let cursorTime = new Date(from).getTime();
  const endTime = new Date(to).getTime();

  for (const stateChange of stateChanges) {
    const eventTime = new Date(stateChange.timestamp).getTime();

    if (eventTime < cursorTime || eventTime > endTime) {
      continue;
    }

    durations[currentState] += eventTime - cursorTime;

    currentState = stateChange.newState;
    cursorTime = eventTime;
  }

  durations[currentState] += endTime - cursorTime;

  return durations;
};

const safeRatio = (numerator, denominator) => {
  if (denominator <= 0) {
    return null;
  }

  return numerator / denominator;
};

const toPercentage = (ratio) => {
  if (ratio === null) {
    return null;
  }

  return Number((ratio * 100).toFixed(2));
};

const roundRatio = (ratio) => {
  if (ratio === null) {
    return null;
  }

  return Number(ratio.toFixed(4));
};

export const getMachineOee = async ({
  machineId,
  range,
}) => {
  const machine = await findMachineById(machineId);

  if (!machine) {
    throw new AppError({
      statusCode: 404,
      code: "MACHINE_NOT_FOUND",
      message: `Machine with id ${machineId} was not found.`,
    });
  }

  const [initialStateChange, stateChanges, unitsProduced] =
    await Promise.all([
      findLastStateChangeAtOrBefore({
        machineId,
        timestamp: range.from,
      }),
      findStateChangesInsideRange({
        machineId,
        from: range.from,
        to: range.to,
      }),
      sumProducedUnitsInsideRange({
        machineId,
        from: range.from,
        to: range.to,
      }),
    ]);

  const initialState =
    initialStateChange?.newState ?? DEFAULT_MACHINE_STATE;

  const durationsMs = calculateStateDurations({
    initialState,
    stateChanges,
    from: range.from,
    to: range.to,
  });

  const totalTimeMs = getDurationMs(range.from, range.to);
  const runningTimeMs = durationsMs[MACHINE_STATES.RUNNING];
  const maintenanceTimeMs = durationsMs[MACHINE_STATES.MAINTENANCE];
  const plannedTimeMs = totalTimeMs - maintenanceTimeMs;

  const runningHours = runningTimeMs / 1000 / 60 / 60;
  const targetUnits = machine.targetRatePerHour * runningHours;

  const availability = safeRatio(runningTimeMs, plannedTimeMs);
  const performance = safeRatio(unitsProduced, targetUnits);
  const quality = 1;

  const oee =
    availability === null || performance === null
      ? null
      : availability * performance * quality;

  return {
    machine,
    range,
    initialState,
    durationsMs,
    totalTimeMs,
    plannedTimeMs,
    runningTimeMs,
    maintenanceTimeMs,
    unitsProduced,
    targetUnits: Number(targetUnits.toFixed(2)),
    availability: roundRatio(availability),
    performance: roundRatio(performance),
    quality,
    oee: roundRatio(oee),
    percentages: {
      availability: toPercentage(availability),
      performance: toPercentage(performance),
      quality: 100,
      oee: toPercentage(oee),
    },
    assumptions: [
      "Quality is assumed to be 100%.",
      "Production count events are treated as incremental units.",
      "MAINTENANCE time is excluded from planned production time.",
      "Intervals are calculated as [from, to).",
      "The initial state is derived from the latest STATE_CHANGE at or before from; if none exists, STOPPED is assumed.",
    ],
  };
};