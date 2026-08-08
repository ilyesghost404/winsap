const express = require("express");
const router = express.Router();
const { getMyBalance, getEmployeeLeaveBalance } = require("../controllers/leaveBalanceController");
const { requireAuth } = require("../middleware/authMiddleware");

// All routes require authentication
router.use(requireAuth);

router.get("/my-balance", getMyBalance);
router.get("/:id", getEmployeeLeaveBalance);

module.exports = router;
