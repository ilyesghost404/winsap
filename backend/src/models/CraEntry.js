const db = require("../config/database");

class CraEntry {
  /**
   * Get all CRA entries (manager view) with pagination and filters.
   */
  static async getAll(params = {}) {
    const { page = 1, limit = 10, search = '', status, employeeId, month, year, startDate, endDate } = params;
    const offset = (page - 1) * limit;

    let baseQuery = `
      FROM cra_entries
      JOIN employees ON cra_entries.employee_id = employees.id
    `;

    const queryParams = [];
    const conditions = [];

    if (status) {
      queryParams.push(status);
      conditions.push(`cra_entries.status = $${queryParams.length}`);
    }

    if (employeeId) {
      queryParams.push(parseInt(employeeId));
      conditions.push(`cra_entries.employee_id = $${queryParams.length}`);
    }

    if (month && year) {
      queryParams.push(parseInt(year));
      queryParams.push(parseInt(month));
      conditions.push(`EXTRACT(YEAR FROM cra_entries.start_time) = $${queryParams.length - 1}`);
      conditions.push(`EXTRACT(MONTH FROM cra_entries.start_time) = $${queryParams.length}`);
    } else if (year) {
      queryParams.push(parseInt(year));
      conditions.push(`EXTRACT(YEAR FROM cra_entries.start_time) = $${queryParams.length}`);
    }

    if (startDate) {
      queryParams.push(startDate);
      conditions.push(`cra_entries.start_time >= $${queryParams.length}`);
    }

    if (endDate) {
      queryParams.push(`${endDate} 23:59:59`);
      conditions.push(`cra_entries.start_time <= $${queryParams.length}`);
    }

    if (search) {
      queryParams.push(`%${search}%`);
      const searchIdx = queryParams.length;
      conditions.push(`(
        employees.first_name ILIKE $${searchIdx}
        OR employees.last_name ILIKE $${searchIdx}
        OR employees.matricule ILIKE $${searchIdx}
        OR cra_entries.ticket_reference ILIKE $${searchIdx}
        OR cra_entries.description ILIKE $${searchIdx}
      )`);
    }

    const whereClause = conditions.length > 0 ? ` WHERE ${conditions.join(' AND ')}` : '';

    const countQuery = `SELECT COUNT(*) ${baseQuery} ${whereClause}`;
    const dataQuery = `
      SELECT
        cra_entries.*,
        CONCAT(employees.first_name, ' ', employees.last_name) AS employee_name,
        employees.matricule
      ${baseQuery}
      ${whereClause}
      ORDER BY cra_entries.created_at DESC
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `;

    const countResult = await db.query(countQuery, queryParams);
    const dataResult = await db.query(dataQuery, [...queryParams, limit, offset]);

    return {
      data: dataResult.rows,
      total: parseInt(countResult.rows[0].count, 10),
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(parseInt(countResult.rows[0].count, 10) / limit)
    };
  }

  /**
   * Get CRA entries for a specific employee (employee view) with pagination.
   */
  static async getByEmployeeId(employeeId, params = {}) {
    const { page = 1, limit = 10, status, month, year, startDate, endDate, search = '' } = params;
    const offset = (page - 1) * limit;

    const queryParams = [employeeId];
    const conditions = [`cra_entries.employee_id = $1`];

    if (status) {
      queryParams.push(status);
      conditions.push(`cra_entries.status = $${queryParams.length}`);
    }

    if (month && year) {
      queryParams.push(parseInt(year));
      queryParams.push(parseInt(month));
      conditions.push(`EXTRACT(YEAR FROM cra_entries.start_time) = $${queryParams.length - 1}`);
      conditions.push(`EXTRACT(MONTH FROM cra_entries.start_time) = $${queryParams.length}`);
    } else if (year) {
      queryParams.push(parseInt(year));
      conditions.push(`EXTRACT(YEAR FROM cra_entries.start_time) = $${queryParams.length}`);
    }

    if (startDate) {
      queryParams.push(startDate);
      conditions.push(`cra_entries.start_time >= $${queryParams.length}`);
    }

    if (endDate) {
      queryParams.push(`${endDate} 23:59:59`);
      conditions.push(`cra_entries.start_time <= $${queryParams.length}`);
    }

    if (search) {
      queryParams.push(`%${search}%`);
      const searchIdx = queryParams.length;
      conditions.push(`(
        cra_entries.ticket_reference ILIKE $${searchIdx}
        OR cra_entries.description ILIKE $${searchIdx}
      )`);
    }

    const whereClause = ` WHERE ${conditions.join(' AND ')}`;

    const countQuery = `SELECT COUNT(*) FROM cra_entries ${whereClause}`;
    const dataQuery = `
      SELECT cra_entries.*
      FROM cra_entries
      ${whereClause}
      ORDER BY cra_entries.created_at DESC
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `;

    const countResult = await db.query(countQuery, queryParams);
    const dataResult = await db.query(dataQuery, [...queryParams, limit, offset]);

    return {
      data: dataResult.rows,
      total: parseInt(countResult.rows[0].count, 10),
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(parseInt(countResult.rows[0].count, 10) / limit)
    };
  }

  /**
   * Get a single CRA entry by ID with employee name.
   */
  static async getById(id) {
    const result = await db.query(`
      SELECT
        cra_entries.*,
        CONCAT(employees.first_name, ' ', employees.last_name) AS employee_name,
        employees.matricule
      FROM cra_entries
      JOIN employees ON cra_entries.employee_id = employees.id
      WHERE cra_entries.id = $1
    `, [id]);
    return result.rows[0] || null;
  }

  /**
   * Get any active running timer (IN_PROGRESS status) for an employee.
   */
  static async getActiveTimer(employeeId) {
    const result = await db.query(`
      SELECT * FROM cra_entries 
      WHERE employee_id = $1 AND status = 'IN_PROGRESS'
      LIMIT 1
    `, [employeeId]);
    return result.rows[0] || null;
  }

  /**
   * Check if employee has any pending CRA waiting to start (PENDING_START status).
   * Returns a boolean without task details.
   */
  static async hasQueuedTask(employeeId) {
    const result = await db.query(`
      SELECT EXISTS (
        SELECT 1 FROM cra_entries
        WHERE employee_id = $1 AND status = 'PENDING_START'
      ) AS has_queued
    `, [employeeId]);
    return Boolean(result.rows[0]?.has_queued);
  }

  /**
   * Get the next PENDING_START activity queued for an employee.
   * Ordered by priority (DESC), then created_at (ASC).
   */
  static async getNextPendingTask(employeeId) {
    const result = await db.query(`
      SELECT * FROM cra_entries
      WHERE employee_id = $1 AND status = 'PENDING_START'
      ORDER BY priority DESC, created_at ASC, id ASC
      LIMIT 1
    `, [employeeId]);
    return result.rows[0] || null;
  }

  /**
   * Create a new CRA entry as PENDING_START (not yet started).
   */
  static async createPending(data) {
    const { employee_id, ticket_reference, description, priority = 0, source = 'manual' } = data;
    const result = await db.query(`
      INSERT INTO cra_entries (employee_id, ticket_reference, description, priority, status, source)
      VALUES ($1, $2, $3, $4, 'PENDING_START', $5)
      RETURNING *
    `, [employee_id, ticket_reference, description, priority, source]);
    return result.rows[0];
  }

  /**
   * Create and start a CRA entry immediately (IN_PROGRESS).
   */
  static async createAndStart(data) {
    const { employee_id, ticket_reference, description, priority = 0 } = data;
    const result = await db.query(`
      INSERT INTO cra_entries (employee_id, ticket_reference, description, priority, start_time, status)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, 'IN_PROGRESS')
      RETURNING *
    `, [employee_id, ticket_reference, description, priority]);
    return result.rows[0];
  }

  /**
   * Start an existing PENDING_START entry.
   */
  static async start(id) {
    const result = await db.query(`
      UPDATE cra_entries
      SET start_time = CURRENT_TIMESTAMP, status = 'IN_PROGRESS'
      WHERE id = $1 AND status = 'PENDING_START'
      RETURNING *
    `, [id]);
    return result.rows[0] || null;
  }

  /**
   * End a running CRA entry -> transitions to PENDING_APPROVAL.
   */
  static async end(id, endTime, durationMinutes) {
    const result = await db.query(`
      UPDATE cra_entries
      SET end_time = $1, duration_minutes = $2, status = 'PENDING_APPROVAL'
      WHERE id = $3 AND status = 'IN_PROGRESS'
      RETURNING *
    `, [endTime, durationMinutes, id]);
    return result.rows[0] || null;
  }

  /**
   * Update details of a PENDING_START entry.
   */
  static async updateDetails(id, data) {
    const { ticket_reference, description, priority } = data;
    let query = `
      UPDATE cra_entries
      SET ticket_reference = $1, description = $2
    `;
    const params = [ticket_reference, description];
    if (priority !== undefined) {
      params.push(priority);
      query += `, priority = $${params.length}`;
    }
    params.push(id);
    query += ` WHERE id = $${params.length} AND status = 'PENDING_START' RETURNING *`;
    const result = await db.query(query, params);
    return result.rows[0] || null;
  }

  /**
   * Delete a CRA entry (allowed for PENDING_START, IN_PROGRESS, PENDING_APPROVAL, COMPLETED status).
   */
  static async delete(id) {
    const result = await db.query("DELETE FROM cra_entries WHERE id = $1 RETURNING *", [id]);
    return result.rows[0] || null;
  }

  /**
   * Update status (APPROVE/REJECT).
   */
  static async updateStatus(id, status) {
    const result = await db.query(`
      UPDATE cra_entries SET status = $1 WHERE id = $2 RETURNING *
    `, [status, id]);
    return result.rows[0] || null;
  }

  /**
   * Get CRA stats for an employee.
   */
  static async getStatsByEmployee(employeeId) {
    const result = await db.query(`
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE status = 'PENDING_START') AS pending_start,
        COUNT(*) FILTER (WHERE status = 'IN_PROGRESS') AS in_progress,
        COUNT(*) FILTER (WHERE status IN ('PENDING_APPROVAL', 'COMPLETED')) AS completed,
        COUNT(*) FILTER (WHERE status = 'APPROVED') AS approved,
        COUNT(*) FILTER (WHERE status = 'REJECTED') AS rejected
      FROM cra_entries
      WHERE employee_id = $1
    `, [employeeId]);
    const row = result.rows[0];
    return {
      total: parseInt(row.total),
      pending_start: parseInt(row.pending_start),
      in_progress: parseInt(row.in_progress),
      completed: parseInt(row.completed),
      pending_approval: parseInt(row.completed),
      approved: parseInt(row.approved),
      rejected: parseInt(row.rejected)
    };
  }

  /**
   * Get CRA stats across all employees (manager dashboard).
   */
  static async getTeamStats() {
    const result = await db.query(`
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE status = 'PENDING_START') AS pending_start,
        COUNT(*) FILTER (WHERE status = 'IN_PROGRESS') AS in_progress,
        COUNT(*) FILTER (WHERE status IN ('PENDING_APPROVAL', 'COMPLETED')) AS completed,
        COUNT(*) FILTER (WHERE status = 'APPROVED') AS approved,
        COUNT(*) FILTER (WHERE status = 'REJECTED') AS rejected
      FROM cra_entries
    `);
    const row = result.rows[0];
    return {
      total: parseInt(row.total),
      pending_start: parseInt(row.pending_start),
      in_progress: parseInt(row.in_progress),
      completed: parseInt(row.completed),
      pending_approval: parseInt(row.completed),
      approved: parseInt(row.approved),
      rejected: parseInt(row.rejected)
    };
  }

  /**
   * Create a manual CRA entry with pre-calculated dates and durations.
   */
  static async createManual(data) {
    const { employee_id, ticket_reference, description, priority = 1, start_time, end_time, duration_minutes, status = 'PENDING_APPROVAL', source = 'manual' } = data;
    const result = await db.query(`
      INSERT INTO cra_entries (employee_id, ticket_reference, description, priority, start_time, end_time, duration_minutes, status, source)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [employee_id, ticket_reference, description, priority, start_time, end_time, duration_minutes, status, source]);
    return result.rows[0];
  }

  /**
   * Update a CRA entry manually including its status and custom durations.
   */
  static async updateManual(id, data) {
    const { ticket_reference, description, priority, start_time, end_time, duration_minutes, status } = data;
    const result = await db.query(`
      UPDATE cra_entries
      SET ticket_reference = $1,
          description = $2,
          priority = $3,
          start_time = $4,
          end_time = $5,
          duration_minutes = $6,
          status = COALESCE($7, status)
      WHERE id = $8
      RETURNING *
    `, [ticket_reference, description, priority, start_time, end_time, duration_minutes, status, id]);
    return result.rows[0] || null;
  }
}

module.exports = CraEntry;
