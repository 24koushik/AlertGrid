import { Router } from "express";
import {
  getVolunteers,
  getVolunteerProfile,
  updateVolunteerProfile,
  createTask,
  getTasks,
  updateTaskStatus,
  assignTask,
} from "../controllers/volunteerController";
import { protect, authorize } from "../middleware/authMiddleware";

export const volunteerRouter = Router();
volunteerRouter.use(protect);

volunteerRouter.route("/").get(authorize("ADMIN"), getVolunteers);

volunteerRouter
  .route("/:id")
  .get(getVolunteerProfile)
  .put(updateVolunteerProfile);

export const taskRouter = Router();
taskRouter.use(protect);

taskRouter.route("/").get(getTasks).post(authorize("ADMIN"), createTask);

taskRouter
  .route("/:id/status")
  .patch(authorize("ADMIN", "VOLUNTEER"), updateTaskStatus);

taskRouter.route("/:id/assign").patch(authorize("ADMIN"), assignTask);
