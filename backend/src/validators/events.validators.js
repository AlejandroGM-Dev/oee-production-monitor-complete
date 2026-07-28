import { AppError } from "../errors/index.js";
import {
  isValidIsoDate,
  MACHINE_EVENT_TYPES,
  MACHINE_STATES,
  toIsoString,
} from "../utils/index.js";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;
const DEFAULT_OFFSET = 0;

const allowedEventTypes = new Set(Object.values(MACHINE_EVENT_TYPES));
const allowedMachineStates = new Set(Object.values(MACHINE_STATES));

const parseOptionalIsoDate = (value, fieldName) => {
  if (value === undefined) {
    return null;
  }

  if (!isValidIsoDate(value)) {
    throw new AppError({
      statusCode: 400,
      code: "INVALID_QUERY_PARAM",
      message: `${fieldName} must be a valid ISO date.`,
      details: {
        field: fieldName,
        value,
      },
    });
  }

  return toIsoString(value);
};

const parseOptionalEventType = (value) => {
  if (value === undefined) {
    return null;
  }

  if (!allowedEventTypes.has(value)) {
    throw new AppError({
      statusCode: 400,
      code: "INVALID_QUERY_PARAM",
      message: "type must be a valid machine event type.",
      details: {
        field: "type",
        value,
        allowedValues: [...allowedEventTypes],
      },
    });
  }

  return value;
};

const parseOptionalLimit = (value) => {
  if (value === undefined) {
    return DEFAULT_LIMIT;
  }

  const parsedValue = Number(value);

  if (
    !Number.isInteger(parsedValue) ||
    parsedValue <= 0 ||
    parsedValue > MAX_LIMIT ||
    String(parsedValue) !== String(value)
  ) {
    throw new AppError({
      statusCode: 400,
      code: "INVALID_QUERY_PARAM",
      message: `limit must be an integer between 1 and ${MAX_LIMIT}.`,
      details: {
        field: "limit",
        value,
      },
    });
  }

  return parsedValue;
};

const parseOptionalOffset = (value) => {
  if (value === undefined) {
    return DEFAULT_OFFSET;
  }

  const parsedValue = Number(value);

  if (
    !Number.isInteger(parsedValue) ||
    parsedValue < 0 ||
    String(parsedValue) !== String(value)
  ) {
    throw new AppError({
      statusCode: 400,
      code: "INVALID_QUERY_PARAM",
      message: "offset must be an integer greater than or equal to 0.",
      details: {
        field: "offset",
        value,
      },
    });
  }

  return parsedValue;
};

export const parseEventHistoryQuery = (query) => {
  const from = parseOptionalIsoDate(query.from, "from");
  const to = parseOptionalIsoDate(query.to, "to");
  const type = parseOptionalEventType(query.type);
  const limit = parseOptionalLimit(query.limit);
  const offset = parseOptionalOffset(query.offset);

  if (from && to && new Date(from).getTime() >= new Date(to).getTime()) {
    throw new AppError({
      statusCode: 400,
      code: "INVALID_DATE_RANGE",
      message: "from must be earlier than to.",
      details: {
        from,
        to,
      },
    });
  }

  return {
    from,
    to,
    type,
    limit,
    offset,
  };
};

const ensurePlainObject = (value) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new AppError({
      statusCode: 400,
      code: "INVALID_REQUEST_BODY",
      message: "Request body must be a JSON object.",
      details: null,
    });
  }
};

const parseRequiredEventType = (value) => {
  if (!allowedEventTypes.has(value)) {
    throw new AppError({
      statusCode: 400,
      code: "INVALID_EVENT_TYPE",
      message: "eventType must be a valid machine event type.",
      details: {
        field: "eventType",
        value,
        allowedValues: [...allowedEventTypes],
      },
    });
  }

  return value;
};

const parseOptionalTimestamp = (value) => {
  if (value === undefined || value === null || value === "") {
    return new Date().toISOString();
  }

  if (!isValidIsoDate(value)) {
    throw new AppError({
      statusCode: 400,
      code: "INVALID_EVENT_TIMESTAMP",
      message: "timestamp must be a valid ISO date.",
      details: {
        field: "timestamp",
        value,
      },
    });
  }

  return toIsoString(value);
};

const parseRequiredMachineState = (value, fieldName) => {
  if (!allowedMachineStates.has(value)) {
    throw new AppError({
      statusCode: 400,
      code: "INVALID_MACHINE_STATE",
      message: `${fieldName} must be a valid machine state.`,
      details: {
        field: fieldName,
        value,
        allowedValues: [...allowedMachineStates],
      },
    });
  }

  return value;
};

const parseOptionalText = (value, fieldName) => {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== "string") {
    throw new AppError({
      statusCode: 400,
      code: "INVALID_TEXT_FIELD",
      message: `${fieldName} must be a string.`,
      details: {
        field: fieldName,
        value,
      },
    });
  }

  const trimmedValue = value.trim();

  return trimmedValue === "" ? null : trimmedValue;
};

const parseRequiredUnitsProduced = (value) => {
  const parsedValue = Number(value);

  if (
    !Number.isInteger(parsedValue) ||
    parsedValue < 0 ||
    String(parsedValue) !== String(value)
  ) {
    throw new AppError({
      statusCode: 400,
      code: "INVALID_UNITS_PRODUCED",
      message: "unitsProduced must be an integer greater than or equal to 0.",
      details: {
        field: "unitsProduced",
        value,
      },
    });
  }

  return parsedValue;
};

const rejectFields = (body, fields, eventType) => {
  const presentFields = fields.filter(
    (field) => body[field] !== undefined && body[field] !== null,
  );

  if (presentFields.length > 0) {
    throw new AppError({
      statusCode: 400,
      code: "INCOMPATIBLE_EVENT_FIELDS",
      message: `Fields ${presentFields.join(", ")} are not allowed for ${eventType}.`,
      details: {
        eventType,
        fields: presentFields,
      },
    });
  }
};

export const parseCreateEventBody = (body) => {
  ensurePlainObject(body);

  const eventType = parseRequiredEventType(body.eventType);
  const timestamp = parseOptionalTimestamp(body.timestamp);

  if (eventType === MACHINE_EVENT_TYPES.STATE_CHANGE) {
    rejectFields(
      body,
      ["alarmCode", "alarmMessage", "unitsProduced"],
      eventType,
    );

    return {
      eventType,
      timestamp,
      newState: parseRequiredMachineState(body.newState, "newState"),
    };
  }

  if (eventType === MACHINE_EVENT_TYPES.ALARM) {
    rejectFields(
      body,
      ["previousState", "newState", "unitsProduced"],
      eventType,
    );

    const alarmCode = parseOptionalText(body.alarmCode, "alarmCode");
    const alarmMessage = parseOptionalText(
      body.alarmMessage,
      "alarmMessage",
    );

    if (!alarmCode && !alarmMessage) {
      throw new AppError({
        statusCode: 400,
        code: "MISSING_ALARM_DETAILS",
        message: "ALARM events require alarmCode or alarmMessage.",
        details: {
          requiredAnyOf: ["alarmCode", "alarmMessage"],
        },
      });
    }

    return {
      eventType,
      timestamp,
      alarmCode,
      alarmMessage,
    };
  }

  if (eventType === MACHINE_EVENT_TYPES.PRODUCTION_COUNT) {
    rejectFields(
      body,
      ["previousState", "newState", "alarmCode", "alarmMessage"],
      eventType,
    );

    return {
      eventType,
      timestamp,
      unitsProduced: parseRequiredUnitsProduced(body.unitsProduced),
    };
  }

  throw new AppError({
    statusCode: 400,
    code: "INVALID_EVENT_TYPE",
    message: "Unsupported event type.",
    details: {
      eventType,
    },
  });
};