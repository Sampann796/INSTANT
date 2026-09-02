import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";

import {connectDB} from "./config/db";

import dashboardRoutes from "./routes/dashboard";
import bookingRoutes from "./routes/booking";
import mechanicRoutes from "./routes/mechanic";
import customerRoutes from "./routes/customer";
import serviceRoutes from "./routes/service";

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  },
});

app.set("io", io);

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "INSTANT API is running",
  });
});

app.use("/api/dashboard", dashboardRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/mechanics", mechanicRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/services", serviceRoutes);

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, () => {
      console.log(
        `Server running on http://localhost:${PORT}`
      );
      console.log("Socket.IO is enabled");
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();