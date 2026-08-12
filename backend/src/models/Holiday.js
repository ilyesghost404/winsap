const db = require("../config/database");

class Holiday {
  static async getAll(params = {}) {
    const { page, limit, search = '', year } = params;
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 100;
    const offset = (pageNum - 1) * limitNum;

    let baseQuery = "FROM holidays";
    let whereConditions = [];
    const queryParams = [];
    let paramIndex = 1;

    if (search) {
      whereConditions.push(`(name ILIKE $${paramIndex} OR description ILIKE $${paramIndex} OR type ILIKE $${paramIndex})`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    if (year) {
      whereConditions.push(`(EXTRACT(YEAR FROM holiday_date) = $${paramIndex} OR EXTRACT(YEAR FROM COALESCE(end_date, holiday_date)) = $${paramIndex})`);
      queryParams.push(parseInt(year, 10));
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? ` WHERE ${whereConditions.join(' AND ')}` : '';

    const countQuery = `SELECT COUNT(*) ${baseQuery}${whereClause}`;
    const dataQuery = `SELECT id, holiday_date, COALESCE(end_date, holiday_date) AS end_date, name, type, recurring, description, color, created_at ${baseQuery}${whereClause} ORDER BY holiday_date ASC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;

    const countResult = await db.query(countQuery, queryParams);
    const dataResult = await db.query(dataQuery, [...queryParams, limitNum, offset]);

    return {
      data: dataResult.rows,
      total: parseInt(countResult.rows[0].count, 10),
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(parseInt(countResult.rows[0].count, 10) / limitNum) || 1
    };
  }

  static async getById(id) {
    const result = await db.query("SELECT id, holiday_date, COALESCE(end_date, holiday_date) AS end_date, name, type, recurring, description, color, created_at FROM holidays WHERE id = $1", [id]);
    return result.rows[0];
  }

  static async create(holidayData) {
    const { holiday_date, start_date, end_date, name, type, recurring, description, color } = holidayData;
    const start = start_date || holiday_date;
    const end = end_date || start;
    const result = await db.query(
      "INSERT INTO holidays (holiday_date, end_date, name, type, recurring, description, color) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *, COALESCE(end_date, holiday_date) AS end_date",
      [start, end, name, type || 'National', recurring || false, description || null, color || null]
    );
    return result.rows[0];
  }

  static async update(id, holidayData) {
    const { holiday_date, start_date, end_date, name, type, recurring, description, color } = holidayData;
    const start = start_date || holiday_date;
    const end = end_date || start;
    const result = await db.query(
      "UPDATE holidays SET holiday_date = $1, end_date = $2, name = $3, type = $4, recurring = $5, description = $6, color = $7 WHERE id = $8 RETURNING *, COALESCE(end_date, holiday_date) AS end_date",
      [start, end, name, type || 'National', recurring || false, description || null, color || null, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await db.query(
      "DELETE FROM holidays WHERE id = $1 RETURNING *",
      [id]
    );
    return result.rows[0];
  }
}

module.exports = Holiday;
