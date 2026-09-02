import { Request, Response } from "express";
import { Mechanic } from "../models/Mechanic";
import { Booking } from "../models/Booking";

import "../models/Customer";
import "../models/Vehicle";
import "../models/Service";

export const getMechanics = async (
  req: Request,
  res: Response
) => {
  try {
    const { status, search = "" } = req.query;

    const filter: any = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    if (search) {
      filter.name = {
        $regex: String(search),
        $options: "i",
      };
    }

    const mechanics = await Mechanic.find(filter)
      .sort({ name: 1 })
      .lean();

    res.status(200).json({
      success: true,
      data: mechanics,
    });
  } catch (error) {
    console.error("Mechanics error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load mechanics",
    });
  }
};


export const getMechanicById = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const mechanic = await Mechanic.findById(id).lean();

    if (!mechanic) {
      return res.status(404).json({
        success: false,
        message: "Mechanic not found",
      });
    }

    const bookings = await Booking.find({
      mechanicId: id,
    })
      .populate(
        "customerId",
        "name phone email"
      )
      .populate(
        "vehicleId",
        "registrationNumber make model"
      )
      .populate(
        "serviceId",
        "name category basePrice"
      )
      .sort({
        scheduledAt: -1,
      })
      .limit(20)
      .lean();

    res.status(200).json({
      success: true,
      data: {
        mechanic,
        bookings,
      },
    });
  } catch (error) {
    console.error(
      "Mechanic details error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to load mechanic",
    });
  }
};