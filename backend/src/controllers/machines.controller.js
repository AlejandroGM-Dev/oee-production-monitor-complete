import {
  getMachineById,
  getMachines,
} from "../services/index.js";
import { parsePositiveIntegerParam } from "../validators/index.js";

export const listMachines = async (request, response, next) => {
  try {
    const machines = await getMachines();

    response.status(200).json({
      data: machines,
    });
  } catch (error) {
    next(error);
  }
};

export const getMachine = async (request, response, next) => {
  try {
    const machineId = parsePositiveIntegerParam(request.params.id, "id");
    const machine = await getMachineById(machineId);

    response.status(200).json({
      data: machine,
    });
  } catch (error) {
    next(error);
  }
};