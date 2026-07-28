export const getStateLabel = (state) => {
  const labels = {
    RUNNING: "Produciendo",
    STOPPED: "Detenida",
    ALARM: "En alarma",
    MAINTENANCE: "Mantenimiento",
  };

  return labels[state] ?? state ?? "Sin estado";
};

export const getStateClassName = (state) => {
  const classNames = {
    RUNNING: "status-running",
    STOPPED: "status-stopped",
    ALARM: "status-alarm",
    MAINTENANCE: "status-maintenance",
  };

  return classNames[state] ?? "status-unknown";
};