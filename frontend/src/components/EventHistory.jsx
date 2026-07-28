import {
  formatDateTime,
  getStateClassName,
  getStateLabel,
} from "../utils";

const getEventDescription = (event) => {
  if (event.eventType === "STATE_CHANGE") {
    return `${getStateLabel(event.previousState)} → ${getStateLabel(event.newState)}`;
  }

  if (event.eventType === "ALARM") {
    return `${event.alarmCode ? `${event.alarmCode} — ` : ""}${
      event.alarmMessage ?? "Alarma sin mensaje"
    }`;
  }

  if (event.eventType === "PRODUCTION_COUNT") {
    return `${event.unitsProduced} unidades`;
  }

  return "Evento";
};

export const EventHistory = ({
  events,
  pagination,
  onPreviousPage,
  onNextPage,
}) => {
  if (!events.length) {
    return (
      <div className="empty-state">
        No hay eventos para los filtros seleccionados.
      </div>
    );
  }

  const canGoPrevious = pagination.offset > 0;
  const canGoNext = pagination.offset + pagination.returned < pagination.total;

  return (
    <div className="event-history">
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Detalle</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id}>
                <td>{formatDateTime(event.timestamp)}</td>
                <td>
                  <span className="event-type-pill">{event.eventType}</span>
                </td>
                <td>
                  {event.eventType === "STATE_CHANGE" ? (
                    <span className={`state-pill ${getStateClassName(event.newState)}`}>
                      {getEventDescription(event)}
                    </span>
                  ) : (
                    getEventDescription(event)
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination-row">
        <span>
          Mostrando {pagination.returned} de {pagination.total} eventos
        </span>

        <div>
          <button
            className="button-link secondary small"
            type="button"
            disabled={!canGoPrevious}
            onClick={onPreviousPage}
          >
            Anterior
          </button>
          <button
            className="button-link secondary small"
            type="button"
            disabled={!canGoNext}
            onClick={onNextPage}
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
};