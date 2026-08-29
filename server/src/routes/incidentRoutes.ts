import { Router } from "express";
import {
  createIncident,
  getIncidents,
  getIncidentById,
  updateIncident,
  updateIncidentStatus,
} from "../controllers/incidentController";
import { protect, authorize } from "../middleware/authMiddleware";

const router = Router();

router
  .route("/")
  .get(protect, getIncidents)
  .post(protect, authorize("ADMIN"), createIncident);

router
  .route("/:id")
  .get(protect, getIncidentById)
  .put(protect, authorize("ADMIN"), updateIncident);

router
  .route("/:id/status")
  .patch(protect, authorize("ADMIN"), updateIncidentStatus);

export default router;
