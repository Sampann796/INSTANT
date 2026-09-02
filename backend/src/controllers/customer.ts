import { Request, Response } from "express";
import { Customer } from "../models/Customer";
import { Booking } from "../models/Booking";

export const getCustomers = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      search = "",
      page = "1",
      limit = "20",
    } = req.query;

    const pageNumber = Math.max(1, Number(page));
    const limitNumber = Math.min(
      100,
      Math.max(1, Number(limit))
    );

    const filter: any = {};

    if (search) {
      filter.$or = [
        {
          name: {
            $regex: String(search),
            $options: "i",
          },
        },
        {
          email: {
            $regex: String(search),
            $options: "i",
          },
        },
        {
          phone: {
            $regex: String(search),
            $options: "i",
          },
        },
      ];
    }

    const skip =
      (pageNumber - 1) * limitNumber;

    const [customers, total] =
      await Promise.all([
        Customer.find(filter)
          .sort({ name: 1 })
          .skip(skip)
          .limit(limitNumber)
          .lean(),

        Customer.countDocuments(filter),
      ]);

    res.status(200).json({
      success: true,
      data: customers,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.ceil(
          total / limitNumber
        ),
      },
    });
  } catch (error) {
    console.error(
      "Customers error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to load customers",
    });
  }
};


export const getCustomerById = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const customer =
      await Customer.findById(id).lean();

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const bookings =
      await Booking.find({
        customerId: id,
      })
        .sort({
          createdAt: -1,
        })
        .limit(20)
        .lean();

    res.status(200).json({
      success: true,
      data: {
        customer,
        bookings,
      },
    });
  } catch (error) {
    console.error(
      "Customer details error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to load customer",
    });
  }
};