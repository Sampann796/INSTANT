"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  CalendarDays,
  Wrench,
  Users,
  Car,
  Settings,
  Search,
  Bell,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  IndianRupee,
  UserPlus,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type DashboardKpis = {
  totalBookings: number;
  todayBookings: number;
  completedBookings: number;
  pendingBookings: number;
  activeBookings: number;
  cancelledBookings: number;
  totalCustomers: number;
  newCustomers: number;
  totalVehicles: number;
  availableMechanics: number;
  totalMechanics: number;
  revenue: number;
  averageBookingValue: number;
  completionRate: number;
};

type DashboardData = {
  range: string;
  kpis: DashboardKpis;
  statusBreakdown: {
    _id: string;
    count: number;
  }[];
  serviceBreakdown: {
    _id: string;
    bookings: number;
    revenue: number;
  }[];
  dailyBookings: {
    _id: string;
    bookings: number;
    completed: number;
    revenue: number;
  }[];
};

type Booking = {
  _id: string;
  status: string;
  amount: number;
  scheduledAt: string;

  customerId?: {
    name: string;
    phone?: string;
  };

  vehicleId?: {
    registrationNumber: string;
    make: string;
    model: string;
  };

  mechanicId?: {
    name: string;
  };

  serviceId?: {
    name: string;
  };
};

export default function DashboardPage() {
  const [dashboard, setDashboard] =
    useState<DashboardData | null>(null);

  const [bookings, setBookings] =
    useState<Booking[]>([]);

  const [range, setRange] =
    useState("30d");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError(null);

        const [
          dashboardResponse,
          bookingsResponse,
        ] = await Promise.all([
          fetch(
            `${API_URL}/api/dashboard?range=${range}`
          ),
          fetch(
            `${API_URL}/api/bookings`
          ),
        ]);

        if (
          !dashboardResponse.ok ||
          !bookingsResponse.ok
        ) {
          throw new Error(
            "Failed to load dashboard data"
          );
        }

        const dashboardResult =
          await dashboardResponse.json();

        const bookingsResult =
          await bookingsResponse.json();

        if (!dashboardResult.success) {
          throw new Error(
            dashboardResult.message ||
              "Failed to load dashboard"
          );
        }

        if (!bookingsResult.success) {
          throw new Error(
            bookingsResult.message ||
              "Failed to load bookings"
          );
        }

        setDashboard(
          dashboardResult.data
        );

        setBookings(
          bookingsResult.data
        );
      } catch (error) {
        console.error(
          "Dashboard error:",
          error
        );

        setError(
          "Unable to load dashboard data."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [range]);

  const formatCurrency = (
    value: number
  ) => {
    return `₹${value.toLocaleString("en-IN", {
      maximumFractionDigits: 0,
    })}`;
  };

  const formatDate = (
    dateString: string
  ) => {
    if (!dateString) {
      return "N/A";
    }

    return new Date(
      dateString
    ).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatChartDate = (
    dateString: string
  ) => {
    return new Date(
      `${dateString}T00:00:00`
    ).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });
  };

  const recentBookings =
    [...bookings]
      .sort(
        (a, b) =>
          new Date(
            b.scheduledAt
          ).getTime() -
          new Date(
            a.scheduledAt
          ).getTime()
      )
      .slice(0, 5);

  const statusData =
    dashboard?.statusBreakdown.map(
      (item) => ({
        name: formatStatus(
          item._id
        ),
        value: item.count,
      })
    ) || [];

  const bookingChartData =
    dashboard?.dailyBookings.map(
      (item) => ({
        date: formatChartDate(
          item._id
        ),
        bookings: item.bookings,
        completed: item.completed,
      })
    ) || [];

  const revenueChartData =
    dashboard?.dailyBookings.map(
      (item) => ({
        date: formatChartDate(
          item._id
        ),
        revenue: item.revenue,
      })
    ) || [];

  const serviceChartData =
    dashboard?.serviceBreakdown.map(
      (item) => ({
        service: item._id,
        bookings: item.bookings,
      })
    ) || [];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">

        {/* Sidebar */}

        <aside className="hidden w-64 border-r bg-white lg:flex lg:flex-col">
          <div className="flex h-16 items-center border-b px-6">
            <div>
              <h1 className="text-xl font-bold">
                INSTANT
              </h1>

              <p className="text-xs text-slate-500">
                Service Management
              </p>
            </div>
          </div>

          <nav className="flex-1 space-y-1 p-4">

            <NavItem
              icon={
                <LayoutDashboard
                  size={18}
                />
              }
              label="Dashboard"
              active
            />

            <Link href="/bookings">
              <NavItem
                icon={
                  <CalendarDays
                    size={18}
                  />
                }
                label="Bookings"
              />
            </Link>

            <NavItem
              icon={
                <Wrench size={18} />
              }
              label="Mechanics"
            />

            <NavItem
              icon={
                <Users size={18} />
              }
              label="Customers"
            />

            <NavItem
              icon={
                <Car size={18} />
              }
              label="Vehicles"
            />

            <NavItem
              icon={
                <Settings size={18} />
              }
              label="Settings"
            />

          </nav>

          <div className="border-t p-4">
            <div className="rounded-xl bg-slate-100 p-3">
              <p className="text-sm font-medium">
                System Status
              </p>

              <div className="mt-2 flex items-center gap-2 text-xs text-slate-600">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />

                All systems operational
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}

        <section className="flex-1">

          {/* Header */}

          <header className="flex h-16 items-center justify-between border-b bg-white px-6">

            <div>
              <h2 className="text-lg font-semibold">
                Dashboard
              </h2>

              <p className="text-xs text-slate-500">
                Service management overview
              </p>
            </div>

            <div className="flex items-center gap-3">

              <button className="rounded-lg border p-2 hover:bg-slate-50">
                <Search size={18} />
              </button>

              <button className="relative rounded-lg border p-2 hover:bg-slate-50">
                <Bell size={18} />

                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
              </button>

              <div className="ml-2 flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                  SA
                </div>

                <div className="hidden sm:block">
                  <p className="text-sm font-medium">
                    Admin
                  </p>

                  <p className="text-xs text-slate-500">
                    Administrator
                  </p>
                </div>

              </div>
            </div>
          </header>

          {/* Content */}

          <div className="p-6">

            {/* Title */}

            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

              <div>
                <h3 className="text-2xl font-bold">
                  Dashboard Overview
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Monitor bookings, revenue and service activity.
                </p>
              </div>

              <select
                value={range}
                onChange={(e) =>
                  setRange(
                    e.target.value
                  )
                }
                className="rounded-lg border bg-white px-4 py-2.5 text-sm outline-none focus:border-slate-400"
              >
                <option value="7d">
                  Last 7 days
                </option>

                <option value="30d">
                  Last 30 days
                </option>

                <option value="90d">
                  Last 90 days
                </option>
              </select>

            </div>

            {/* Error */}

            {error && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* KPI Cards */}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

              <KpiCard
                title="Total Bookings"
                value={
                  loading
                    ? "..."
                    : dashboard?.kpis.totalBookings.toLocaleString(
                        "en-IN"
                      ) || "0"
                }
                subtitle={`Last ${range.replace(
                  "d",
                  ""
                )} days`}
                icon={
                  <CalendarDays
                    size={20}
                  />
                }
              />

              <KpiCard
                title="Today's Bookings"
                value={
                  loading
                    ? "..."
                    : dashboard?.kpis.todayBookings.toLocaleString(
                        "en-IN"
                      ) || "0"
                }
                subtitle="Created today"
                icon={
                  <Clock size={20} />
                }
              />

              <KpiCard
                title="Completed"
                value={
                  loading
                    ? "..."
                    : dashboard?.kpis.completedBookings.toLocaleString(
                        "en-IN"
                      ) || "0"
                }
                subtitle={
                  dashboard
                    ? `${dashboard.kpis.completionRate}% completion rate`
                    : "Completed bookings"
                }
                icon={
                  <CheckCircle2
                    size={20}
                  />
                }
              />

              <KpiCard
                title="Pending"
                value={
                  loading
                    ? "..."
                    : dashboard?.kpis.pendingBookings.toLocaleString(
                        "en-IN"
                      ) || "0"
                }
                subtitle="Awaiting service"
                icon={
                  <Clock size={20} />
                }
              />

              <KpiCard
                title="Cancelled"
                value={
                  loading
                    ? "..."
                    : dashboard?.kpis.cancelledBookings.toLocaleString(
                        "en-IN"
                      ) || "0"
                }
                subtitle="Cancelled bookings"
                icon={
                  <XCircle size={20} />
                }
              />

              <KpiCard
                title="Total Revenue"
                value={
                  loading
                    ? "..."
                    : formatCurrency(
                        dashboard?.kpis.revenue ||
                          0
                      )
                }
                subtitle="Completed bookings"
                icon={
                  <IndianRupee
                    size={20}
                  />
                }
              />

              <KpiCard
                title="Active Mechanics"
                value={
                  loading
                    ? "..."
                    : dashboard?.kpis.availableMechanics.toLocaleString(
                        "en-IN"
                      ) || "0"
                }
                subtitle={
                  dashboard
                    ? `of ${dashboard.kpis.totalMechanics} mechanics available`
                    : "Available mechanics"
                }
                icon={
                  <Wrench size={20} />
                }
              />

              <KpiCard
                title="New Customers"
                value={
                  loading
                    ? "..."
                    : dashboard?.kpis.newCustomers.toLocaleString(
                        "en-IN"
                      ) || "0"
                }
                subtitle={`Last ${range.replace(
                  "d",
                  ""
                )} days`}
                icon={
                  <UserPlus size={20} />
                }
              />

            </div>

            {/* Analytics */}

            <div className="mt-6 grid gap-6 xl:grid-cols-2">

              {/* Booking Overview */}

              <ChartCard
                title="Booking Overview"
                subtitle="Bookings and completed bookings over time"
              >
                <ResponsiveContainer
                  width="100%"
                  height={300}
                >
                  <LineChart
                    data={
                      bookingChartData
                    }
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="date"
                      tick={{
                        fontSize: 11,
                      }}
                    />

                    <YAxis
                      allowDecimals={false}
                      tick={{
                        fontSize: 11,
                      }}
                    />

                    <Tooltip />

                    <Legend />

                    <Line
                      type="monotone"
                      dataKey="bookings"
                      name="Bookings"
                      strokeWidth={2}
                      dot={false}
                    />

                    <Line
                      type="monotone"
                      dataKey="completed"
                      name="Completed"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Revenue */}

              <ChartCard
                title="Revenue Over Time"
                subtitle="Revenue from completed bookings"
              >
                <ResponsiveContainer
                  width="100%"
                  height={300}
                >
                  <LineChart
                    data={
                      revenueChartData
                    }
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="date"
                      tick={{
                        fontSize: 11,
                      }}
                    />

                    <YAxis
                      tick={{
                        fontSize: 11,
                      }}
                      tickFormatter={(
                        value
                      ) =>
                        `₹${(
                          value / 1000
                        ).toFixed(0)}k`
                      }
                    />

                    <Tooltip
                      formatter={(
                        value
                      ) =>
                        formatCurrency(
                          Number(value)
                        )
                      }
                    />

                    <Line
                      type="monotone"
                      dataKey="revenue"
                      name="Revenue"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Service Distribution */}

              <ChartCard
                title="Service Distribution"
                subtitle="Bookings by service type"
              >
                <ResponsiveContainer
                  width="100%"
                  height={300}
                >
                  <BarChart
                    data={
                      serviceChartData
                    }
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="service"
                      tick={{
                        fontSize: 10,
                      }}
                      interval={0}
                      angle={-25}
                      textAnchor="end"
                      height={70}
                    />

                    <YAxis
                      allowDecimals={false}
                      tick={{
                        fontSize: 11,
                      }}
                    />

                    <Tooltip />

                    <Bar
                      dataKey="bookings"
                      name="Bookings"
                      radius={[
                        4,
                        4,
                        0,
                        0,
                      ]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Booking Status */}

              <ChartCard
                title="Booking Status"
                subtitle="Current booking status distribution"
              >
                <ResponsiveContainer
                  width="100%"
                  height={300}
                >
                  <PieChart>
                    <Pie
                      data={statusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {statusData.map(
                        (_, index) => (
                          <Cell
                            key={`cell-${index}`}
                          />
                        )
                      )}
                    </Pie>

                    <Tooltip />

                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>

            </div>

            {/* Recent Bookings */}

            <div className="mt-6 rounded-xl border bg-white">

              <div className="flex items-center justify-between border-b p-6">

                <div>
                  <h4 className="font-semibold">
                    Recent Bookings
                  </h4>

                  <p className="mt-1 text-sm text-slate-500">
                    Latest service bookings
                  </p>
                </div>

                <Link
                  href="/bookings"
                  className="text-sm font-medium text-slate-700 hover:underline"
                >
                  View all
                </Link>

              </div>

              <div className="overflow-x-auto">

                <table className="w-full min-w-[900px] text-left text-sm">

                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">

                    <tr>
                      <th className="px-6 py-3">
                        Booking
                      </th>

                      <th className="px-6 py-3">
                        Customer
                      </th>

                      <th className="px-6 py-3">
                        Vehicle
                      </th>

                      <th className="px-6 py-3">
                        Service
                      </th>

                      <th className="px-6 py-3">
                        Amount
                      </th>

                      <th className="px-6 py-3">
                        Date / Time
                      </th>

                      <th className="px-6 py-3">
                        Status
                      </th>
                    </tr>

                  </thead>

                  <tbody>

                    {loading ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-6 py-10 text-center text-slate-400"
                        >
                          Loading bookings...
                        </td>
                      </tr>
                    ) : recentBookings.length ===
                      0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-6 py-10 text-center text-slate-400"
                        >
                          No recent bookings.
                        </td>
                      </tr>
                    ) : (
                      recentBookings.map(
                        (booking) => (
                          <tr
                            key={
                              booking._id
                            }
                            className="border-t hover:bg-slate-50"
                          >

                            <td className="px-6 py-4 font-medium">
                              <Link
                                href={`/bookings/${booking._id}`}
                                className="hover:underline"
                              >
                                #
                                {booking._id
                                  .slice(
                                    -6
                                  )
                                  .toUpperCase()}
                              </Link>
                            </td>

                            <td className="px-6 py-4">
                              <p className="font-medium">
                                {booking
                                  .customerId
                                  ?.name ||
                                  "Unknown"}
                              </p>

                              {booking
                                .customerId
                                ?.phone && (
                                <p className="text-xs text-slate-500">
                                  {
                                    booking
                                      .customerId
                                      .phone
                                  }
                                </p>
                              )}
                            </td>

                            <td className="px-6 py-4">
                              <p className="font-medium">
                                {booking
                                  .vehicleId
                                  ?.registrationNumber ||
                                  "Unknown"}
                              </p>

                              <p className="text-xs text-slate-500">
                                {booking
                                  .vehicleId
                                  ? `${booking.vehicleId.make} ${booking.vehicleId.model}`
                                  : ""}
                              </p>
                            </td>

                            <td className="px-6 py-4">
                              {booking
                                .serviceId
                                ?.name ||
                                "Unknown"}
                            </td>

                            <td className="px-6 py-4 font-medium">
                              {formatCurrency(
                                booking.amount ||
                                  0
                              )}
                            </td>

                            <td className="px-6 py-4 text-slate-600">
                              {formatDate(
                                booking.scheduledAt
                              )}
                            </td>

                            <td className="px-6 py-4">
                              <StatusBadge
                                status={
                                  booking.status
                                }
                              />
                            </td>

                          </tr>
                        )
                      )
                    )}

                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </section>
      </div>
    </main>
  );
}

function KpiCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-white p-5">

      <div className="flex items-start justify-between">

        <div>
          <p className="text-sm text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {subtitle}
          </p>
        </div>

        <div className="rounded-lg bg-slate-100 p-2.5 text-slate-700">
          {icon}
        </div>

      </div>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-white p-6">

      <div className="mb-4">
        <h4 className="font-semibold">
          {title}
        </h4>

        <p className="mt-1 text-sm text-slate-500">
          {subtitle}
        </p>
      </div>

      {children}

    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const styles: Record<
    string,
    string
  > = {
    pending:
      "bg-amber-100 text-amber-700",

    assigned:
      "bg-blue-100 text-blue-700",

    on_the_way:
      "bg-purple-100 text-purple-700",

    in_progress:
      "bg-indigo-100 text-indigo-700",

    completed:
      "bg-emerald-100 text-emerald-700",

    cancelled:
      "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
        styles[status] ||
        "bg-slate-100 text-slate-600"
      }`}
    >
      {formatStatus(status)}
    </span>
  );
}

function formatStatus(
  status: string
) {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

function NavItem({
  icon,
  label,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
        active
          ? "bg-slate-900 text-white"
          : "text-slate-600 hover:bg-slate-100"
      }`}
    >
      {icon}
      {label}
    </div>
  );
}