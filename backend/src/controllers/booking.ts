import { Request, Response } from "express";
import { Booking } from "../models/Booking";
import { BookingStatusHistory } from "../models/BookingStatusHistory";

import "../models/Customer";
import "../models/Vehicle";
import "../models/Mechanic";
import "../models/Service";

export const getBookingById = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id)
      .populate(
        "customerId",
        "name email phone status"
      )
      .populate(
        "vehicleId",
        "registrationNumber make model year fuelType"
      )
      .populate(
        "mechanicId",
        "name phone email status jobsCompleted"
      )
      .populate(
        "serviceId",
        "name category description basePrice estimatedDuration"
      )
      .lean();

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const history =
      await BookingStatusHistory.find({
        bookingId: booking._id,
      })
        .sort({
          createdAt: 1,
        })
        .lean();

    res.status(200).json({
      success: true,
      data: {
        booking,
        history,
      },
    });
  } catch (error) {
    console.error(
      "Booking details error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to load booking details",
    });
  }
};

export const getBookings = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      page = "1",
      limit = "20",
      search = "",
      status,
      from,
      to,
    } = req.query;

    const pageNumber = Math.max(
      1,
      Number(page)
    );

    const limitNumber = Math.min(
      100,
      Math.max(1, Number(limit))
    );

    const skip =
      (pageNumber - 1) * limitNumber;

    const filter: any = {};

    // Status filter
    if (status && status !== "all") {
      filter.status = status;
    }

    // Date filter
    if (from || to) {
      filter.scheduledAt = {};

      if (from) {
        filter.scheduledAt.$gte = new Date(
          String(from)
        );
      }

      if (to) {
        const endDate = new Date(
          String(to)
        );

        endDate.setHours(
          23,
          59,
          59,
          999
        );

        filter.scheduledAt.$lte = endDate;
      }
    }

    // Search booking number
    if (search) {
      filter.bookingNumber = {
        $regex: String(search),
        $options: "i",
      };
    }

    const [bookings, total] =
      await Promise.all([
        Booking.find(filter)
          .populate(
            "customerId",
            "name email phone"
          )
          .populate(
            "vehicleId",
            "registrationNumber make model"
          )
          .populate(
            "mechanicId",
            "name phone status"
          )
          .populate(
            "serviceId",
            "name category basePrice"
          )
          .sort({
            scheduledAt: -1,
          })
          .skip(skip)
          .limit(limitNumber)
          .lean(),

        Booking.countDocuments(filter),
      ]);

    const totalPages = Math.ceil(
      total / limitNumber
    );

    res.status(200).json({
      success: true,

      data: bookings,

      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages,
        hasNextPage:
          pageNumber < totalPages,
        hasPreviousPage:
          pageNumber > 1,
      },
    });
  } catch (error) {
    console.error(
      "Bookings error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to load bookings",
    });
  }
};