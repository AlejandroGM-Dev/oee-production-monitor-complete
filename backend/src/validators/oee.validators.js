import { AppError } from "../errors/index.js";
import {
  getCurrentIsoTimestamp,
  getStartOfUtcDay,
  isValidIsoDate,
  toIsoString,
} from "../utils/index.js";

const parseOptionalIsoDate = (value, fieldName, fallbackValue) => {
  if (value === undefined || value === null || value === "") {
    return fallbackValue;
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

export const parseOeeQuery = (query) => {
  const now = new Date();

  const from = parseOptionalIsoDate(
    query.from,
    "from",
    getStartOfUtcDay(now),
  );

  const to = parseOptionalIsoDate(
    query.to,
    "to",
    getCurrentIsoTimestamp(),
  );

  if (new Date(from).getTime() >= new Date(to).getTime()) {
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
  };
};