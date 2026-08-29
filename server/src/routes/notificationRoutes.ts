import { Router } from "express";
import {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
} from "../controllers/notificationController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

router.use(protect); // All notification routes require authentication

router.route("/").get(getMyNotifications);

router.route("/read-all").patch(markAllAsRead);

router.route("/:id/read").patch(markAsRead);

export default router;
