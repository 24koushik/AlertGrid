import { Router } from "express";
import {
  createAlert,
  getAlerts,
  getAlertById,
  updateAlert,
} from "../controllers/alertController";
import { protect, authorize } from "../middleware/authMiddleware";

const router = Router();

router
  .route("/")
  .get(protect, getAlerts)
  .post(protect, authorize("ADMIN"), createAlert);

router
  .route("/:id")
  .get(protect, getAlertById)
  .put(protect, authorize("ADMIN"), updateAlert)
  .patch(protect, authorize("ADMIN"), updateAlert);

export default router;
