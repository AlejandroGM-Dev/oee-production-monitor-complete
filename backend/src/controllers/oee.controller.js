import { getMachineOee } from "../services/index.js";
import {
  parseOeeQuery,
  parsePositiveIntegerParam,
} from "../validators/index.js";

export const getOee = async (request, response, next) => {
  try {
    const machineId = parsePositiveIntegerParam(request.params.id, "id");
    const range = parseOeeQuery(request.query);

    const result = await getMachineOee({
      machineId,
      range,
    });

    response.status(200).json({
      data: {
        machineId: result.machine.id,
        machineName: result.machine.name,
        machineType: result.machine.type,
        targetRatePerHour: result.machine.targetRatePerHour,
        from: result.range.from,
        to: result.range.to,
        initialState: result.initialState,
        durationsMs: result.durationsMs,
        totalTimeMs: result.totalTimeMs,
        plannedTimeMs: result.plannedTimeMs,
        runningTimeMs: result.runningTimeMs,
        maintenanceTimeMs: result.maintenanceTimeMs,
        unitsProduced: result.unitsProduced,
        targetUnits: result.targetUnits,
        availability: result.availability,
        performance: result.performance,
        quality: result.quality,
        oee: result.oee,
        percentages: result.percentages,
      },
      meta: {
        assumptions: result.assumptions,
      },
    });
  } catch (error) {
    next(error);
  }
};