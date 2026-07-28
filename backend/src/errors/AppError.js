export class AppError extends Error {
  constructor({
    statusCode,
    code,
    message,
    details = null,
    expose = true,
  }) {
    super(message);

    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.expose = expose;

    Error.captureStackTrace?.(this, AppError);
  }
}
