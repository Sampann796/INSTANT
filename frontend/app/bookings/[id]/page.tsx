"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Car,
  CheckCircle2,
  Clock,
  Mail,
  Phone,
  User,
  Wrench,
} from "lucide-react";
import socket from "../../../lib/socket";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type Booking = {
  _id: string;

  customerId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    status: string;
  };

  vehicleId: {
    _id: string;
    registrationNumber: string;
    make: string;
    model: string;
    year: number;
    fuelType: string;
  };

  mechanicId: {
    _id: string;
    name: string;
    phone: string;
    email: string;
    status: string;
    jobsCompleted: number;
  };

  serviceId: {
    _id: string;
    name: string;
    category: string;
    description: string;
    basePrice: number;
    estimatedDuration: number;
  };

  scheduledAt: string;
  status: string;
  amount: number;
  createdAt: string;
  updatedAt: string;
  notes?: string;
};

type HistoryItem = {
  _id: string;
  bookingId: string;
  previousStatus?: string | null;
  newStatus: string;
  changedBy?: string;
  note?: string;
  createdAt: string;
};

type BookingResponse = {
  success: boolean;
  data: {
    booking: Booking;
    history: HistoryItem[];
  };
};

const statusStyles: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  assigned: "bg-blue-100 text-blue-700",
  on_the_way: "bg-purple-100 text-purple-700",
  in_progress: "bg-indigo-100 text-indigo-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const formatStatus = (status: string) => {
  return status
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(" ");
};

const formatDateTime = (date: string) => {
  return new Date(date).toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
};

export default function BookingDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  const [booking, setBooking] =
    useState<Booking | null>(null);

  const [history, setHistory] =
    useState<HistoryItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [updatingStatus, setUpdatingStatus] =
    useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/bookings/${id}`
        );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch booking"
          );
        }

        const result: BookingResponse =
          await response.json();

        if (!result.success) {
          throw new Error(
            "Failed to load booking details"
          );
        }

        setBooking(result.data.booking);
        setHistory(result.data.history || []);
      } catch (err) {
        console.error(err);
        setError(
          "Unable to load booking details."
        );
      } finally {
        setLoading(false);
      }
    };

    const handleBookingUpdate = (update: {
      bookingId: string;
      previousStatus: string;
      newStatus: string;
      history: HistoryItem;
    }) => {
      if (update.bookingId !== id) {
        return;
      }

      setBooking((currentBooking) => {
        if (!currentBooking) {
          return currentBooking;
        }

        return {
          ...currentBooking,
          status: update.newStatus,
          updatedAt:
            new Date().toISOString(),
        };
      });

      setHistory((currentHistory) => {
        const exists = currentHistory.some(
          (item) =>
            item._id === update.history._id
        );

        if (exists) {
          return currentHistory;
        }

        return [
          ...currentHistory,
          update.history,
        ];
      });
    };

    if (id) {
      fetchBooking();
    }

    socket.on(
      "booking:updated",
      handleBookingUpdate
    );

    return () => {
      socket.off(
        "booking:updated",
        handleBookingUpdate
      );
    };
  }, [id]);

  const updateStatus = async (
    newStatus: string
  ) => {
    if (
      !booking ||
      newStatus === booking.status
    ) {
      return;
    }

    try {
      setUpdatingStatus(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/bookings/${booking._id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
            changedBy: "Admin",
          }),
        }
      );

      const result = await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "Failed to update booking status"
        );
      }

      setBooking(result.data.booking);

      if (result.data.history) {
        setHistory((currentHistory) => {
          const exists = currentHistory.some(
            (item) =>
              item._id ===
              result.data.history._id
          );

          if (exists) {
            return currentHistory;
          }

          return [
            ...currentHistory,
            result.data.history,
          ];
        });
      }
    } catch (err) {
      console.error(err);
      setError(
        "Unable to update booking status."
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-7xl">
          <div className="animate-pulse">
            <div className="mb-6 h-8 w-64 rounded bg-gray-200" />
            <div className="h-40 rounded-xl bg-gray-200" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/bookings"
            className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={18} />
            Back to Bookings
          </Link>

          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
            {error || "Booking not found."}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8">
          <Link
            href="/bookings"
            className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={18} />
            Back to Bookings
          </Link>

          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-sm text-gray-500">
                Booking Details
              </p>

              <h1 className="mt-1 text-3xl font-bold text-gray-900">
                #
                {booking._id
                  .slice(-6)
                  .toUpperCase()}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  statusStyles[
                    booking.status
                  ] ||
                  "bg-gray-100 text-gray-700"
                }`}
              >
                {formatStatus(
                  booking.status
                )}
              </span>

              <select
                value={booking.status}
                onChange={(e) =>
                  updateStatus(
                    e.target.value
                  )
                }
                disabled={updatingStatus}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 outline-none focus:border-gray-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="pending">
                  Pending
                </option>

                <option value="assigned">
                  Assigned
                </option>

                <option value="on_the_way">
                  On The Way
                </option>

                <option value="in_progress">
                  In Progress
                </option>

                <option value="completed">
                  Completed
                </option>

                <option value="cancelled">
                  Cancelled
                </option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">

          {/* Main */}
          <div className="space-y-6 lg:col-span-2">

            {/* Customer */}
            <section className="rounded-xl border bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
                  <User size={20} />
                </div>

                <div>
                  <h2 className="font-semibold text-gray-900">
                    Customer
                  </h2>

                  <p className="text-sm text-gray-500">
                    Customer information
                  </p>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase text-gray-400">
                    Name
                  </p>

                  <p className="mt-1 font-medium text-gray-900">
                    {booking.customerId
                      ?.name || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase text-gray-400">
                    Status
                  </p>

                  <p className="mt-1 font-medium text-gray-900">
                    {formatStatus(
                      booking.customerId
                        ?.status || "N/A"
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail size={16} />
                  {booking.customerId
                    ?.email || "N/A"}
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone size={16} />
                  {booking.customerId
                    ?.phone || "N/A"}
                </div>
              </div>
            </section>

            {/* Vehicle */}
            <section className="rounded-xl border bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-lg bg-purple-100 p-2 text-purple-600">
                  <Car size={20} />
                </div>

                <div>
                  <h2 className="font-semibold text-gray-900">
                    Vehicle
                  </h2>

                  <p className="text-sm text-gray-500">
                    Vehicle information
                  </p>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                <div>
                  <p className="text-xs font-medium uppercase text-gray-400">
                    Registration
                  </p>

                  <p className="mt-1 font-semibold text-gray-900">
                    {booking.vehicleId
                      ?.registrationNumber ||
                      "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase text-gray-400">
                    Vehicle
                  </p>

                  <p className="mt-1 font-medium text-gray-900">
                    {booking.vehicleId?.make}{" "}
                    {booking.vehicleId?.model}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase text-gray-400">
                    Year / Fuel
                  </p>

                  <p className="mt-1 font-medium text-gray-900">
                    {booking.vehicleId?.year}{" "}
                    •{" "}
                    {booking.vehicleId?.fuelType}
                  </p>
                </div>
              </div>
            </section>

            {/* Service */}
            <section className="rounded-xl border bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-lg bg-green-100 p-2 text-green-600">
                  <Wrench size={20} />
                </div>

                <div>
                  <h2 className="font-semibold text-gray-900">
                    Service
                  </h2>

                  <p className="text-sm text-gray-500">
                    Service information
                  </p>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase text-gray-400">
                    Service
                  </p>

                  <p className="mt-1 font-semibold text-gray-900">
                    {booking.serviceId
                      ?.name || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase text-gray-400">
                    Category
                  </p>

                  <p className="mt-1 font-medium text-gray-900">
                    {booking.serviceId
                      ?.category || "N/A"}
                  </p>
                </div>

                <div className="md:col-span-2">
                  <p className="text-xs font-medium uppercase text-gray-400">
                    Description
                  </p>

                  <p className="mt-1 text-sm text-gray-600">
                    {booking.serviceId
                      ?.description ||
                      "No description available."}
                  </p>
                </div>
              </div>
            </section>

            {/* Mechanic */}
            <section className="rounded-xl border bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-lg bg-orange-100 p-2 text-orange-600">
                  <Wrench size={20} />
                </div>

                <div>
                  <h2 className="font-semibold text-gray-900">
                    Assigned Mechanic
                  </h2>

                  <p className="text-sm text-gray-500">
                    Mechanic information
                  </p>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase text-gray-400">
                    Name
                  </p>

                  <p className="mt-1 font-semibold text-gray-900">
                    {booking.mechanicId
                      ?.name ||
                      "Not assigned"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase text-gray-400">
                    Status
                  </p>

                  <p className="mt-1 font-medium text-gray-900">
                    {formatStatus(
                      booking.mechanicId
                        ?.status || "N/A"
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone size={16} />
                  {booking.mechanicId
                    ?.phone || "N/A"}
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail size={16} />
                  {booking.mechanicId
                    ?.email || "N/A"}
                </div>
              </div>
            </section>

            {/* History */}
            <section className="rounded-xl border bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-lg bg-indigo-100 p-2 text-indigo-600">
                  <Clock size={20} />
                </div>

                <div>
                  <h2 className="font-semibold text-gray-900">
                    Booking History
                  </h2>

                  <p className="text-sm text-gray-500">
                    Status timeline
                  </p>
                </div>
              </div>

              {history.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No booking history available.
                </p>
              ) : (
                <div className="relative ml-3 border-l border-gray-200">
                  {history.map(
                    (item, index) => (
                      <div
                        key={item._id}
                        className="relative mb-7 ml-6 last:mb-0"
                      >
                        <div className="absolute -left-[37px] flex h-5 w-5 items-center justify-center rounded-full bg-white">
                          <div
                            className={`h-3 w-3 rounded-full ${
                              index ===
                              history.length -
                                1
                                ? "bg-green-500"
                                : "bg-gray-400"
                            }`}
                          />
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="font-semibold text-gray-900">
                              {formatStatus(
                                item.newStatus
                              )}
                            </span>

                            <span className="text-xs text-gray-400">
                              {formatDateTime(
                                item.createdAt
                              )}
                            </span>
                          </div>

                          {item.previousStatus && (
                            <p className="mt-1 text-xs text-gray-400">
                              From{" "}
                              {formatStatus(
                                item.previousStatus
                              )}
                            </p>
                          )}

                          {item.note && (
                            <p className="mt-1 text-sm text-gray-600">
                              {item.note}
                            </p>
                          )}

                          {item.changedBy && (
                            <p className="mt-1 text-xs text-gray-400">
                              Changed by{" "}
                              {item.changedBy}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Booking Summary */}
            <section className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="mb-5 font-semibold text-gray-900">
                Booking Summary
              </h2>

              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Amount
                  </span>

                  <span className="text-xl font-bold text-gray-900">
                    ₹
                    {booking.amount?.toLocaleString(
                      "en-IN"
                    )}
                  </span>
                </div>

                <div className="h-px bg-gray-100" />

                <div className="flex items-start gap-3">
                  <Calendar
                    size={18}
                    className="mt-0.5 text-gray-400"
                  />

                  <div>
                    <p className="text-xs text-gray-400">
                      Scheduled
                    </p>

                    <p className="mt-1 text-sm font-medium text-gray-900">
                      {formatDateTime(
                        booking.scheduledAt
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock
                    size={18}
                    className="mt-0.5 text-gray-400"
                  />

                  <div>
                    <p className="text-xs text-gray-400">
                      Created
                    </p>

                    <p className="mt-1 text-sm font-medium text-gray-900">
                      {formatDateTime(
                        booking.createdAt
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock
                    size={18}
                    className="mt-0.5 text-gray-400"
                  />

                  <div>
                    <p className="text-xs text-gray-400">
                      Last Updated
                    </p>

                    <p className="mt-1 text-sm font-medium text-gray-900">
                      {formatDateTime(
                        booking.updatedAt
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Service Details */}
            <section className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="mb-5 font-semibold text-gray-900">
                Service Details
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    Base Price
                  </span>

                  <span className="font-medium text-gray-900">
                    ₹
                    {booking.serviceId?.basePrice?.toLocaleString(
                      "en-IN"
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    Duration
                  </span>

                  <span className="font-medium text-gray-900">
                    {
                      booking.serviceId
                        ?.estimatedDuration
                    }{" "}
                    mins
                  </span>
                </div>

                <div className="h-px bg-gray-100" />

                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">
                    Total
                  </span>

                  <span className="font-bold text-gray-900">
                    ₹
                    {booking.amount?.toLocaleString(
                      "en-IN"
                    )}
                  </span>
                </div>
              </div>
            </section>

            {/* Notes */}
            {booking.notes && (
              <section className="rounded-xl border bg-white p-6 shadow-sm">
                <h2 className="mb-3 font-semibold text-gray-900">
                  Notes
                </h2>

                <p className="text-sm leading-6 text-gray-600">
                  {booking.notes}
                </p>
              </section>
            )}

            {/* Completed */}
            {booking.status ===
              "completed" && (
              <section className="rounded-xl border border-green-200 bg-green-50 p-6">
                <div className="flex items-center gap-3">
                  <CheckCircle2
                    size={24}
                    className="text-green-600"
                  />

                  <div>
                    <h2 className="font-semibold text-green-800">
                      Service Completed
                    </h2>

                    <p className="mt-1 text-sm text-green-700">
                      This booking has been
                      successfully completed.
                    </p>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}