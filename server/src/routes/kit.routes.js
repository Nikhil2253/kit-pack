import express from "express";

import {
  createKit,
  deleteKit,
  getKit,
  getKits,
  updateKit
} from "../controllers/kit.controller.js";

import auth from "../middleware/auth.js";
import validate from "../middleware/validate.js";

import {
  createKitSchema,
  updateKitSchema
} from "../validators/kit.validator.js";

const router = express.Router();

router.post(
  "/",
  auth,
  validate(createKitSchema),
  createKit
);

router.get(
  "/",
  auth,
  getKits
);

router.get(
  "/:id",
  auth,
  getKit
);

router.patch(
  "/:id",
  auth,
  validate(updateKitSchema),
  updateKit
);

router.delete(
  "/:id",
  auth,
  deleteKit
);

export default router;