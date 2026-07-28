export const isValidIsoDate = (value) => {
  if (typeof value !== "string" || value.trim() === "") {
    return false;
  }

  const date = new Date(value);

  return !Number.isNaN(date.getTime());
};

export const toIsoString = (value) => new Date(value).toISOString();

export const getStartOfUtcDay = (date = new Date()) =>
  new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      0,
      0,
      0,
      0,
    ),
  ).toISOString();

export const getCurrentIsoTimestamp = () => new Date().toISOString();