import { io } from "socket.io-client";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const socket = io(API_URL, {
  autoConnect: true,
});

export default socket;