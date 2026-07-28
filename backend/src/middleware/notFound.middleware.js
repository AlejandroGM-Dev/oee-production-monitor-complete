import { AppError } from "../errors/index.js";

export const notFoundHandler = (request, response, next) => {
  next(
    new AppError({
      statusCode: 404,
      code: "ROUTE_NOT_FOUND",
      message: `Route ${request.method} ${request.originalUrl} was not found.`,
    }),
  );
};
