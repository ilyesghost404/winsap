const Holiday = require("../models/Holiday");

const getHolidays = async (req, res) => {
  try {
    const { page, limit, search, year } = req.query;
    const result = await Holiday.getAll({
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : (page ? 10 : 100),
        search: search || '',
        year: year ? parseInt(year, 10) : undefined
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
  try {
    const { name, startDate, start_date, endDate, end_date, holiday_date, date, type, recurring, description, color } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Holiday name is required"
      });
    }

    let startStr = startDate || start_date || holiday_date || date;
    let endStr = endDate || end_date || startStr;

    if (!startStr) {
      return res.status(400).json({
        success: false,
        message: "Start date is required"
      });
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
        message: "End Date cannot be earlier than Start Date."
      });
    }

    const created = await Holiday.create({
      holiday_date: startStr,
      end_date: endStr,
      name,
      type,
      recurring,
      description,
      color
    });

    res.status(201).json({
      success: true,
      message: "Holiday created successfully.",
      data: created
    });
  } catch (error) {
    console.error("Error creating holiday:", error);
    res.status(500).json({ success: false, message: "Failed to create holiday" });
  }
};

const updateHoliday = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, startDate, start_date, endDate, end_date, holiday_date, date } = req.body;

    let startStr = startDate || start_date || holiday_date || date;
    let endStr = endDate || end_date || startStr;

    if (!startStr || !name) {
      return res.status(400).json({
        success: false,
        message: "Holiday date and name are required"
      });
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
        message: "End Date cannot be earlier than Start Date."
      });
    }

    const holiday = await Holiday.update(id, {
      ...req.body,
      holiday_date: startStr,
      end_date: endStr
    });

    if (!holiday) {
      return res.status(404).json({ success: false, message: "Holiday not found" });
    }

    res.json({ success: true, data: holiday });
  } catch (error) {
    console.error("Error updating holiday:", error);
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
