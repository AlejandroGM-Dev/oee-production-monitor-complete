import { AppError } from "../errors/index.js";

const isMalformedJsonError = (error) =>
  error instanceof SyntaxError &&
  error.status === 400 &&
  Object.prototype.hasOwnProperty.call(error, "body");

export const errorHandler = (error, request, response, next) => {
  if (response.headersSent) {
    return next(error);
  }

  if (isMalformedJsonError(error)) {
    return response.status(400).json({
      error: {
        code: "MALFORMED_JSON",
        message: "The request body contains invalid JSON.",
        details: null,
      },
    });
  }

  if (error instanceof AppError) {
    return response.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.expose
          ? error.message
          : "An unexpected error occurred.",
        details: error.expose ? error.details : null,
      },
    });
  }

  console.error(error);

  return response.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred.",
      details: null,
    },
  });
};
