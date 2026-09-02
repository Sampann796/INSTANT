"use client";

import { useEffect, useState } from "react";

import {
  LayoutDashboard,
  CalendarDays,
  Wrench,
  Users,
  Car,
  Settings,
  Search,
  Bell,
} from "lucide-react";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type DashboardData = {
  totalBookings: number;
  completedBookings: number;
  pendingBookings: number;
  activeBookings: number;
  cancelledBookings: number;
  totalCustomers: number;
  availableMechanics: number;
  totalMechanics: number;
  revenue: number;
  averageBookingValue: number;
  completionRate: number;
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

export default function Dashboard() {
  const [dashboard, setDashboard] =
  useState<DashboardData | null>(null);

const [loading, setLoading] =
  useState(true);

const [error, setError] =
  useState<string | null>(null);

useEffect(() => {
  const loadDashboard = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/dashboard"
      );

      if (!response.ok) {
        throw new Error(
          "Failed to load dashboard"
        );
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(
          result.message ||
            "Failed to load dashboard"
        );
      }

      setDashboard(result.data);
    } catch (err) {
      console.error(err);

      setError(
        "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  loadDashboard();
}, []);
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">

        {/* Sidebar */}
        <aside className="hidden w-64 border-r bg-white lg:flex lg:flex-col">

          <div className="flex h-16 items-center border-b px-6">
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                INSTANT
              </h1>
              <p className="text-xs text-slate-500">
                Service Management
              </p>
            </div>
          </div>

          <nav className="flex-1 space-y-1 p-4">

            <NavItem
              icon={<LayoutDashboard size={18} />}
              label="Dashboard"
              active
            />

            <NavItem
              icon={<CalendarDays size={18} />}
              label="Bookings"
            />

            <NavItem
              icon={<Wrench size={18} />}
              label="Mechanics"
            />

            <NavItem
              icon={<Users size={18} />}
              label="Customers"
            />

            <NavItem
              icon={<Car size={18} />}
              label="Vehicles"
            />

            <NavItem
              icon={<Settings size={18} />}
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
                Service operations overview
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

            <div className="mb-6">
              <h3 className="text-2xl font-bold">
                Good morning, Admin
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Here's what's happening with your service operations today.
              </p>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

              <KpiCard
                title="Total Bookings"
                value={
                 loading
                    ? "..."
                    : dashboard?.totalBookings?.toLocaleString() || "0"
                  }
                change="+12.5%"
                icon={<CalendarDays size={20} />}
              />

              <KpiCard
                title="Active Mechanics"
                value={
                    loading
                      ? "..."
                        : dashboard
                        ? `${dashboard.availableMechanics}/${dashboard.totalMechanics}`
                            : "0"
                      }
                change="+4.2%"
                icon={<Wrench size={20} />}
              />

              <KpiCard
                title="Customers"
                value={
                          loading
                          ? "..."
                            : dashboard?.totalCustomers?.toLocaleString() || "0"
                            }
                change="+8.1%"
                icon={<Users size={20} />}
              />

              <KpiCard
                title="Vehicles"
                value="100"
                change="+6.7%"
                icon={<Car size={20} />}
              />

            </div>

            {/* Placeholder sections */}
            <div className="mt-6 grid gap-6 xl:grid-cols-3">

              <div className="rounded-xl border bg-white p-6 xl:col-span-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">
                      Booking Overview
                    </h4>

                    <p className="text-sm text-slate-500">
                      Booking activity will appear here.
                    </p>
                  </div>

                  <select className="rounded-lg border px-3 py-2 text-sm">
                    <option>Last 7 days</option>
                    <option>Last 30 days</option>
                    <option>Last 90 days</option>
                  </select>
                </div>

                <div className="mt-6 flex h-64 items-center justify-center rounded-lg bg-slate-50 text-sm text-slate-400">
                  Chart coming next
                </div>
              </div>

              <div className="rounded-xl border bg-white p-6">
                <h4 className="font-semibold">
                  Service Distribution
                </h4>

                <p className="mt-1 text-sm text-slate-500">
                  Overview of service categories.
                </p>

                <div className="mt-6 flex h-64 items-center justify-center rounded-lg bg-slate-50 text-sm text-slate-400">
                  Chart coming next
                </div>
              </div>

            </div>

            {/* Recent bookings */}
            <div className="mt-6 rounded-xl border bg-white">

              <div className="flex items-center justify-between border-b p-6">
                <div>
                  <h4 className="font-semibold">
                    Recent Bookings
                  </h4>

                  <p className="text-sm text-slate-500">
                    Latest service bookings
                  </p>
                </div>

                <button className="text-sm font-medium text-slate-700 hover:underline">
                  View all
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">

                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-6 py-3">Booking</th>
                      <th className="px-6 py-3">Customer</th>
                      <th className="px-6 py-3">Service</th>
                      <th className="px-6 py-3">Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr className="border-t">
                      <td className="px-6 py-4">
                        Loading...
                      </td>

                      <td className="px-6 py-4">
                        —
                      </td>

                      <td className="px-6 py-4">
                        —
                      </td>

                      <td className="px-6 py-4">
                        —
                      </td>
                    </tr>
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
    <button
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
        active
          ? "bg-slate-900 text-white"
          : "text-slate-600 hover:bg-slate-100"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}


function KpiCard({
  title,
  value,
  change,
  icon,
}: {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-white p-5">

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {title}
        </p>

        <div className="rounded-lg bg-slate-100 p-2">
          {icon}
        </div>
      </div>

      <div className="mt-4 flex items-end justify-between">
        <p className="text-2xl font-bold">
          {value}
        </p>

        <span className="text-xs font-medium text-emerald-600">
          {change}
        </span>
      </div>

    </div>
  );
}