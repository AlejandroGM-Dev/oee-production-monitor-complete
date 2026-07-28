export const formatPercent = (value) => {
  if (value === null || value === undefined) {
    return "N/D";
  }

  return `${Number(value).toFixed(2)}%`;
};

export const formatDateTime = (value) => {
  if (!value) {
    return "N/D";
  }

  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

export const formatDuration = (milliseconds) => {
  if (milliseconds === null || milliseconds === undefined) {
    return "N/D";
  }

  const totalMinutes = Math.round(milliseconds / 1000 / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes} min`;
  }

  if (minutes === 0) {
    return `${hours} h`;
  }

  return `${hours} h ${minutes} min`;
};

export const toDatetimeLocalValue = (date) => {
  const currentDate = date instanceof Date ? date : new Date(date);
  const timezoneOffsetMs = currentDate.getTimezoneOffset() * 60 * 1000;
  const localDate = new Date(currentDate.getTime() - timezoneOffsetMs);

  return localDate.toISOString().slice(0, 16);
};

export const datetimeLocalToIso = (value) => {
  if (!value) {
    return "";
  }

  return new Date(value).toISOString();
};