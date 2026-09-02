import { Router } from "express";

import {
  getMechanics,
  getMechanicById,
} from "../controllers/mechanic";

const router = Router();

router.get("/", getMechanics);

router.get("/:id", getMechanicById);

export default router;