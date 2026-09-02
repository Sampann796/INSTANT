import { Router } from "express";

import {
  getServices,
  getServiceById,
} from "../controllers/service";

const router = Router();

router.get("/", getServices);

router.get("/:id", getServiceById);

export default router;