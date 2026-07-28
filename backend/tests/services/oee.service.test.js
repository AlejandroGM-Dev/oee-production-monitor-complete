import test from "node:test";
import assert from "node:assert/strict";

import { calculateStateDurations } from "../../src/services/index.js";
import { MACHINE_STATES } from "../../src/utils/index.js";

const minutes = (value) => value * 60 * 1000;

test("calculateStateDurations returns full range as initial state when there are no changes", () => {
  const result = calculateStateDurations({
    initialState: MACHINE_STATES.RUNNING,
    stateChanges: [],
    from: "2026-07-26T08:00:00.000Z",
    to: "2026-07-26T09:00:00.000Z",
  });

  assert.deepEqual(result, {
    [MACHINE_STATES.RUNNING]: minutes(60),
    [MACHINE_STATES.STOPPED]: 0,
    [MACHINE_STATES.ALARM]: 0,
    [MACHINE_STATES.MAINTENANCE]: 0,
  });
});

test("calculateStateDurations splits time across state changes inside the range", () => {
  const result = calculateStateDurations({
    initialState: MACHINE_STATES.RUNNING,
    stateChanges: [
      {
        newState: MACHINE_STATES.STOPPED,
        timestamp: "2026-07-26T09:00:00.000Z",
      },
      {
        newState: MACHINE_STATES.RUNNING,
        timestamp: "2026-07-26T09:30:00.000Z",
      },
      {
        newState: MACHINE_STATES.ALARM,
        timestamp: "2026-07-26T10:00:00.000Z",
      },
    ],
    from: "2026-07-26T08:00:00.000Z",
    to: "2026-07-26T11:00:00.000Z",
  });

  assert.deepEqual(result, {
    [MACHINE_STATES.RUNNING]: minutes(90),
    [MACHINE_STATES.STOPPED]: minutes(30),
    [MACHINE_STATES.ALARM]: minutes(60),
    [MACHINE_STATES.MAINTENANCE]: 0,
  });
});

test("calculateStateDurations handles an initial state that started before the range", () => {
  const result = calculateStateDurations({
    initialState: MACHINE_STATES.STOPPED,
    stateChanges: [
      {
        newState: MACHINE_STATES.RUNNING,
        timestamp: "2026-07-26T08:30:00.000Z",
      },
    ],
    from: "2026-07-26T08:00:00.000Z",
    to: "2026-07-26T09:00:00.000Z",
  });

  assert.deepEqual(result, {
    [MACHINE_STATES.RUNNING]: minutes(30),
    [MACHINE_STATES.STOPPED]: minutes(30),
    [MACHINE_STATES.ALARM]: 0,
    [MACHINE_STATES.MAINTENANCE]: 0,
  });
});

test("calculateStateDurations ignores changes outside the requested range", () => {
  const result = calculateStateDurations({
    initialState: MACHINE_STATES.RUNNING,
    stateChanges: [
      {
        newState: MACHINE_STATES.ALARM,
        timestamp: "2026-07-26T07:00:00.000Z",
      },
      {
        newState: MACHINE_STATES.STOPPED,
        timestamp: "2026-07-26T10:00:00.000Z",
      },
    ],
    from: "2026-07-26T08:00:00.000Z",
    to: "2026-07-26T09:00:00.000Z",
  });

  assert.deepEqual(result, {
    [MACHINE_STATES.RUNNING]: minutes(60),
    [MACHINE_STATES.STOPPED]: 0,
    [MACHINE_STATES.ALARM]: 0,
    [MACHINE_STATES.MAINTENANCE]: 0,
  });
});

test("calculateStateDurations treats an event exactly at from as changing state immediately", () => {
  const result = calculateStateDurations({
    initialState: MACHINE_STATES.STOPPED,
    stateChanges: [
      {
        newState: MACHINE_STATES.RUNNING,
        timestamp: "2026-07-26T08:00:00.000Z",
      },
    ],
    from: "2026-07-26T08:00:00.000Z",
    to: "2026-07-26T09:00:00.000Z",
  });

  assert.deepEqual(result, {
    [MACHINE_STATES.RUNNING]: minutes(60),
    [MACHINE_STATES.STOPPED]: 0,
    [MACHINE_STATES.ALARM]: 0,
    [MACHINE_STATES.MAINTENANCE]: 0,
  });
});

test("calculateStateDurations treats an event exactly at to as outside the effective range", () => {
  const result = calculateStateDurations({
    initialState: MACHINE_STATES.RUNNING,
    stateChanges: [
      {
        newState: MACHINE_STATES.STOPPED,
        timestamp: "2026-07-26T09:00:00.000Z",
      },
    ],
    from: "2026-07-26T08:00:00.000Z",
    to: "2026-07-26T09:00:00.000Z",
  });

  assert.deepEqual(result, {
    [MACHINE_STATES.RUNNING]: minutes(60),
    [MACHINE_STATES.STOPPED]: 0,
    [MACHINE_STATES.ALARM]: 0,
    [MACHINE_STATES.MAINTENANCE]: 0,
  });
});

test("calculateStateDurations includes maintenance time separately", () => {
  const result = calculateStateDurations({
    initialState: MACHINE_STATES.RUNNING,
    stateChanges: [
      {
        newState: MACHINE_STATES.MAINTENANCE,
        timestamp: "2026-07-26T08:30:00.000Z",
      },
      {
        newState: MACHINE_STATES.RUNNING,
        timestamp: "2026-07-26T09:15:00.000Z",
      },
    ],
    from: "2026-07-26T08:00:00.000Z",
    to: "2026-07-26T10:00:00.000Z",
  });

  assert.deepEqual(result, {
    [MACHINE_STATES.RUNNING]: minutes(75),
    [MACHINE_STATES.STOPPED]: 0,
    [MACHINE_STATES.ALARM]: 0,
    [MACHINE_STATES.MAINTENANCE]: minutes(45),
  });
});