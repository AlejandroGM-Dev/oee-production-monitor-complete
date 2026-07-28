import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  createMachineEvent,
  getMachine,
  getMachineEvents,
  getMachineOee,
} from "../api";
import {
  EventForm,
  EventHistory,
  OeeSummary,
  StatusMessage,
} from "../components";
import {
  datetimeLocalToIso,
  formatDateTime,
  getStateClassName,
  getStateLabel,
  toDatetimeLocalValue,
} from "../utils";

const PAGE_SIZE = 5;

const getDefaultRange = () => {
  const now = new Date();
  const startOfDay = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      0,
      0,
      0,
      0,
    ),
  );

  return {
    from: toDatetimeLocalValue(startOfDay),
    to: toDatetimeLocalValue(now),
  };
};

export const MachineDetailPage = () => {
  const { id } = useParams();

  const [machine, setMachine] = useState(null);
  const [events, setEvents] = useState([]);
  const [eventsMeta, setEventsMeta] = useState(null);
  const [oee, setOee] = useState(null);

  const [eventTypeFilter, setEventTypeFilter] = useState("");
  const [range, setRange] = useState(getDefaultRange);

  const [pageOffset, setPageOffset] = useState(0);
  const [status, setStatus] = useState("idle");
  const [eventsStatus, setEventsStatus] = useState("idle");
  const [oeeStatus, setOeeStatus] = useState("idle");
  const [submitStatus, setSubmitStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState(null);
  const [submitMessage, setSubmitMessage] = useState(null);

  const loadMachine = async () => {
    const machineData = await getMachine(id);
    setMachine(machineData);
  };

  const loadEvents = async ({ offset = pageOffset } = {}) => {
    setEventsStatus("loading");

    const payload = await getMachineEvents(id, {
      from: datetimeLocalToIso(range.from),
      to: datetimeLocalToIso(range.to),
      type: eventTypeFilter,
      limit: PAGE_SIZE,
      offset,
    });

    setEvents(payload.data);
    setEventsMeta(payload.meta);
    setPageOffset(offset);
    setEventsStatus("success");
  };

  const loadOee = async () => {
    setOeeStatus("loading");

    const oeeData = await getMachineOee(id, {
      from: datetimeLocalToIso(range.from),
      to: datetimeLocalToIso(range.to),
    });

    setOee(oeeData);
    setOeeStatus("success");
  };

  const loadAll = async () => {
    setStatus("loading");
    setErrorMessage(null);

    try {
      await Promise.all([loadMachine(), loadEvents({ offset: 0 }), loadOee()]);
      setStatus("success");
    } catch (error) {
      setErrorMessage(error.message);
      setStatus("error");
    }
  };

  useEffect(() => {
    loadAll();
  }, [id]);

  const applyFilters = async () => {
    setErrorMessage(null);

    try {
      await Promise.all([loadEvents({ offset: 0 }), loadOee(), loadMachine()]);
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handlePreviousPage = async () => {
    const nextOffset = Math.max(pageOffset - PAGE_SIZE, 0);
    await loadEvents({ offset: nextOffset });
  };

  const handleNextPage = async () => {
    const nextOffset = pageOffset + PAGE_SIZE;
    await loadEvents({ offset: nextOffset });
  };

  const handleCreateEvent = async (eventInput) => {
    setSubmitStatus("submitting");
    setSubmitMessage(null);
    setErrorMessage(null);

    try {
      await createMachineEvent(id, eventInput);
      setSubmitMessage("Evento registrado correctamente.");

      await Promise.all([loadMachine(), loadEvents({ offset: 0 }), loadOee()]);
    } catch (error) {
      setErrorMessage(error.message);
      throw error;
    } finally {
      setSubmitStatus("idle");
    }
  };

  const updateRange = (field, value) => {
    setRange((current) => ({
      ...current,
      [field]: value,
    }));
  };

  if (status === "loading" && !machine) {
    return (
      <StatusMessage
        title="Cargando máquina"
        message="Consultando detalle, eventos y OEE."
      />
    );
  }

  if (status === "error" && !machine) {
    return (
      <StatusMessage
        title="No se pudo cargar la máquina"
        message={errorMessage}
        action={
          <Link className="button-link secondary" to="/">
            Volver al dashboard
          </Link>
        }
      />
    );
  }

  if (!machine) {
    return null;
  }

  return (
    <section className="machine-detail-page">
      <Link className="back-link" to="/">
        ← Volver al dashboard
      </Link>

      <div className="detail-hero">
        <div>
          <p className="eyebrow">{machine.type}</p>
          <h2>{machine.name}</h2>
          <p>
            Meta de producción: <strong>{machine.targetRatePerHour}</strong>{" "}
            unidades/hora
          </p>
          <p>
            Último cambio:{" "}
            <strong>{formatDateTime(machine.latestStateChange?.timestamp)}</strong>
          </p>
        </div>

        <span className={`state-pill ${getStateClassName(machine.currentState)}`}>
          {getStateLabel(machine.currentState)}
        </span>
      </div>

      {machine.activeAlarm ? (
        <div className="alarm-box detail-alarm">
          <strong>Alarma activa</strong>
          <span>
            {machine.activeAlarm.alarmCode
              ? `${machine.activeAlarm.alarmCode} — `
              : ""}
            {machine.activeAlarm.alarmMessage}
          </span>
        </div>
      ) : null}

      {errorMessage ? (
        <div className="inline-error">{errorMessage}</div>
      ) : null}

      {submitMessage ? (
        <div className="inline-success">{submitMessage}</div>
      ) : null}

      <div className="detail-layout">
        <div className="detail-main">
          <section className="panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Filtros</p>
                <h3>Rango e historial</h3>
              </div>
            </div>

            <div className="form-grid">
              <label>
                Desde
                <input
                  type="datetime-local"
                  value={range.from}
                  onChange={(event) => updateRange("from", event.target.value)}
                />
              </label>

              <label>
                Hasta
                <input
                  type="datetime-local"
                  value={range.to}
                  onChange={(event) => updateRange("to", event.target.value)}
                />
              </label>

              <label>
                Tipo de evento
                <select
                  value={eventTypeFilter}
                  onChange={(event) => setEventTypeFilter(event.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="STATE_CHANGE">Cambio de estado</option>
                  <option value="ALARM">Alarma</option>
                  <option value="PRODUCTION_COUNT">Producción</option>
                </select>
              </label>
            </div>

            <button
              className="button-link"
              type="button"
              onClick={applyFilters}
              disabled={eventsStatus === "loading" || oeeStatus === "loading"}
            >
              Aplicar filtros
            </button>
          </section>

          <section className="panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Historial</p>
                <h3>Eventos registrados</h3>
              </div>
            </div>

            {eventsStatus === "loading" && !events.length ? (
              <div className="empty-state">Cargando eventos...</div>
            ) : (
              <EventHistory
                events={events}
                pagination={
                  eventsMeta?.pagination ?? {
                    total: 0,
                    limit: PAGE_SIZE,
                    offset: 0,
                    returned: 0,
                  }
                }
                onPreviousPage={handlePreviousPage}
                onNextPage={handleNextPage}
              />
            )}
          </section>

          <OeeSummary oee={oee} />
        </div>

        <aside className="detail-side">
          <EventForm
            isSubmitting={submitStatus === "submitting"}
            onSubmit={handleCreateEvent}
          />
        </aside>
      </div>
    </section>
  );
};