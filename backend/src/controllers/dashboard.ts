import { Request, Response } from "express";
import { Booking } from "../models/Booking";
import { Customer } from "../models/Customer";
import { Mechanic } from "../models/Mechanic";

export const getDashboard = async (
  req: Request,
  res: Response
) => {
  try {
    const range = String(req.query.range || "30d");

    const rangeDays =
      range === "7d"
        ? 7
        : range === "90d"
        ? 90
        : 30;

    const now = new Date();

    const startDate = new Date(
      now.getTime() -
        rangeDays * 24 * 60 * 60 * 1000
    );

    // Run independent queries in parallel
    const [
      totalBookings,
      completedBookings,
      pendingBookings,
      activeBookings,
      cancelledBookings,
      totalCustomers,
      availableMechanics,
      totalMechanics,
      revenueResult,
      statusBreakdown,
      serviceBreakdown,
      dailyBookings,
    ] = await Promise.all([
      Booking.countDocuments({
        createdAt: { $gte: startDate },
      }),

      Booking.countDocuments({
        status: "completed",
        createdAt: { $gte: startDate },
      }),

      Booking.countDocuments({
        status: "pending",
        createdAt: { $gte: startDate },
      }),

      Booking.countDocuments({
        status: {
          $in: [
            "assigned",
            "on_the_way",
            "in_progress",
          ],
        },
        createdAt: { $gte: startDate },
      }),

      Booking.countDocuments({
        status: "cancelled",
        createdAt: { $gte: startDate },
      }),

      Customer.countDocuments({
        status: "active",
      }),

      Mechanic.countDocuments({
        status: "available",
      }),

      Mechanic.countDocuments(),

      Booking.aggregate([
        {
          $match: {
            status: "completed",
            createdAt: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" },
            average: { $avg: "$amount" },
          },
        },
      ]),

      Booking.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
        {
          $sort: {
            count: -1,
          },
        },
      ]),

      Booking.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
          },
        },
        {
          $lookup: {
            from: "services",
            localField: "serviceId",
            foreignField: "_id",
            as: "service",
          },
        },
        {
          $unwind: "$service",
        },
        {
          $group: {
            _id: "$service.name",
            bookings: { $sum: 1 },
            revenue: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$status",
                      "completed",
                    ],
                  },
                  "$amount",
                  0,
                ],
              },
            },
          },
        },
        {
          $sort: {
            bookings: -1,
          },
        },
      ]),

      Booking.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
              },
            },
            bookings: { $sum: 1 },
            completed: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$status",
                      "completed",
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            revenue: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$status",
                      "completed",
                    ],
                  },
                  "$amount",
                  0,
                ],
              },
            },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
      ]),
    ]);

    const revenue = revenueResult[0]?.total || 0;

    const averageBookingValue =
      revenueResult[0]?.average || 0;

    const completionRate =
      totalBookings > 0
        ? Number(
            (
              (completedBookings /
                totalBookings) *
              100
            ).toFixed(1)
          )
        : 0;

    res.status(200).json({
      success: true,

      data: {
        range: `${rangeDays}d`,

        kpis: {
          totalBookings,
          completedBookings,
          pendingBookings,
          activeBookings,
          cancelledBookings,
          totalCustomers,
          availableMechanics,
          totalMechanics,
          revenue,
          averageBookingValue,
          completionRate,
        },

        statusBreakdown,

        serviceBreakdown,

        dailyBookings,
      },
    });
  } catch (error) {
    console.error(
      "Dashboard error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to load dashboard data",
    });
  }
};