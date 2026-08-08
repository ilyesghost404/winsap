const express = require("express");
const router = express.Router();
const {
    getReportStats,
    getMonthlyAbsenceEvolution,
    getDepartmentStats,
    getAbsenceTypes,
    getEmployeeRanking,
    getDetailedAbsences,
    exportToExcel,
    getMonthlyReport,
    getAttendanceMatrix,
    getEmployeeYearlyReport,
    exportEmployeeYearlyExcel,
    exportEmployeeYearlyPdf
} = require("../controllers/reportController");
const { requireAuth, authorizeRoles } = require("../middleware/authMiddleware");

// All report routes require authentication and are restricted to manager/admin roles
router.use(requireAuth, authorizeRoles("manager"));

// Yearly employee activity reports (manager-only)
router.get("/employees/:employeeId/year/:year", getEmployeeYearlyReport);
router.get("/employees/:employeeId/year/:year/excel", exportEmployeeYearlyExcel);
router.get("/employees/:employeeId/year/:year/pdf", exportEmployeeYearlyPdf);

// General manager report views
router.get("/statistics", getReportStats);
router.get("/monthly-evolution", getMonthlyAbsenceEvolution);
router.get("/departments", getDepartmentStats);
router.get("/types", getAbsenceTypes);
router.get("/ranking", getEmployeeRanking);
router.get("/detailed", getDetailedAbsences);
router.get("/attendance-matrix", getAttendanceMatrix);
router.get("/export/excel", exportToExcel);
router.get("/:year/:month", getMonthlyReport);

module.exports = router;
