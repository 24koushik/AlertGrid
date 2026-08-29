import express from "express";
import {
  getCommunities,
  getCommunity,
  registerCommunity,
  joinCommunity,
  getCommunityMembers,
} from "../controllers/communityController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", getCommunities);
router.get("/:id", getCommunity);

router.post("/", protect, registerCommunity);
router.post("/:id/join", protect, joinCommunity);
router.get("/:id/members", protect, getCommunityMembers);

export default router;
