import { Router } from "express";

import {
  createEvent,
  getMachine,
  getOee,
  listMachineEvents,
  listMachines,
} from "../controllers/index.js";

export const machinesRouter = Router();

machinesRouter.get("/", listMachines);
machinesRouter.get("/:id", getMachine);
machinesRouter.get("/:id/events", listMachineEvents);
machinesRouter.post("/:id/events", createEvent);
machinesRouter.get("/:id/oee", getOee);