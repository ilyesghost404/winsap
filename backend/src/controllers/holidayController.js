const Holiday = require("../models/Holiday");

const getHolidays = async (req, res) => {
  try {
    const { page, limit, search } = req.query;
    const result = await Holiday.getAll({
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 10,
        search: search || ''
    });
    res.json({ success: true, ...result });
  } catch (error) {
    console.error("Error fetching holidays:", error);
    res.status(500).json({ success: false, message: "Failed to fetch holidays" });
  }
};

const getHolidayById = async (req, res) => {
  try {
    const { id } = req.params;
    const holiday = await Holiday.getById(id);

    if (!holiday) {
      return res.status(404).json({ success: false, message: "Holiday not found" });
    }

    res.json({ success: true, data: holiday });
  } catch (error) {
    console.error("Error fetching holiday:", error);
    res.status(500).json({ success: false, message: "Failed to fetch holiday" });
  }
};

const createHoliday = async (req, res) => {
  const db = require("../config/database");
  try {
    const { name, startDate, endDate, holiday_date, date, type, recurring, description, color } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Holiday name is required"
      });
    }

    let startStr = startDate;
    let endStr = endDate;

    // Fallback for single date formats
    if (!startStr || !endStr) {
      const singleDate = holiday_date || date;
      if (!singleDate) {
        return res.status(400).json({
          success: false,
          message: "Holiday date is required"
        });
      }
      startStr = singleDate;
      endStr = singleDate;
    }

    const start = new Date(startStr);
    const end = new Date(endStr);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid start date or end date format"
      });
    }

    if (start > end) {
      return res.status(400).json({
        success: false,
        message: "Start date cannot be after end date."
      });
    }

    // Generate dates range array
    const dates = [];
    const current = new Date(start);
    while (current <= end) {
      const y = current.getFullYear();
      const m = String(current.getMonth() + 1).padStart(2, '0');
      const d = String(current.getDate()).padStart(2, '0');
      dates.push(`${y}-${m}-${d}`);
      current.setDate(current.getDate() + 1);
    }

    // Insert all dates in a single database transaction
    await db.query("BEGIN");

    // Check for duplicates in DB first
    const placeholders = dates.map((_, i) => `$${i + 1}`).join(', ');
    const checkRes = await db.query(
      `SELECT holiday_date FROM holidays WHERE holiday_date IN (${placeholders})`,
      dates
    );

    if (checkRes.rows.length > 0) {
      await db.query("ROLLBACK");
      const rawDate = checkRes.rows[0].holiday_date;
      const existingDate = (rawDate instanceof Date)
        ? rawDate.toISOString().split('T')[0]
        : String(rawDate).split('T')[0];
      return res.status(400).json({
        success: false,
        message: `A holiday already exists on date: ${existingDate}`
      });
    }

    const insertedHolidays = [];

    for (const dStr of dates) {
      const res = await db.query(
        "INSERT INTO holidays (holiday_date, name, type, recurring, description, color) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
        [dStr, name, type || 'National', recurring || false, description || null, color || null]
      );
      insertedHolidays.push(res.rows[0]);
    }
    await db.query("COMMIT");

    res.status(201).json({
      success: true,
      message: `${insertedHolidays.length} holiday days created successfully.`,
      data: insertedHolidays
    });
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Error creating holiday:", error);
    if (error.code === '23505') {
      return res.status(400).json({ success: false, message: "A holiday already exists on this date" });
    }
    res.status(500).json({ success: false, message: "Failed to create holiday" });
  }
};

const updateHoliday = async (req, res) => {
  try {
    const { id } = req.params;
    const { holiday_date, name } = req.body;

    if (!holiday_date || !name) {
      return res.status(400).json({
        success: false,
        message: "Holiday date and name are required"
      });
    }

    const holiday = await Holiday.update(id, req.body);

    if (!holiday) {
      return res.status(404).json({ success: false, message: "Holiday not found" });
    }

    res.json({ success: true, data: holiday });
  } catch (error) {
    console.error("Error updating holiday:", error);
    if (error.code === '23505') {
      return res.status(400).json({ success: false, message: "A holiday already exists on this date" });
    }
    res.status(500).json({ success: false, message: "Failed to update holiday" });
  }
};

const deleteHoliday = async (req, res) => {
  try {
    const { id } = req.params;
    const holiday = await Holiday.delete(id);

    if (!holiday) {
      return res.status(404).json({ success: false, message: "Holiday not found" });
    }

    res.json({ success: true, data: holiday });
  } catch (error) {
    console.error("Error deleting holiday:", error);
    res.status(500).json({ success: false, message: "Failed to delete holiday" });
  }
};

module.exports = {
  getHolidays,
  getHolidayById,
  createHoliday,
  updateHoliday,
  deleteHoliday
};
