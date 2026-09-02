"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Search,
} from "lucide-react";
import socket from "../../lib/socket";

type Booking = {
  _id: string;
  status: string;
  amount: number;
  scheduledAt: string;

  customerId?: {
    _id?: string;
    name: string;
    phone?: string;
  };

  vehicleId?: {
    _id?: string;
    registrationNumber: string;
    make: string;
    model: string;
  };

  mechanicId?: {
    _id?: string;
    name: string;
  };

  serviceId?: {
    _id?: string;
    name: string;
  };
};

type SortField =
  | "booking"
  | "customer"
  | "vehicle"
  | "service"
  | "mechanic"
  | "amount"
  | "date";

type SortDirection = "asc" | "desc";

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
        word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(" ");
};

const formatDateTime = (date: string) => {
  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("all");

  const [sortField, setSortField] =
    useState<SortField>("date");

  const [sortDirection, setSortDirection] =
    useState<SortDirection>("desc");

  const [currentPage, setCurrentPage] = useState(1);

  const rowsPerPage = 10;

  useEffect(() => {
    const loadBookings = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "http://localhost:5000/api/bookings"
        );

        if (!response.ok) {
          throw new Error(
            "Failed to load bookings"
          );
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(
            result.message ||
              "Failed to load bookings"
          );
        }

        setBookings(result.data || []);
      } catch (err) {
        console.error("Bookings error:", err);
        setError("Unable to load bookings.");
      } finally {
        setLoading(false);
      }
    };

    const handleBookingUpdate = (update: {
      bookingId: string;
      newStatus: string;
    }) => {
      setBookings((currentBookings) =>
        currentBookings.map((booking) =>
          booking._id === update.bookingId
            ? {
                ...booking,
                status: update.newStatus,
              }
            : booking
        )
      );
    };

    loadBookings();

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
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const filteredBookings = useMemo(() => {
    const searchValue =
      search.trim().toLowerCase();

    const filtered = bookings.filter((booking) => {
      const matchesStatus =
        statusFilter === "all" ||
        booking.status === statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!searchValue) {
        return true;
      }

      return (
        booking._id
          .toLowerCase()
          .includes(searchValue) ||
        booking.customerId?.name
          ?.toLowerCase()
          .includes(searchValue) ||
        booking.vehicleId?.registrationNumber
          ?.toLowerCase()
          .includes(searchValue) ||
        booking.serviceId?.name
          ?.toLowerCase()
          .includes(searchValue) ||
        booking.mechanicId?.name
          ?.toLowerCase()
          .includes(searchValue) ||
        booking.status
          .toLowerCase()
          .includes(searchValue)
      );
    });

    return [...filtered].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "booking":
          comparison = a._id.localeCompare(b._id);
          break;

        case "customer":
          comparison = (
            a.customerId?.name || ""
          ).localeCompare(
            b.customerId?.name || ""
          );
          break;

        case "vehicle":
          comparison = (
            a.vehicleId?.registrationNumber || ""
          ).localeCompare(
            b.vehicleId?.registrationNumber || ""
          );
          break;

        case "service":
          comparison = (
            a.serviceId?.name || ""
          ).localeCompare(
            b.serviceId?.name || ""
          );
          break;

        case "mechanic":
          comparison = (
            a.mechanicId?.name || ""
          ).localeCompare(
            b.mechanicId?.name || ""
          );
          break;

        case "amount":
          comparison =
            (a.amount || 0) -
            (b.amount || 0);
          break;

        case "date":
          comparison =
            new Date(a.scheduledAt).getTime() -
            new Date(b.scheduledAt).getTime();
          break;
      }

      return sortDirection === "asc"
        ? comparison
        : -comparison;
    });
  }, [
    bookings,
    search,
    statusFilter,
    sortField,
    sortDirection,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredBookings.length / rowsPerPage
    )
  );

  const paginatedBookings =
    filteredBookings.slice(
      (currentPage - 1) * rowsPerPage,
      currentPage * rowsPerPage
    );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((current) =>
        current === "asc" ? "desc" : "asc"
      );
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const SortIcon = ({
    field,
  }: {
    field: SortField;
  }) => {
    if (sortField !== field) {
      return (
        <ArrowUpDown
          size={14}
          className="text-gray-400"
        />
      );
    }

    return sortDirection === "asc" ? (
      <ArrowUp size={14} />
    ) : (
      <ArrowDown size={14} />
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm text-gray-500">
              Operations
            </p>

            <h1 className="text-3xl font-bold text-gray-900">
              Bookings
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage and monitor service bookings
            </p>
          </div>

          <Link
            href="/"
            className="w-fit rounded-lg border bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            Dashboard
          </Link>
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-xl border bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row">

            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search booking, customer, vehicle, service..."
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-gray-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-gray-500"
            >
              <option value="all">
                All Statuses
              </option>

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

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-5 py-4 text-xs font-semibold uppercase text-gray-500">
                    <button
                      onClick={() =>
                        handleSort("booking")
                      }
                      className="flex items-center gap-2"
                    >
                      Booking
                      <SortIcon field="booking" />
                    </button>
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase text-gray-500">
                    <button
                      onClick={() =>
                        handleSort("customer")
                      }
                      className="flex items-center gap-2"
                    >
                      Customer
                      <SortIcon field="customer" />
                    </button>
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase text-gray-500">
                    <button
                      onClick={() =>
                        handleSort("vehicle")
                      }
                      className="flex items-center gap-2"
                    >
                      Vehicle
                      <SortIcon field="vehicle" />
                    </button>
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase text-gray-500">
                    <button
                      onClick={() =>
                        handleSort("service")
                      }
                      className="flex items-center gap-2"
                    >
                      Service
                      <SortIcon field="service" />
                    </button>
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase text-gray-500">
                    <button
                      onClick={() =>
                        handleSort("mechanic")
                      }
                      className="flex items-center gap-2"
                    >
                      Mechanic
                      <SortIcon field="mechanic" />
                    </button>
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase text-gray-500">
                    <button
                      onClick={() =>
                        handleSort("amount")
                      }
                      className="flex items-center gap-2"
                    >
                      Amount
                      <SortIcon field="amount" />
                    </button>
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase text-gray-500">
                    <button
                      onClick={() =>
                        handleSort("date")
                      }
                      className="flex items-center gap-2"
                    >
                      Date / Time
                      <SortIcon field="date" />
                    </button>
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase text-gray-500">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {loading ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-12 text-center text-sm text-gray-500"
                    >
                      Loading bookings...
                    </td>
                  </tr>
                ) : paginatedBookings.length ===
                  0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-12 text-center text-sm text-gray-500"
                    >
                      No bookings found.
                    </td>
                  </tr>
                ) : (
                  paginatedBookings.map(
                    (booking) => (
                      <tr
                        key={booking._id}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-5 py-4">
                          <Link
                            href={`/bookings/${booking._id}`}
                            className="font-semibold text-gray-900 hover:underline"
                          >
                            #
                            {booking._id
                              .slice(-6)
                              .toUpperCase()}
                          </Link>
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-medium text-gray-900">
                            {booking.customerId
                              ?.name || "N/A"}
                          </p>

                          <p className="text-xs text-gray-500">
                            {booking.customerId
                              ?.phone || ""}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-medium text-gray-900">
                            {booking.vehicleId
                              ?.registrationNumber ||
                              "N/A"}
                          </p>

                          <p className="text-xs text-gray-500">
                            {booking.vehicleId?.make}{" "}
                            {booking.vehicleId?.model}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-sm text-gray-700">
                          {booking.serviceId
                            ?.name || "N/A"}
                        </td>

                        <td className="px-5 py-4 text-sm text-gray-700">
                          {booking.mechanicId
                            ?.name ||
                            "Not assigned"}
                        </td>

                        <td className="px-5 py-4 font-medium text-gray-900">
                          ₹
                          {booking.amount?.toLocaleString(
                            "en-IN"
                          )}
                        </td>

                        <td className="px-5 py-4 text-sm text-gray-600">
                          {formatDateTime(
                            booking.scheduledAt
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
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
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading &&
            filteredBookings.length > 0 && (
              <div className="flex flex-col justify-between gap-4 border-t px-5 py-4 sm:flex-row sm:items-center">
                <p className="text-sm text-gray-500">
                  Showing{" "}
                  {(currentPage - 1) *
                    rowsPerPage +
                    1}{" "}
                  to{" "}
                  {Math.min(
                    currentPage * rowsPerPage,
                    filteredBookings.length
                  )}{" "}
                  of {filteredBookings.length}{" "}
                  bookings
                </p>

                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() =>
                      setCurrentPage(
                        (page) => page - 1
                      )
                    }
                    className="rounded-lg border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>

                  <span className="px-2 text-sm text-gray-600">
                    {currentPage} / {totalPages}
                  </span>

                  <button
                    disabled={
                      currentPage === totalPages
                    }
                    onClick={() =>
                      setCurrentPage(
                        (page) => page + 1
                      )
                    }
                    className="rounded-lg border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}