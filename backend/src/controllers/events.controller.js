import {
  createMachineEvent,
  getMachineEvents,
} from "../services/index.js";
import {
  parseCreateEventBody,
  parseEventHistoryQuery,
  parsePositiveIntegerParam,
} from "../validators/index.js";

export const listMachineEvents = async (request, response, next) => {
  try {
    const machineId = parsePositiveIntegerParam(request.params.id, "id");
    const filters = parseEventHistoryQuery(request.query);

    const result = await getMachineEvents({
      machineId,
      filters,
    });

    response.status(200).json({
      data: result.events,
      meta: {
        machine: result.machine,
        pagination: result.pagination,
        filters: result.filters,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createEvent = async (request, response, next) => {
  try {
    const machineId = parsePositiveIntegerParam(request.params.id, "id");
    const eventInput = parseCreateEventBody(request.body);

    const result = await createMachineEvent({
      machineId,
      eventInput,
    });

    response.status(201).json({
      data: result.createdEvents,
      meta: {
        machine: result.machine,
        previousState: result.previousState,
        currentState: result.currentState,
      },
    });
  } catch (error) {
    next(error);
  }
};