import express from "express";
import {
  startGeneration,
  getGenerationStatus,
  regenerateSection
} from "../controllers/generation.controller.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/:id", auth, startGeneration);
router.get("/:id/status", auth, getGenerationStatus);
router.post("/:id/:section", auth, regenerateSection);

export default router;