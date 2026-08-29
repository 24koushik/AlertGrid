import { Router } from "express";
import {
  getWeather,
  getNews,
  getWarnings,
} from "../../controllers/external/externalController";
import { protect } from "../../middleware/authMiddleware";

const router = Router();

router.get("/weather", protect, getWeather);
router.get("/news", protect, getNews);
router.get("/warnings", protect, getWarnings);

export default router;
