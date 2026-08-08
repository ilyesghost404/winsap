const http = require("http");
const app = require("./app");
const { checkDatabaseConnection } = require("./config/database");
const { runAttendanceScheduler, runLeaveBalanceScheduler } = require("./services/attendanceScheduler");
const { startYearlyReportScheduler } = require("./services/employeeReportService");
const socketUtil = require("./utils/socket");

const PORT = 5000;

// Create HTTP server
const server = http.createServer(app);

// Configure CORS origin for socket connection
const allowedOrigin = process.env.NODE_ENV === "production"
  ? (process.env.FRONTEND_URL || "http://localhost:5173")
  : true;

// Initialize Socket.IO
socketUtil.init(server, allowedOrigin);

server.listen(PORT, async () => {
    console.log(`WinSAP API running on port ${PORT}`);

    // Verify database connection before starting services
    const dbConnected = await checkDatabaseConnection();

    if (dbConnected) {
        runAttendanceScheduler();
        runLeaveBalanceScheduler();
        startYearlyReportScheduler();
    } else {
        console.warn("⚠️  Server is running but database is unreachable. Some features will not work.");
        console.warn("   Start PostgreSQL and restart the server.\n");
    }
});

