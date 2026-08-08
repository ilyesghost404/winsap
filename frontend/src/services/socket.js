import { io } from "socket.io-client";

let socket = null;

export const connectSocket = () => {
  if (socket) return socket;

  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  if (!token) {
    console.warn("⚠️ Cannot connect to WebSocket: No JWT token found.");
    return null;
  }

  // Determine socket url (use host of location or default to 5000 API)
  const isDesktop = import.meta.env.VITE_IS_DESKTOP;
  const socketUrl = isDesktop
    ? (import.meta.env.VITE_API_URL || "http://127.0.0.1:5000")
    : `${window.location.protocol}//${window.location.hostname}:5000`;

  socket = io(socketUrl, {
    auth: { token },
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000
  });

  socket.on("connect", () => {
    console.log(`🔌 Securely connected to WebSockets with ID: ${socket.id}`);
  });

  socket.on("connect_error", (err) => {
    console.error("❌ Socket connection failed:", err.message);
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return connectSocket();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log("🔌 WebSockets cleanly disconnected.");
  }
};
