import { Router } from "express";
import { getSummary, getAnalytics } from "../controllers/dashboardController";
import { protect, authorize } from "../middleware/authMiddleware";

const router = Router();

router.use(protect);

router.get("/summary", getSummary);
router.get("/analytics", authorize("ADMIN"), getAnalytics);

export default router;
