const http = require("http");
const app = require("./app");
const pool = require("./config/database");
const { checkDatabaseConnection } = require("./config/database");
const { runAttendanceScheduler, runLeaveBalanceScheduler, runHolidayReminderScheduler } = require("./services/attendanceScheduler");
const { startYearlyReportScheduler } = require("./services/employeeReportService");
const socketUtil = require("./utils/socket");

const PORT = parseInt(process.env.PORT, 10) || 5000;

// Create HTTP server
const server = http.createServer(app);

// Configure CORS origin for socket connection
const allowedOrigin = process.env.NODE_ENV === "production"
  ? (process.env.FRONTEND_URL || "http://localhost:5173")
  : true;

// Initialize Socket.IO
socketUtil.init(server, allowedOrigin);

// Graceful shutdown helper
let isShuttingDown = false;
async function gracefulShutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`\n🛑 Received ${signal}. Shutting down backend gracefully...`);

  // Close HTTP server to stop accepting new requests
  server.close(async () => {
    console.log("   ✓ HTTP server closed.");
    try {
      if (pool && typeof pool.end === "function") {
        await pool.end();
        console.log("   ✓ Database pool closed.");
      }
    } catch (err) {
      console.warn("   ✗ Error closing database pool:", err.message);
    }
    console.log("   ✓ Backend shutdown complete.");
    process.exit(0);
  });

  // Force close after 3 seconds if graceful shutdown hangs
  setTimeout(() => {
    console.error("   ⚠️  Forced shutdown after timeout.");
    process.exit(1);
  }, 3000).unref();
}

// Listen for process signals
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

// Support nodemon reload signal without leaving port bound
process.once("SIGUSR2", async () => {
  console.log("\n🔄 Nodemon restart requested. Releasing port...");
  server.close(() => {
    process.kill(process.pid, "SIGUSR2");
  });
});

// Handle server listen errors
server.on("error", (error) => {
  if (error.syscall !== "listen") {
    throw error;
  }
  if (error.code === "EADDRINUSE") {
    console.error(`\n❌ Port ${PORT} is already in use by another process.`);
    console.error(`   To free it, run: npm run free-ports\n`);
    process.exit(1);
  } else {
    console.error("❌ Server error:", error);
    process.exit(1);
  }
});

// Start listening
server.listen(PORT, async () => {
  console.log(`🚀 AbsenceFlow API running on port ${PORT}`);

  // Verify database connection before starting background schedulers
  const dbConnected = await checkDatabaseConnection();

  if (dbConnected) {
    runAttendanceScheduler();
    runLeaveBalanceScheduler();
    runHolidayReminderScheduler();
    startYearlyReportScheduler();
  } else {
    console.warn("⚠️  Server is running but database is unreachable. Some features will not work.");
    console.warn("   Start PostgreSQL and restart the server.\n");
  }
});
