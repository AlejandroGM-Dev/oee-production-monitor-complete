import { formatDuration, formatPercent } from "../utils";

export const OeeSummary = ({ oee }) => {
  if (!oee) {
    return null;
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">OEE</p>
          <h3>Indicador del rango seleccionado</h3>
        </div>
        <strong className="oee-highlight">
          {formatPercent(oee.percentages.oee)}
        </strong>
      </div>

      <div className="metric-grid">
        <article>
          <span>Disponibilidad</span>
          <strong>{formatPercent(oee.percentages.availability)}</strong>
        </article>
        <article>
          <span>Rendimiento</span>
          <strong>{formatPercent(oee.percentages.performance)}</strong>
        </article>
        <article>
          <span>Calidad</span>
          <strong>{formatPercent(oee.percentages.quality)}</strong>
        </article>
        <article>
          <span>Unidades</span>
          <strong>{oee.unitsProduced}</strong>
        </article>
      </div>

      <div className="duration-grid">
        <div>
          <span>RUNNING</span>
          <strong>{formatDuration(oee.durationsMs.RUNNING)}</strong>
        </div>
        <div>
          <span>STOPPED</span>
          <strong>{formatDuration(oee.durationsMs.STOPPED)}</strong>
        </div>
        <div>
          <span>ALARM</span>
          <strong>{formatDuration(oee.durationsMs.ALARM)}</strong>
        </div>
        <div>
          <span>MAINTENANCE</span>
          <strong>{formatDuration(oee.durationsMs.MAINTENANCE)}</strong>
        </div>
      </div>
    </section>
  );
};