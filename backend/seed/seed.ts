import { faker } from "@faker-js/faker";
import mongoose from "mongoose";

import { connectDB } from "../src/config/db";
import { Customer } from "../src/models/Customer";
import { Vehicle } from "../src/models/Vehicle";
import { Mechanic } from "../src/models/Mechanic";
import { Service } from "../src/models/Service";
import { Booking } from "../src/models/Booking";
import { BookingStatusHistory } from "../src/models/BookingStatusHistory";

const CUSTOMER_COUNT = 60;
const MECHANIC_COUNT = 25;
const VEHICLE_COUNT = 100;
const BOOKING_COUNT = 600;

const serviceData = [
  {
    name: "General Service",
    category: "Maintenance",
    description: "Complete inspection and routine vehicle maintenance.",
    basePrice: 2499,
    estimatedDuration: 120,
  },
  {
    name: "Oil Change",
    category: "Maintenance",
    description: "Engine oil replacement with basic inspection.",
    basePrice: 1499,
    estimatedDuration: 60,
  },
  {
    name: "Brake Service",
    category: "Brakes",
    description: "Brake inspection, cleaning and component servicing.",
    basePrice: 2999,
    estimatedDuration: 150,
  },
  {
    name: "Battery Replacement",
    category: "Electrical",
    description: "Battery health check and replacement service.",
    basePrice: 5499,
    estimatedDuration: 45,
  },
  {
    name: "AC Service",
    category: "AC & Cooling",
    description: "Air conditioning inspection, cleaning and gas check.",
    basePrice: 1999,
    estimatedDuration: 90,
  },
  {
    name: "Tyre Service",
    category: "Tyres",
    description: "Tyre inspection, rotation and balancing.",
    basePrice: 1799,
    estimatedDuration: 75,
  },
  {
    name: "Engine Repair",
    category: "Engine",
    description: "Engine diagnostics and repair service.",
    basePrice: 7999,
    estimatedDuration: 240,
  },
  {
    name: "Wheel Alignment",
    category: "Tyres",
    description: "Computer-assisted wheel alignment service.",
    basePrice: 999,
    estimatedDuration: 45,
  },
  {
    name: "Car Detailing",
    category: "Cleaning",
    description: "Interior and exterior professional detailing.",
    basePrice: 3499,
    estimatedDuration: 180,
  },
  {
    name: "Battery Inspection",
    category: "Electrical",
    description: "Battery and charging system diagnostic inspection.",
    basePrice: 499,
    estimatedDuration: 30,
  },
];

const vehicleModels = [
  { make: "Maruti Suzuki", model: "Swift" },
  { make: "Maruti Suzuki", model: "Baleno" },
  { make: "Hyundai", model: "Creta" },
  { make: "Hyundai", model: "i20" },
  { make: "Hyundai", model: "Verna" },
  { make: "Tata", model: "Nexon" },
  { make: "Tata", model: "Harrier" },
  { make: "Tata", model: "Punch" },
  { make: "Mahindra", model: "XUV700" },
  { make: "Mahindra", model: "Thar" },
  { make: "Toyota", model: "Fortuner" },
  { make: "Toyota", model: "Innova Crysta" },
  { make: "Honda", model: "City" },
  { make: "Honda", model: "Amaze" },
  { make: "Kia", model: "Seltos" },
  { make: "Kia", model: "Sonet" },
  { make: "Volkswagen", model: "Virtus" },
  { make: "Skoda", model: "Slavia" },
];

const fuelTypes = [
  "petrol",
  "diesel",
  "cng",
  "electric",
  "hybrid",
] as const;

const bookingStatuses = [
  "pending",
  "assigned",
  "on_the_way",
  "in_progress",
  "completed",
  "cancelled",
] as const;

const getRandomDate = (daysBack: number, daysForward: number) => {
  const now = new Date();

  const min = new Date(
    now.getTime() - daysBack * 24 * 60 * 60 * 1000
  );

  const max = new Date(
    now.getTime() + daysForward * 24 * 60 * 60 * 1000
  );

  return faker.date.between({
    from: min,
    to: max,
  });
};

const generateRegistrationNumber = (
  index: number
): string => {
  const states = ["DL", "HR", "UP", "MH", "KA", "RJ"];

  const state = states[index % states.length];

  const district = String(
    faker.number.int({ min: 1, max: 99 })
  ).padStart(2, "0");

  const letters = faker.string.alpha({
    length: 2,
    casing: "upper",
  });

  const number = String(index + 1000).padStart(4, "0");

  return `${state}${district}${letters}${number}`;
};

const getBookingStatus = () => {
  const random = Math.random();

  if (random < 0.08) return "pending";
  if (random < 0.18) return "assigned";
  if (random < 0.28) return "on_the_way";
  if (random < 0.40) return "in_progress";
  if (random < 0.91) return "completed";

  return "cancelled";
};

const createStatusHistory = (
  booking: any
) => {
  const history: any[] = [];

  const statusOrder = [
    "pending",
    "assigned",
    "on_the_way",
    "in_progress",
    "completed",
  ];

  const finalStatus = booking.status;

  if (finalStatus === "cancelled") {
    history.push({
      bookingId: booking._id,
      previousStatus: null,
      newStatus: "pending",
      changedBy: "system",
      note: "Booking created",
      createdAt: new Date(
        booking.createdAt.getTime()
      ),
    });

    history.push({
      bookingId: booking._id,
      previousStatus: "pending",
      newStatus: "cancelled",
      changedBy: "operations",
      note: "Booking cancelled by customer",
      createdAt: new Date(
        booking.createdAt.getTime() + 60 * 60 * 1000
      ),
    });

    return history;
  }

  const finalIndex = statusOrder.indexOf(finalStatus);

  const statusesToCreate = statusOrder.slice(
    0,
    finalIndex + 1
  );

  statusesToCreate.forEach((status, index) => {
    history.push({
      bookingId: booking._id,

      previousStatus:
        index === 0
          ? null
          : statusesToCreate[index - 1],

      newStatus: status,

      changedBy:
        index === 0
          ? "system"
          : "operations",

      note:
        index === 0
          ? "Booking created"
          : `Booking moved to ${status.replace(
              "_",
              " "
            )}`,

      createdAt: new Date(
        booking.createdAt.getTime() +
          index * 60 * 60 * 1000
      ),
    });
  });

  return history;
};

const seed = async () => {
  try {
    await connectDB();

    console.log("Connected to database.");
    console.log("Clearing existing dashboard data...");

    await Promise.all([
      Customer.deleteMany({}),
      Vehicle.deleteMany({}),
      Mechanic.deleteMany({}),
      Service.deleteMany({}),
      Booking.deleteMany({}),
      BookingStatusHistory.deleteMany({}),
    ]);

    console.log("Existing dashboard data cleared.");

    // --------------------------------------------------
    // SERVICES
    // --------------------------------------------------

    const services = await Service.insertMany(
      serviceData
    );

    console.log(
      `Created ${services.length} services`
    );

    // --------------------------------------------------
    // CUSTOMERS
    // --------------------------------------------------

    const customersData = Array.from(
      { length: CUSTOMER_COUNT },
      () => ({
        name: faker.person.fullName(),

        email: faker.internet.email().toLowerCase(),

        phone: `+91${faker.string.numeric(10)}`,

        totalBookings: 0,

        totalSpending: 0,

        status:
          Math.random() < 0.92
            ? "active"
            : "inactive",
      })
    );

    const customers = await Customer.insertMany(
      customersData
    );

    console.log(
      `Created ${customers.length} customers`
    );

    // --------------------------------------------------
    // VEHICLES
    // --------------------------------------------------

    const vehiclesData = Array.from(
      { length: VEHICLE_COUNT },
      (_, index) => {
        const owner =
          customers[
            faker.number.int({
              min: 0,
              max: customers.length - 1,
            })
          ];

        const vehicle =
          vehicleModels[
            faker.number.int({
              min: 0,
              max: vehicleModels.length - 1,
            })
          ];

        return {
          customerId: owner._id,

          registrationNumber:
            generateRegistrationNumber(index),

          make: vehicle.make,

          model: vehicle.model,

          year: faker.number.int({
            min: 2016,
            max: 2025,
          }),

          fuelType:
            fuelTypes[
              faker.number.int({
                min: 0,
                max: fuelTypes.length - 1,
              })
            ],
        };
      }
    );

    const vehicles = await Vehicle.insertMany(
      vehiclesData
    );

    console.log(
      `Created ${vehicles.length} vehicles`
    );

    // --------------------------------------------------
    // MECHANICS
    // --------------------------------------------------

    const mechanicsData = Array.from(
      { length: MECHANIC_COUNT },
      () => ({
        name: faker.person.fullName(),

        phone: `+91${faker.string.numeric(10)}`,

        email: faker.internet
          .email()
          .toLowerCase(),

        status: "available",

        jobsCompleted: faker.number.int({
          min: 30,
          max: 250,
        }),

        currentBookingId: null,
      })
    );

    const mechanics = await Mechanic.insertMany(
      mechanicsData
    );

    console.log(
      `Created ${mechanics.length} mechanics`
    );

    // --------------------------------------------------
    // BOOKINGS
    // --------------------------------------------------

    const bookingsData: any[] = [];

    for (let i = 0; i < BOOKING_COUNT; i++) {
      const customer =
        customers[
          faker.number.int({
            min: 0,
            max: customers.length - 1,
          })
        ];

      const customerVehicles =
        vehicles.filter(
          (vehicle) =>
            vehicle.customerId.toString() ===
            customer._id.toString()
        );

      const vehicle =
        customerVehicles.length > 0
          ? customerVehicles[
              faker.number.int({
                min: 0,
                max: customerVehicles.length - 1,
              })
            ]
          : vehicles[
              faker.number.int({
                min: 0,
                max: vehicles.length - 1,
              })
            ];

      const service =
        services[
          faker.number.int({
            min: 0,
            max: services.length - 1,
          })
        ];

      const status = getBookingStatus();

      const hasMechanic =
        status !== "pending" &&
        status !== "cancelled";

      const mechanic = hasMechanic
        ? mechanics[
            faker.number.int({
              min: 0,
              max: mechanics.length - 1,
            })
          ]
        : null;

      const scheduledAt =
        getRandomDate(90, 14);

      const priceVariation =
        faker.number.int({
          min: -300,
          max: 1200,
        });

      const amount = Math.max(
        299,
        service.basePrice + priceVariation
      );

      const booking: any = {
        bookingNumber: `BK-${String(
          i + 1001
        ).padStart(5, "0")}`,

        customerId: customer._id,

        vehicleId: vehicle._id,

        mechanicId: mechanic?._id ?? null,

        serviceId: service._id,

        status,

        scheduledAt,

        amount,

        notes:
          Math.random() < 0.3
            ? faker.lorem.sentence()
            : undefined,
      };

      // Status timestamps
      const createdAt = new Date(
        scheduledAt.getTime() -
          faker.number.int({
            min: 2,
            max: 96,
          }) *
            60 *
            60 *
            1000
      );

      booking.createdAt = createdAt;

      if (
        [
          "assigned",
          "on_the_way",
          "in_progress",
          "completed",
        ].includes(status)
      ) {
        booking.assignedAt = new Date(
          createdAt.getTime() +
            30 * 60 * 1000
        );
      }

      if (
        [
          "on_the_way",
          "in_progress",
          "completed",
        ].includes(status)
      ) {
        booking.onTheWayAt = new Date(
          createdAt.getTime() +
            90 * 60 * 1000
        );
      }

      if (
        ["in_progress", "completed"].includes(
          status
        )
      ) {
        booking.startedAt = new Date(
          createdAt.getTime() +
            150 * 60 * 1000
        );
      }

      if (status === "completed") {
        booking.completedAt = new Date(
          createdAt.getTime() +
            faker.number.int({
              min: 3,
              max: 7,
            }) *
              60 *
              60 *
              1000
        );
      }

      if (status === "cancelled") {
        booking.cancelledAt = new Date(
          createdAt.getTime() +
            faker.number.int({
              min: 1,
              max: 24,
            }) *
              60 *
              60 *
              1000
        );
      }

      bookingsData.push(booking);
    }

    const bookings = await Booking.insertMany(
      bookingsData
    );

    console.log(
      `Created ${bookings.length} bookings`
    );

    // --------------------------------------------------
    // BOOKING STATUS HISTORY
    // --------------------------------------------------

    const historyData = bookings.flatMap(
      (booking) =>
        createStatusHistory(booking)
    );

    await BookingStatusHistory.insertMany(
      historyData
    );

    console.log(
      `Created ${historyData.length} status history records`
    );

    // --------------------------------------------------
    // UPDATE CUSTOMER STATISTICS
    // --------------------------------------------------

    for (const customer of customers) {
      const customerBookings =
        await Booking.find({
          customerId: customer._id,
        });

      const totalSpending =
        customerBookings
          .filter(
            (booking) =>
              booking.status === "completed"
          )
          .reduce(
            (sum, booking) =>
              sum + booking.amount,
            0
          );

      customer.totalBookings =
        customerBookings.length;

      customer.totalSpending =
        totalSpending;

      await customer.save();
    }

    // --------------------------------------------------
    // UPDATE MECHANIC STATISTICS
    // --------------------------------------------------

    for (const mechanic of mechanics) {
      const completedJobs =
        await Booking.countDocuments({
          mechanicId: mechanic._id,
          status: "completed",
        });

      mechanic.jobsCompleted =
        mechanic.jobsCompleted +
        completedJobs;

      await mechanic.save();
    }

    console.log(
      "Customer and mechanic statistics updated."
    );

    console.log("");
    console.log("==============================");
    console.log("DATABASE SEED COMPLETED");
    console.log("==============================");
    console.log(
      `Customers: ${customers.length}`
    );
    console.log(
      `Vehicles: ${vehicles.length}`
    );
    console.log(
      `Mechanics: ${mechanics.length}`
    );
    console.log(
      `Services: ${services.length}`
    );
    console.log(
      `Bookings: ${bookings.length}`
    );
    console.log(
      `Status History: ${historyData.length}`
    );
    console.log("==============================");
    console.log("");

    await mongoose.connection.close();

    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);

    await mongoose.connection.close();

    process.exit(1);
  }
};

seed();