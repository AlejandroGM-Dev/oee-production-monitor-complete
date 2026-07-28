import { AppError } from "../errors/index.js";
import {
  findAllMachines,
  findLatestAlarmByMachineId,
  findLatestStateChangeByMachineId,
  findMachineById,
} from "../repositories/index.js";
import { DEFAULT_MACHINE_STATE, MACHINE_STATES } from "../utils/index.js";

const buildMachineStatus = async (machine) => {
  const latestStateChange = await findLatestStateChangeByMachineId(machine.id);
  const currentState = latestStateChange?.newState ?? DEFAULT_MACHINE_STATE;

  const latestAlarm =
    currentState === MACHINE_STATES.ALARM
      ? await findLatestAlarmByMachineId(machine.id)
      : null;

  return {
    ...machine,
    currentState,
    latestStateChange,
    activeAlarm: latestAlarm,
  };
};

export const getMachines = async () => {
  const machines = await findAllMachines();

  return Promise.all(machines.map(buildMachineStatus));
};

export const getMachineById = async (machineId) => {
  const machine = await findMachineById(machineId);

  if (!machine) {
    throw new AppError({
      statusCode: 404,
      code: "MACHINE_NOT_FOUND",
      message: `Machine with id ${machineId} was not found.`,
    });
  }

  return buildMachineStatus(machine);
};