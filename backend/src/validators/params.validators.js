import { AppError } from "../errors/index.js";

export const parsePositiveIntegerParam = (value, fieldName) => {
  const parsedValue = Number(value);

  if (
    !Number.isInteger(parsedValue) ||
    parsedValue <= 0 ||
    String(parsedValue) !== String(value)
  ) {
    throw new AppError({
      statusCode: 400,
      code: "INVALID_ROUTE_PARAM",
      message: `${fieldName} must be a positive integer.`,
      details: {
        field: fieldName,
        value,
      },
    });
  }

  return parsedValue;
};