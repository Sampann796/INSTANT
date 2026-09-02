import { Router } from "express";

import {
  getBookings,
  getBookingById,
} from "../controllers/booking";

const router = Router();

router.get("/", getBookings);

router.get("/:id", getBookingById);

export default router;