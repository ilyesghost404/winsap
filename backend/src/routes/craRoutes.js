const express = require("express");
const router = express.Router();
const {
  getMyActivities,
  getAllActivities,
  createEntry,
  startActivity,
  startExistingActivity,
  endActivity,
  updateEntry,
  deleteEntry,
  approveEntry,
  rejectEntry,
  getStats,
  getLiveActivities
} = require("../controllers/craController");
const { requireAuth, authorizeRoles } = require("../middleware/authMiddleware");

// All routes require authentication
router.use(requireAuth);

// Static paths first
router.get("/stats", getStats);
router.get("/my-activities", getMyActivities);
router.get("/live", authorizeRoles("manager"), getLiveActivities);

// Manager-only
router.get("/", authorizeRoles("manager"), getAllActivities);

// Creating & Starting activities
router.post("/", createEntry);
router.post("/start", startActivity);
router.put("/:id/start", startExistingActivity);
router.put("/:id/end", endActivity);

// Modifying entries
router.put("/:id", updateEntry);
router.delete("/:id", deleteEntry);

// Approving entries
router.put("/:id/approve", authorizeRoles("manager"), approveEntry);
router.put("/:id/reject", authorizeRoles("manager"), rejectEntry);

module.exports = router;
