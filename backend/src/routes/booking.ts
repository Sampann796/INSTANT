import { Router } from "express";

import {
  getBookings,
  getBookingById,
  updateBookingStatus,
} from "../controllers/booking";

const router = Router();

router.get("/", getBookings);

router.get("/:id", getBookingById);

router.patch("/:id/status", updateBookingStatus);

export default router;