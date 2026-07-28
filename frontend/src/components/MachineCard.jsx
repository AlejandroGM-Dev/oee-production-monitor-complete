import { Link } from "react-router-dom";

import {
  formatDateTime,
  formatPercent,
  getStateClassName,
  getStateLabel,
} from "../utils";

export const MachineCard = ({ machine, oee }) => (
  <article className="machine-card">
    <div className="machine-card__header">
      <div>
        <p className="eyebrow">{machine.type}</p>
        <h3>{machine.name}</h3>
      </div>

      <span className={`state-pill ${getStateClassName(machine.currentState)}`}>
        {getStateLabel(machine.currentState)}
      </span>
    </div>

    <dl className="machine-metrics">
      <div>
        <dt>Meta/hora</dt>
        <dd>{machine.targetRatePerHour}</dd>
      </div>
      <div>
        <dt>OEE hoy</dt>
        <dd>{oee?.percentages ? formatPercent(oee.percentages.oee) : "Cargando..."}</dd>
      </div>
      <div>
        <dt>Último cambio</dt>
        <dd>{formatDateTime(machine.latestStateChange?.timestamp)}</dd>
      </div>
    </dl>

    {machine.activeAlarm ? (
      <div className="alarm-box">
        <strong>Alarma activa</strong>
        <span>
          {machine.activeAlarm.alarmCode
            ? `${machine.activeAlarm.alarmCode} — `
            : ""}
          {machine.activeAlarm.alarmMessage ?? "Sin mensaje"}
        </span>
      </div>
    ) : null}

    <Link className="button-link" to={`/machines/${machine.id}`}>
      Ver detalle
    </Link>
  </article>
);