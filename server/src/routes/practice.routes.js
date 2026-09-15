import express from "express";
import auth from "../middleware/auth.js";

import {
  getPracticeFlashcards,
  setConfidence
} from "../controllers/practice.controller.js";

const router = express.Router();

router.get(
  "/:id/flashcards",
  auth,
  getPracticeFlashcards
);

router.patch(
  "/:id/flashcards/:flashcardId/confidence",
  auth,
  setConfidence
);

export default router;