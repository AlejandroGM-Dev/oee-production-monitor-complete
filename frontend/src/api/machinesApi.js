import { requestJson } from "./httpClient";

const buildQueryString = (params) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, value);
    }
  });

  const queryString = searchParams.toString();

  return queryString ? `?${queryString}` : "";
};

export const getMachines = async () => {
  const payload = await requestJson("/machines");

  return payload.data;
};

export const getMachine = async (machineId) => {
  const payload = await requestJson(`/machines/${machineId}`);

  return payload.data;
};

export const getMachineEvents = async (machineId, filters = {}) => {
  const queryString = buildQueryString(filters);
  const payload = await requestJson(`/machines/${machineId}/events${queryString}`);

  return payload;
};

export const getMachineOee = async (machineId, range = {}) => {
  const queryString = buildQueryString(range);
  const payload = await requestJson(`/machines/${machineId}/oee${queryString}`);

  return payload.data;
};

export const createMachineEvent = async (machineId, eventInput) => {
  const payload = await requestJson(`/machines/${machineId}/events`, {
    method: "POST",
    body: JSON.stringify(eventInput),
  });

  return payload;
};