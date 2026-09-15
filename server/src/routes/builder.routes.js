import express from "express";
import auth from "../middleware/auth.js";

import {
  updateSectionController,
  updateQuestionController,
  deleteQuestionController
} from "../controllers/builder.controller.js";

const router = express.Router();

router.patch(
  "/:id/:section",
  auth,
  updateSectionController
);

router.patch(
  "/:id/questions/:questionId",
  auth,
  updateQuestionController
);

router.delete(
  "/:id/questions/:questionId",
  auth,
  deleteQuestionController
);

export default router;