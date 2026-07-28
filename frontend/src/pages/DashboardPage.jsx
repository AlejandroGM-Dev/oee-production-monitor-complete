import { useEffect, useMemo, useState } from "react";

import { getMachineOee, getMachines } from "../api";
import { MachineCard, StatusMessage } from "../components";

const POLLING_INTERVAL_MS = 15000;

export const DashboardPage = () => {
  const [machines, setMachines] = useState([]);
  const [oeeByMachineId, setOeeByMachineId] = useState({});
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);

  const isLoading = status === "loading";
  const hasMachines = machines.length > 0;

  const orderedMachines = useMemo(
    () => [...machines].sort((a, b) => a.id - b.id),
    [machines],
  );

  const loadDashboard = async ({ silent = false } = {}) => {
    if (!silent) {
      setStatus("loading");
    }

    setErrorMessage(null);

    try {
      const machinesData = await getMachines();

      const oeeResults = await Promise.allSettled(
        machinesData.map((machine) => getMachineOee(machine.id)),
      );

      const nextOeeByMachineId = {};

      oeeResults.forEach((result, index) => {
        const machineId = machinesData[index].id;

        if (result.status === "fulfilled") {
          nextOeeByMachineId[machineId] = result.value;
        }
      });

      setMachines(machinesData);
      setOeeByMachineId(nextOeeByMachineId);
      setLastUpdatedAt(new Date());
      setStatus("success");
    } catch (error) {
      setErrorMessage(error.message);
      setStatus("error");
    }
  };

  useEffect(() => {
    let isMounted = true;
    let isFetching = false;

    const load = async ({ silent = false } = {}) => {
      if (isFetching || !isMounted) {
        return;
      }

      isFetching = true;

      try {
        await loadDashboard({ silent });
      } finally {
        isFetching = false;
      }
    };

    load();

    const intervalId = window.setInterval(() => {
      load({ silent: true });
    }, POLLING_INTERVAL_MS);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  if (isLoading && !hasMachines) {
    return (
      <StatusMessage
        title="Cargando dashboard"
        message="Consultando máquinas y métricas del día."
      />
    );
  }

  if (status === "error" && !hasMachines) {
    return (
      <StatusMessage
        title="No se pudo cargar el dashboard"
        message={errorMessage}
        action={
          <button className="button-link" type="button" onClick={() => loadDashboard()}>
            Reintentar
          </button>
        }
      />
    );
  }

  return (
    <section className="dashboard-page">
      <div className="section-header">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h2>Estado actual de la línea</h2>
          <p>
            Vista operativa de máquinas, alarmas activas y OEE simplificado del
            día.
          </p>
        </div>

        <button
          className="button-link secondary"
          type="button"
          disabled={isLoading}
          onClick={() => loadDashboard()}
        >
          {isLoading ? "Actualizando..." : "Actualizar"}
        </button>
      </div>

      {errorMessage && hasMachines ? (
        <div className="inline-error">
          No se pudo actualizar: {errorMessage}
        </div>
      ) : null}

      {lastUpdatedAt ? (
        <p className="last-updated">
          Última actualización: {lastUpdatedAt.toLocaleTimeString("es-CO")}
        </p>
      ) : null}

      {hasMachines ? (
        <div className="machine-grid">
          {orderedMachines.map((machine) => (
            <MachineCard
              key={machine.id}
              machine={machine}
              oee={oeeByMachineId[machine.id]}
            />
          ))}
        </div>
      ) : (
        <StatusMessage
          title="Sin máquinas"
          message="No hay máquinas registradas para mostrar."
        />
      )}
    </section>
  );
};