import { Router } from "express";
import {
  createAssistanceRequest,
  getAssistanceRequests,
  getAssistanceRequestById,
  updateStatus,
  assignVolunteer,
} from "../controllers/assistanceController";
import { protect, authorize } from "../middleware/authMiddleware";

const router = Router();

router.use(protect);

router
  .route("/")
  .post(authorize("CITIZEN"), createAssistanceRequest)
  .get(getAssistanceRequests);

router.route("/:id").get(getAssistanceRequestById);

router
  .route("/:id/status")
  .patch(authorize("ADMIN", "VOLUNTEER"), updateStatus);

router.route("/:id/assign").patch(authorize("ADMIN"), assignVolunteer);

export default router;
