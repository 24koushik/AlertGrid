import { Router } from "express";
import {
  createShelter,
  getShelters,
  getShelterById,
  updateShelter,
  updateCapacity,
} from "../controllers/shelterController";
import { protect, authorize } from "../middleware/authMiddleware";

const router = Router();

router
  .route("/")
  .get(protect, getShelters)
  .post(protect, authorize("ADMIN"), createShelter);

router
  .route("/:id")
  .get(protect, getShelterById)
  .put(protect, authorize("ADMIN"), updateShelter)
  .patch(protect, authorize("ADMIN"), updateShelter);

router
  .route("/:id/capacity")
  .patch(protect, authorize("ADMIN", "VOLUNTEER"), updateCapacity);

export default router;
