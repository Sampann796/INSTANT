import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dashboardRoutes from "./routes/dashboard";
import bookingRoutes from "./routes/booking";
import mechanicRoutes from "./routes/mechanic";
import customerRoutes from "./routes/customer";
import serviceRoutes from "./routes/service";



import { env } from "./config/env";

const app = express();

// Security
app.use(helmet());

// CORS
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);

// Logging
app.use(morgan("dev"));

// Parse JSON
app.use(express.json());

// Health check
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Vehicle Service Dashboard API is running",
    timestamp: new Date().toISOString(),
  });
});

app.use(
  "/api/dashboard",
  dashboardRoutes
);

app.use(
  "/api/bookings",
  bookingRoutes
);

app.use(
  "/api/mechanics",
  mechanicRoutes
);

app.use(
  "/api/customers",
  customerRoutes
);

app.use(
  "/api/services",
  serviceRoutes
);

export default app;