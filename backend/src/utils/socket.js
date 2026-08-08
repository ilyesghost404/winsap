const socketIo = require("socket.io");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "absenceflow_jwt_secret_key_12345";
let io = null;

function init(server, allowedOrigin) {
  io = socketIo(server, {
    cors: {
      origin: allowedOrigin || true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: true
    }
  });

  // JWT middleware authorization on handshake connection
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      return next(new Error("Authentication error: Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`🔌 New secure client connection: ${socket.id} (User ID: ${socket.user.id}, Role: ${socket.user.role})`);

    // Auto-join specific rooms for real-time notifications
    if (socket.user.id) {
      socket.join(`user_${socket.user.id}`);
    }
    if (socket.user.employee_id) {
      socket.join(`employee_${socket.user.employee_id}`);
    }
    if (socket.user.role === "manager") {
      socket.join("managers");
    }

    socket.on("join", (room) => {
      // Security check: Only allow manager role to join manager room
      if (room === "managers" && socket.user.role !== "manager") {
        console.warn(`🔒 Unauthorized attempt to join room 'managers' by ${socket.id} (Role: ${socket.user.role})`);
        return;
      }
      socket.join(room);
      console.log(`👥 Client ${socket.id} joined room: ${room}`);
    });

    socket.on("disconnect", () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

function getIo() {
  if (!io) {
    throw new Error("Socket.IO has not been initialized yet!");
  }
  return io;
}

module.exports = {
  init,
  getIo
};
