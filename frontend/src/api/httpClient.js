const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api";

export class ApiError extends Error {
  constructor({ message, status, code, details }) {
    super(message);

    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const requestJson = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const error = payload?.error;

    throw new ApiError({
      message: error?.message ?? "No se pudo completar la solicitud.",
      status: response.status,
      code: error?.code ?? "HTTP_ERROR",
      details: error?.details ?? null,
    });
  }

  return payload;
};