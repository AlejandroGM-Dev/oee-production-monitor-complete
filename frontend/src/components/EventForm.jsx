import { useMemo, useState } from "react";

import { datetimeLocalToIso, toDatetimeLocalValue } from "../utils";

const EVENT_TYPES = [
  {
    value: "STATE_CHANGE",
    label: "Cambio de estado",
  },
  {
    value: "ALARM",
    label: "Alarma",
  },
  {
    value: "PRODUCTION_COUNT",
    label: "Conteo de producción",
  },
];

const MACHINE_STATES = [
  {
    value: "RUNNING",
    label: "Produciendo",
  },
  {
    value: "STOPPED",
    label: "Detenida",
  },
  {
    value: "ALARM",
    label: "Alarma",
  },
  {
    value: "MAINTENANCE",
    label: "Mantenimiento",
  },
];

const getInitialFormState = () => ({
  eventType: "STATE_CHANGE",
  newState: "RUNNING",
  alarmCode: "",
  alarmMessage: "",
  unitsProduced: "",
  timestamp: toDatetimeLocalValue(new Date()),
});

export const EventForm = ({ onSubmit, isSubmitting }) => {
  const [formState, setFormState] = useState(getInitialFormState);
  const [validationMessage, setValidationMessage] = useState(null);

  const selectedEventType = formState.eventType;

  const submitLabel = useMemo(() => {
    if (isSubmitting) {
      return "Guardando...";
    }

    if (selectedEventType === "STATE_CHANGE") {
      return "Registrar cambio";
    }

    if (selectedEventType === "ALARM") {
      return "Registrar alarma";
    }

    return "Registrar producción";
  }, [isSubmitting, selectedEventType]);

  const updateField = (field, value) => {
    setValidationMessage(null);
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const buildPayload = () => {
    const basePayload = {
      eventType: formState.eventType,
      timestamp: datetimeLocalToIso(formState.timestamp),
    };

    if (formState.eventType === "STATE_CHANGE") {
      return {
        ...basePayload,
        newState: formState.newState,
      };
    }

    if (formState.eventType === "ALARM") {
      return {
        ...basePayload,
        alarmCode: formState.alarmCode,
        alarmMessage: formState.alarmMessage,
      };
    }

    return {
      ...basePayload,
      unitsProduced: formState.unitsProduced,
    };
  };

  const validate = () => {
    if (!formState.timestamp) {
      return "La fecha del evento es obligatoria.";
    }

    if (formState.eventType === "ALARM") {
      if (!formState.alarmCode.trim() && !formState.alarmMessage.trim()) {
        return "La alarma necesita código o mensaje.";
      }
    }

    if (formState.eventType === "PRODUCTION_COUNT") {
      const units = Number(formState.unitsProduced);

      if (
        !Number.isInteger(units) ||
        units < 0 ||
        String(units) !== String(formState.unitsProduced)
      ) {
        return "Las unidades producidas deben ser un entero mayor o igual a 0.";
      }
    }

    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validate();

    if (validationError) {
      setValidationMessage(validationError);
      return;
    }

    await onSubmit(buildPayload());

    setFormState(getInitialFormState());
  };

  return (
    <form className="panel form-panel" onSubmit={handleSubmit}>
      <div className="panel-header">
        <div>
          <p className="eyebrow">Nuevo evento</p>
          <h3>Registrar evento de máquina</h3>
        </div>
      </div>

      <div className="form-grid">
        <label>
          Tipo de evento
          <select
            value={formState.eventType}
            onChange={(event) => updateField("eventType", event.target.value)}
          >
            {EVENT_TYPES.map((eventType) => (
              <option key={eventType.value} value={eventType.value}>
                {eventType.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Fecha y hora
          <input
            type="datetime-local"
            value={formState.timestamp}
            onChange={(event) => updateField("timestamp", event.target.value)}
          />
        </label>

        {selectedEventType === "STATE_CHANGE" ? (
          <label>
            Nuevo estado
            <select
              value={formState.newState}
              onChange={(event) => updateField("newState", event.target.value)}
            >
              {MACHINE_STATES.map((state) => (
                <option key={state.value} value={state.value}>
                  {state.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {selectedEventType === "ALARM" ? (
          <>
            <label>
              Código de alarma
              <input
                type="text"
                value={formState.alarmCode}
                placeholder="Ej: E-204"
                onChange={(event) => updateField("alarmCode", event.target.value)}
              />
            </label>

            <label className="form-grid__full">
              Mensaje de alarma
              <input
                type="text"
                value={formState.alarmMessage}
                placeholder="Describe la alarma"
                onChange={(event) =>
                  updateField("alarmMessage", event.target.value)
                }
              />
            </label>
          </>
        ) : null}

        {selectedEventType === "PRODUCTION_COUNT" ? (
          <label>
            Unidades producidas
            <input
              type="number"
              min="0"
              step="1"
              value={formState.unitsProduced}
              placeholder="Ej: 250"
              onChange={(event) => updateField("unitsProduced", event.target.value)}
            />
          </label>
        ) : null}
      </div>

      {validationMessage ? (
        <div className="inline-error">{validationMessage}</div>
      ) : null}

      <button className="button-link" type="submit" disabled={isSubmitting}>
        {submitLabel}
      </button>
    </form>
  );
};