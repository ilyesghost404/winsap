const CraEntry = require("../models/CraEntry");
const db = require("../config/database");
const socketUtil = require("../utils/socket");

/**
 * GET /api/cra/my-activities
 */
const getMyActivities = async (req, res) => {
  try {
    const employeeId = req.user.employee_id;
    if (!employeeId) {
      return res.json({ success: true, data: [], page: 1, limit: 10, total: 0, totalPages: 0, currentTask: null, nextTask: null, hasQueuedTask: false });
    }

    const { page, limit, status, month, year, startDate, endDate, search } = req.query;
    const params = {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      status: status || undefined,
      month: month || undefined,
      year: year || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      search: search || ''
    };

    const result = await CraEntry.getByEmployeeId(employeeId, params);
    const currentTask = await CraEntry.getActiveTimer(employeeId);
    const nextTask = await CraEntry.getNextPendingTask(employeeId);

    res.json({
      success: true,
      ...result,
      currentTask: currentTask || null,
      nextTask: nextTask || null,
      hasQueuedTask: !!nextTask
    });
  } catch (error) {
    console.error("Error in getMyActivities:", error);
    res.status(500).json({ success: false, message: "Failed to fetch activities" });
  }
};

/**
 * GET /api/cra
 */
const getAllActivities = async (req, res) => {
  try {
    const { page, limit, search, status, employeeId, month, year, startDate, endDate } = req.query;
    const params = {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      search: search || '',
      status: status || undefined,
      employeeId: employeeId || undefined,
      month: month || undefined,
      year: year || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined
    };

    const result = await CraEntry.getAll(params);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error("Error in getAllActivities:", error);
    res.status(500).json({ success: false, message: "Failed to fetch activities" });
  }
};

/**
 * POST /api/cra
 * Create a new CRA entry as PENDING_START.
 */
const createEntry = async (req, res) => {
  try {
    let employeeId;

    if (req.user.role === 'manager') {
      employeeId = req.body.employeeId || req.body.employee_id;
      if (!employeeId) {
        return res.status(400).json({ success: false, message: "Employee selection is required" });
      }
    } else {
      employeeId = req.user.employee_id;
      if (!employeeId) {
        return res.status(400).json({ success: false, message: "No employee profile linked to this account" });
      }
    }

    const ticketReference = req.body.ticketReference || req.body.ticket_reference;
    const description = req.body.description;
    const priority = req.body.priority;
    const startDate = req.body.startDate || req.body.start_time;
    const endDate = req.body.endDate || req.body.end_time;
    const durationMinutes = req.body.durationMinutes !== undefined ? req.body.durationMinutes : req.body.duration_minutes;

    if (!ticketReference || !ticketReference.trim()) {
      return res.status(400).json({ success: false, message: "Ticket reference is required" });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ success: false, message: "Description is required" });
    }

    // Map priority string (High/Medium/Low) or number to numeric representation
    let priorityVal = 1; // Medium default
    if (priority === 'High' || priority === 2 || priority === '2') priorityVal = 2;
    else if (priority === 'Low' || priority === 0 || priority === '0') priorityVal = 0;

    const startImmediately = Boolean(req.body.start_immediately || req.body.startImmediately || req.body.start_timer_now);

    let entry;
    if (startImmediately) {
      const active = await CraEntry.getActiveTimer(employeeId);
      if (active) {
        return res.status(400).json({ success: false, message: "You already have an active running timer." });
      }
      entry = await CraEntry.createAndStart({
        employee_id: parseInt(employeeId, 10),
        ticket_reference: ticketReference.trim(),
        description: description.trim(),
        priority: priorityVal
      });

      try {
        const empRes = await db.query(
          "SELECT first_name, last_name FROM employees WHERE id = $1",
          [employeeId]
        );
        const emp = empRes.rows[0];
        const employeeName = emp ? `${emp.first_name} ${emp.last_name}` : "Employee";
        const io = socketUtil.getIo();
        io.to("managers").emit("cra_started", {
          id: entry.id,
          employeeId: entry.employee_id,
          employeeName,
          ticketReference: entry.ticket_reference,
          description: entry.description,
          startTime: entry.start_time
        });
      } catch (err) {
        console.error("Failed to broadcast cra_started event:", err.message);
      }
    } else if (startDate && endDate && durationMinutes) {
      entry = await CraEntry.createManual({
        employee_id: parseInt(employeeId, 10),
        ticket_reference: ticketReference.trim(),
        description: description.trim(),
        priority: priorityVal,
        start_time: startDate,
        end_time: endDate,
        duration_minutes: parseInt(durationMinutes, 10),
        status: 'PENDING_APPROVAL',
        source: 'manual'
      });
    } else {
      entry = await CraEntry.createPending({
        employee_id: parseInt(employeeId, 10),
        ticket_reference: ticketReference.trim(),
        description: description.trim(),
        priority: priorityVal,
        source: 'manual'
      });
    }

    // Broadcast Socket.IO event so the employee dashboard refreshes in real-time
    try {
      const io = socketUtil.getIo();
      io.to(`employee_${employeeId}`).emit("cra_created", {
        craId: entry.id,
        ticketReference: entry.ticket_reference,
        description: entry.description,
        source: 'manual'
      });
    } catch (socketErr) {
      console.error("Failed to broadcast socket event:", socketErr.message);
    }

    res.status(201).json({ success: true, message: "Activity created successfully", data: entry });
  } catch (error) {
    console.error("Error in createEntry:", error);
    res.status(500).json({ success: false, message: "Failed to create activity entry" });
  }
};

/**
 * POST /api/cra/start
 * Starts a new CRA activity immediately.
 */
const startActivity = async (req, res) => {
  try {
    const employeeId = req.user.employee_id;
    if (!employeeId) {
      return res.status(400).json({ success: false, message: "No employee profile linked to this account" });
    }

    // Prevent duplicate active timers
    const active = await CraEntry.getActiveTimer(employeeId);
    if (active) {
      return res.status(400).json({ success: false, message: "You already have an active running timer." });
    }

    const ticketReference = req.body.ticketReference || req.body.ticket_reference;
    const description = req.body.description;

    if (!ticketReference || !ticketReference.trim()) {
      return res.status(400).json({ success: false, message: "Ticket reference is required" });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ success: false, message: "Description is required" });
    }

    const entry = await CraEntry.createAndStart({
      employee_id: employeeId,
      ticket_reference: ticketReference.trim(),
      description: description.trim()
    });

    // Fetch employee name
    const empRes = await db.query(
      "SELECT first_name, last_name FROM employees WHERE id = $1",
      [employeeId]
    );
    const emp = empRes.rows[0];
    const employeeName = emp ? `${emp.first_name} ${emp.last_name}` : "Employee";

    // Broadcast starting event
    try {
      const io = socketUtil.getIo();
      io.to("managers").emit("cra_started", {
        id: entry.id,
        employeeId: entry.employee_id,
        employeeName,
        ticketReference: entry.ticket_reference,
        description: entry.description,
        startTime: entry.start_time
      });
    } catch (err) {
      console.error("Failed to broadcast cra_started event:", err.message);
    }

    res.status(201).json({ success: true, message: "Activity started successfully", data: entry });
  } catch (error) {
    console.error("Error in startActivity:", error);
    res.status(500).json({ success: false, message: "Failed to start activity" });
  }
};

/**
 * PUT /api/cra/:id/start
 * Starts a previously created PENDING_START activity.
 */
const startExistingActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const employeeId = req.user.employee_id;

    const existing = await CraEntry.getById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Activity not found" });
    }
    if (existing.employee_id !== employeeId) {
      return res.status(430).json({ success: false, message: "You do not own this activity" });
    }
    if (existing.status !== 'PENDING_START') {
      return res.status(400).json({ success: false, message: "Activity has already been started or processed" });
    }

    // Prevent duplicate active timers
    const active = await CraEntry.getActiveTimer(employeeId);
    if (active) {
      return res.status(400).json({ success: false, message: "You already have an active running timer." });
    }

    const updated = await CraEntry.start(id);

    // Fetch employee name
    const empRes = await db.query(
      "SELECT first_name, last_name FROM employees WHERE id = $1",
      [employeeId]
    );
    const emp = empRes.rows[0];
    const employeeName = emp ? `${emp.first_name} ${emp.last_name}` : "Employee";

    // Broadcast starting event
    try {
      const io = socketUtil.getIo();
      io.to("managers").emit("cra_started", {
        id: updated.id,
        employeeId: updated.employee_id,
        employeeName,
        ticketReference: updated.ticket_reference,
        description: updated.description,
        startTime: updated.start_time
      });
    } catch (err) {
      console.error("Failed to broadcast cra_started event:", err.message);
    }

    res.json({ success: true, message: "Activity started", data: updated });
  } catch (error) {
    console.error("Error in startExistingActivity:", error);
    res.status(500).json({ success: false, message: "Failed to start activity" });
  }
};

/**
 * PUT /api/cra/:id/end
 * Ends the CRA activity, calculates duration, and sets status to PENDING_APPROVAL.
 */
const endActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const employeeId = req.user.employee_id;

    const existing = await CraEntry.getById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Activity not found" });
    }
    if (existing.employee_id !== employeeId) {
      return res.status(403).json({ success: false, message: "Only the employee who started this activity can end it." });
    }
    if (existing.status !== 'IN_PROGRESS') {
      return res.status(400).json({ success: false, message: "This activity is not running." });
    }

    const startTime = new Date(existing.start_time);
    const endTime = new Date();

    // Calculate duration in minutes (round up to nearest minute)
    const diffMs = endTime - startTime;
    const durationMinutes = Math.max(1, Math.round(diffMs / 60000));

    const updated = await CraEntry.end(id, endTime, durationMinutes);

    // Broadcast completion event to managers
    try {
      const io = socketUtil.getIo();
      io.to("managers").emit("cra_finished", {
        craId: parseInt(id, 10),
        employeeId: employeeId,
        endTime,
        duration: durationMinutes
      });
    } catch (err) {
      console.error("Failed to broadcast cra_finished event:", err.message);
    }

    res.json({
      success: true,
      message: "Activity ended successfully. Awaiting manager approval.",
      data: updated
    });
  } catch (error) {
    console.error("Error in endActivity:", error);
    res.status(500).json({ success: false, message: "Failed to end activity" });
  }
};

/**
 * PUT /api/cra/:id
 * Employee updates their own PENDING_START activity details.
 */
const updateEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const employeeId = req.user.employee_id;

    const existing = await CraEntry.getById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Activity entry not found" });
    }
    if (existing.employee_id !== employeeId) {
      return res.status(403).json({ success: false, message: "You can only edit your own entries" });
    }
    if (existing.status === 'APPROVED') {
      return res.status(403).json({ success: false, message: "Approved activities cannot be edited" });
    }

    const ticketReference = req.body.ticketReference || req.body.ticket_reference;
    const description = req.body.description;
    const priority = req.body.priority;
    const startDate = req.body.startDate || req.body.start_time;
    const endDate = req.body.endDate || req.body.end_time;
    const durationMinutes = req.body.durationMinutes !== undefined ? req.body.durationMinutes : req.body.duration_minutes;

    if (!ticketReference || !ticketReference.trim()) {
      return res.status(400).json({ success: false, message: "Ticket reference is required" });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ success: false, message: "Description is required" });
    }

    let priorityVal = 1;
    if (priority === 'High' || priority === 2 || priority === '2') priorityVal = 2;
    else if (priority === 'Low' || priority === 0 || priority === '0') priorityVal = 0;

    const updated = await CraEntry.updateManual(id, {
      ticket_reference: ticketReference.trim(),
      description: description.trim(),
      priority: priorityVal,
      start_time: startDate || existing.start_time,
      end_time: endDate || existing.end_time,
      duration_minutes: durationMinutes !== undefined ? parseInt(durationMinutes, 10) : existing.duration_minutes,
      status: (startDate && endDate && durationMinutes && existing.status === 'PENDING_START') ? 'PENDING_APPROVAL' : existing.status
    });

    res.json({ success: true, message: "Activity entry updated", data: updated });
  } catch (error) {
    console.error("Error in updateEntry:", error);
    res.status(500).json({ success: false, message: "Failed to update activity entry" });
  }
};

/**
 * DELETE /api/cra/:id
 * Employee deletes their own pending/unapproved entry before validation.
 */
const deleteEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const employeeId = req.user.employee_id;

    const existing = await CraEntry.getById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Activity entry not found" });
    }
    if (existing.employee_id !== employeeId && req.user.role !== 'manager') {
      return res.status(403).json({ success: false, message: "You can only delete your own entries" });
    }
    if (!['PENDING_START', 'IN_PROGRESS', 'PENDING_APPROVAL', 'COMPLETED'].includes(existing.status) && req.user.role !== 'manager') {
      return res.status(403).json({ success: false, message: "Validated entries cannot be deleted" });
    }

    await CraEntry.delete(id);
    res.json({ success: true, message: "Activity entry deleted" });
  } catch (error) {
    console.error("Error in deleteEntry:", error);
    res.status(500).json({ success: false, message: "Failed to delete activity entry" });
  }
};

/**
 * PUT /api/cra/:id/approve
 * Approves completed CRA and automatically starts next PENDING_START task if available.
 */
const approveEntry = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await CraEntry.getById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Activity entry not found" });
    }
    if (!['PENDING_APPROVAL', 'COMPLETED'].includes(existing.status)) {
      return res.status(400).json({ success: false, message: "Only activities pending approval can be approved" });
    }

    // Step 1: Update current CRA status from PENDING_APPROVAL -> APPROVED
    const updated = await CraEntry.updateStatus(id, 'APPROVED');
    const employeeId = existing.employee_id;

    // Broadcast cra_approved event
    try {
      const io = socketUtil.getIo();
      io.emit("cra_approved", {
        craId: parseInt(id, 10),
        employeeId: employeeId
      });
    } catch (err) {
      console.error("Failed to broadcast cra_approved event:", err.message);
    }

    // Step 2: Search for next PENDING_START task for this employee and auto-start if no task is running
    let autoStartedTask = null;
    const activeTimer = await CraEntry.getActiveTimer(employeeId);
    if (!activeTimer) {
      const nextPending = await CraEntry.getNextPendingTask(employeeId);
      if (nextPending) {
        // Automatically start the next task
        autoStartedTask = await CraEntry.start(nextPending.id);

        // Fetch employee details
        const empRes = await db.query(
          "SELECT first_name, last_name FROM employees WHERE id = $1",
          [employeeId]
        );
        const emp = empRes.rows[0];
        const employeeName = emp ? `${emp.first_name} ${emp.last_name}` : "Employee";

        // Broadcast cra_auto_started event
        try {
          const io = socketUtil.getIo();
          io.emit("cra_auto_started", {
            craId: autoStartedTask.id,
            employeeId: employeeId,
            employeeName: employeeName,
            ticketReference: autoStartedTask.ticket_reference,
            startTime: autoStartedTask.start_time
          });
        } catch (err) {
          console.error("Failed to broadcast cra_auto_started event:", err.message);
        }
      }
    }

    res.json({
      success: true,
      message: autoStartedTask
        ? "Activity approved and next pending task started automatically!"
        : "Activity entry approved",
      data: updated,
      autoStartedTask
    });
  } catch (error) {
    console.error("Error in approveEntry:", error);
    res.status(500).json({ success: false, message: "Failed to approve activity entry" });
  }
};

/**
 * PUT /api/cra/:id/reject
 */
const rejectEntry = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await CraEntry.getById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Activity entry not found" });
    }
    if (!['PENDING_APPROVAL', 'COMPLETED'].includes(existing.status)) {
      return res.status(400).json({ success: false, message: "Only activities pending approval can be rejected" });
    }

    const updated = await CraEntry.updateStatus(id, 'REJECTED');
    res.json({ success: true, message: "Activity entry rejected", data: updated });
  } catch (error) {
    console.error("Error in rejectEntry:", error);
    res.status(500).json({ success: false, message: "Failed to reject activity entry" });
  }
};

/**
 * GET /api/cra/stats
 */
const getStats = async (req, res) => {
  try {
    if (req.user.role === 'employee') {
      const employeeId = req.user.employee_id;
      if (!employeeId) {
        return res.json({ success: true, data: { total: 0, pending_start: 0, in_progress: 0, completed: 0, approved: 0, rejected: 0 } });
      }
      const stats = await CraEntry.getStatsByEmployee(employeeId);
      return res.json({ success: true, data: stats });
    }

    const stats = await CraEntry.getTeamStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error("Error in getStats:", error);
    res.status(500).json({ success: false, message: "Failed to fetch CRA statistics" });
  }
};

/**
 * GET /api/cra/live
 * Returns live CRA data for the monitoring dashboard (manager only).
 * Only returns currently active (IN_PROGRESS) tasks.
 */
const getLiveActivities = async (req, res) => {
  try {
    const activeResult = await db.query(`
      SELECT
        cra_entries.*,
        CONCAT(employees.first_name, ' ', employees.last_name) AS employee_name,
        employees.matricule
      FROM cra_entries
      JOIN employees ON cra_entries.employee_id = employees.id
      WHERE cra_entries.status = 'IN_PROGRESS'
      ORDER BY cra_entries.start_time DESC
    `);

    res.json({
      success: true,
      data: activeResult.rows,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error in getLiveActivities:", error);
    res.status(500).json({ success: false, message: "Failed to fetch live CRA data" });
  }
};
/**
 * GET /api/cra/monthly-stats
 * Returns monthly hours, days, and productivity stats.
 */
const getMonthlyStats = async (req, res) => {
  try {
    if (req.user.role === 'employee') {
      const employeeId = req.user.employee_id;
      if (!employeeId) {
        return res.json({ success: true, data: { total_hours_month: 0, total_days_month: 0, completed_this_week: 0, avg_duration_minutes: 0 } });
      }
      const stats = await CraEntry.getMonthlyStatsByEmployee(employeeId);
      return res.json({ success: true, data: stats });
    }

    const stats = await CraEntry.getMonthlyTeamStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error("Error in getMonthlyStats:", error);
    res.status(500).json({ success: false, message: "Failed to fetch monthly statistics" });
  }
};

/**
 * GET /api/cra/control-center
 * Returns full real-time control center data for manager dashboard (stats + live feed).
 */
const getControlCenterData = async (req, res) => {
  try {
    const [stats, feed] = await Promise.all([
      CraEntry.getControlCenterStats(),
      CraEntry.getLiveFeed(25)
    ]);
    res.json({
      success: true,
      data: {
        stats,
        feed
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error in getControlCenterData:", error);
    res.status(500).json({ success: false, message: "Failed to fetch control center data" });
  }
};

/**
 * GET /api/cra/employee-summary/:employeeId
 * Returns read-only monitor summary for an employee.
 */
const getEmployeeMonitorSummary = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const summary = await CraEntry.getEmployeeMonitorSummary(employeeId);
    res.json({ success: true, data: summary });
  } catch (error) {
    console.error("Error in getEmployeeMonitorSummary:", error);
    res.status(500).json({ success: false, message: "Failed to fetch employee summary" });
  }
};

module.exports = {
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
  getMonthlyStats,
  getLiveActivities,
  getControlCenterData,
  getEmployeeMonitorSummary
};

