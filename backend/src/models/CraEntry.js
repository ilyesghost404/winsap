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
   * Format row to include started_at and ended_at aliases.
   */
  static formatRow(row) {
    if (!row) return null;
    return {
      ...row,
      started_at: row.start_time || null,
      ended_at: row.end_time || null
    };
  }

  /**
   * Create and start a CRA entry immediately (IN_PROGRESS).
   */
  static async createAndStart(data) {
    const { employee_id, ticket_reference, description, priority = 0 } = data;
    const result = await db.query(`
      INSERT INTO cra_entries (employee_id, ticket_reference, description, priority, start_time, end_time, duration_minutes, status)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, NULL, NULL, 'IN_PROGRESS')
      RETURNING *
    `, [employee_id, ticket_reference, description, priority]);
    return CraEntry.formatRow(result.rows[0]);
  }

  /**
   * Start an existing PENDING_START entry.
   */
  static async start(id) {
    const result = await db.query(`
      UPDATE cra_entries
      SET start_time = CURRENT_TIMESTAMP, end_time = NULL, duration_minutes = NULL, status = 'IN_PROGRESS'
      WHERE id = $1 AND status = 'PENDING_START'
      RETURNING *
    `, [id]);
    return CraEntry.formatRow(result.rows[0]);
  }

  /**
   * End a running CRA entry -> transitions to COMPLETED.
   */
  static async end(id, endTime, durationMinutes) {
    const result = await db.query(`
      UPDATE cra_entries
      SET end_time = $1, duration_minutes = $2, status = 'COMPLETED'
      WHERE id = $3 AND status = 'IN_PROGRESS'
      RETURNING *
    `, [endTime, durationMinutes, id]);
    return CraEntry.formatRow(result.rows[0]);
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
   * Get monthly stats for an employee (hours, days, weekly completions, avg time).
   */
  static async getMonthlyStatsByEmployee(employeeId) {
    const result = await db.query(`
      SELECT
        COALESCE(SUM(duration_minutes) FILTER (WHERE status IN ('COMPLETED', 'PENDING_APPROVAL', 'APPROVED')
          AND EXTRACT(MONTH FROM end_time) = EXTRACT(MONTH FROM CURRENT_DATE)
          AND EXTRACT(YEAR FROM end_time) = EXTRACT(YEAR FROM CURRENT_DATE)), 0) AS total_minutes_month,
        COALESCE(COUNT(DISTINCT DATE(start_time)) FILTER (WHERE status IN ('COMPLETED', 'PENDING_APPROVAL', 'APPROVED', 'IN_PROGRESS')
          AND EXTRACT(MONTH FROM start_time) = EXTRACT(MONTH FROM CURRENT_DATE)
          AND EXTRACT(YEAR FROM start_time) = EXTRACT(YEAR FROM CURRENT_DATE)), 0) AS total_days_month,
        COALESCE(COUNT(*) FILTER (WHERE status IN ('COMPLETED', 'PENDING_APPROVAL', 'APPROVED')
          AND end_time >= DATE_TRUNC('week', CURRENT_DATE)), 0) AS completed_this_week,
        COALESCE(AVG(duration_minutes) FILTER (WHERE status IN ('COMPLETED', 'PENDING_APPROVAL', 'APPROVED')
          AND duration_minutes > 0), 0) AS avg_duration_minutes
      FROM cra_entries
      WHERE employee_id = $1
    `, [employeeId]);
    const row = result.rows[0];
    const totalMinutes = parseInt(row.total_minutes_month) || 0;
    return {
      total_hours_month: parseFloat((totalMinutes / 60).toFixed(1)),
      total_days_month: parseInt(row.total_days_month) || 0,
      completed_this_week: parseInt(row.completed_this_week) || 0,
      avg_duration_minutes: Math.round(parseFloat(row.avg_duration_minutes) || 0)
    };
  }

  /**
   * Get monthly stats across all employees (manager view).
   */
  static async getMonthlyTeamStats() {
    const result = await db.query(`
      SELECT
        COALESCE(SUM(duration_minutes) FILTER (WHERE status IN ('COMPLETED', 'PENDING_APPROVAL', 'APPROVED')
          AND EXTRACT(MONTH FROM end_time) = EXTRACT(MONTH FROM CURRENT_DATE)
          AND EXTRACT(YEAR FROM end_time) = EXTRACT(YEAR FROM CURRENT_DATE)), 0) AS total_minutes_month,
        COALESCE(COUNT(*) FILTER (WHERE status IN ('COMPLETED', 'PENDING_APPROVAL', 'APPROVED')
          AND end_time >= CURRENT_DATE), 0) AS completed_today,
        COALESCE(COUNT(*) FILTER (WHERE status IN ('COMPLETED', 'PENDING_APPROVAL', 'APPROVED')
          AND end_time >= DATE_TRUNC('week', CURRENT_DATE)), 0) AS completed_this_week,
        COALESCE(AVG(duration_minutes) FILTER (WHERE status IN ('COMPLETED', 'PENDING_APPROVAL', 'APPROVED')
          AND duration_minutes > 0), 0) AS avg_duration_minutes,
        COUNT(DISTINCT employee_id) FILTER (WHERE status = 'IN_PROGRESS') AS active_employees
      FROM cra_entries
    `);
    const row = result.rows[0];
    const totalMinutes = parseInt(row.total_minutes_month) || 0;
    return {
      total_hours_month: parseFloat((totalMinutes / 60).toFixed(1)),
      completed_today: parseInt(row.completed_today) || 0,
      completed_this_week: parseInt(row.completed_this_week) || 0,
      avg_duration_minutes: Math.round(parseFloat(row.avg_duration_minutes) || 0),
      active_employees: parseInt(row.active_employees) || 0
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

  /**
   * Get Manager Control Center live stats (8 metrics).
   */
  static async getControlCenterStats() {
    const result = await db.query(`
      SELECT
        COUNT(DISTINCT employee_id) FILTER (WHERE status = 'IN_PROGRESS') AS employees_working_now,
        COUNT(*) FILTER (WHERE status = 'PENDING_START') AS tasks_in_queue,
        COUNT(*) FILTER (WHERE status = 'IN_PROGRESS') AS tasks_in_progress,
        COUNT(*) FILTER (WHERE status IN ('COMPLETED', 'PENDING_APPROVAL', 'APPROVED') AND DATE(end_time) = CURRENT_DATE) AS tasks_completed_today,
        COUNT(*) FILTER (WHERE status IN ('COMPLETED', 'PENDING_APPROVAL', 'APPROVED') AND end_time >= DATE_TRUNC('week', CURRENT_DATE)) AS tasks_completed_this_week,
        COALESCE(SUM(duration_minutes) FILTER (WHERE DATE(end_time) = CURRENT_DATE OR (status = 'IN_PROGRESS' AND DATE(start_time) = CURRENT_DATE)), 0) AS total_minutes_today,
        COALESCE(AVG(duration_minutes) FILTER (WHERE status IN ('COMPLETED', 'PENDING_APPROVAL', 'APPROVED') AND duration_minutes > 0), 0) AS avg_duration_minutes,
        COUNT(*) FILTER (WHERE status IN ('COMPLETED', 'APPROVED')) AS total_completed,
        COUNT(*) AS total_tasks
      FROM cra_entries
    `);
    const row = result.rows[0];
    const totalMinutesToday = parseInt(row.total_minutes_today) || 0;
    const totalCompleted = parseInt(row.total_completed) || 0;
    const totalTasks = parseInt(row.total_tasks) || 1;
    const teamProductivity = Math.min(100, Math.round((totalCompleted / Math.max(1, totalTasks)) * 100));

    return {
      employees_working_now: parseInt(row.employees_working_now) || 0,
      tasks_in_queue: parseInt(row.tasks_in_queue) || 0,
      tasks_in_progress: parseInt(row.tasks_in_progress) || 0,
      tasks_completed_today: parseInt(row.tasks_completed_today) || 0,
      tasks_completed_this_week: parseInt(row.tasks_completed_this_week) || 0,
      total_hours_today: parseFloat((totalMinutesToday / 60).toFixed(1)),
      avg_duration_minutes: Math.round(parseFloat(row.avg_duration_minutes) || 0),
      team_productivity: teamProductivity
    };
  }

  /**
   * Get Live Activity Feed events (newest first).
   */
  static async getLiveFeed(limit = 20) {
    const result = await db.query(`
      SELECT
        cra_entries.id,
        cra_entries.employee_id,
        cra_entries.ticket_reference,
        cra_entries.description,
        cra_entries.status,
        cra_entries.start_time,
        cra_entries.end_time,
        cra_entries.updated_at,
        CONCAT(employees.first_name, ' ', employees.last_name) AS employee_name
      FROM cra_entries
      JOIN employees ON cra_entries.employee_id = employees.id
      ORDER BY cra_entries.updated_at DESC
      LIMIT $1
    `, [limit]);
    return result.rows;
  }

  /**
   * Get read-only monitor summary profile for a single employee.
   */
  static async getEmployeeMonitorSummary(employeeId) {
    const [empRes, statsRes, tasksRes] = await Promise.all([
      db.query(`
        SELECT employees.*, departments.name AS department_name
        FROM employees
        LEFT JOIN departments ON employees.department_id = departments.id
        WHERE employees.id = $1
      `, [employeeId]),
      db.query(`
        SELECT
          COUNT(*) FILTER (WHERE status = 'IN_PROGRESS') AS is_working,
          COALESCE(SUM(duration_minutes) FILTER (WHERE DATE(end_time) = CURRENT_DATE), 0) AS minutes_today,
          COALESCE(SUM(duration_minutes) FILTER (WHERE end_time >= DATE_TRUNC('week', CURRENT_DATE)), 0) AS minutes_week,
          COALESCE(SUM(duration_minutes) FILTER (WHERE EXTRACT(MONTH FROM end_time) = EXTRACT(MONTH FROM CURRENT_DATE)), 0) AS minutes_month,
          COUNT(*) FILTER (WHERE status IN ('COMPLETED', 'PENDING_APPROVAL', 'APPROVED')) AS total_completed
        FROM cra_entries
        WHERE employee_id = $1
      `, [employeeId]),
      db.query(`
        SELECT * FROM cra_entries
        WHERE employee_id = $1
        ORDER BY created_at DESC
        LIMIT 15
      `, [employeeId])
    ]);

    const emp = empRes.rows[0] || {};
    const statsRow = statsRes.rows[0] || {};

    return {
      employee: emp,
      metrics: {
        is_working: parseInt(statsRow.is_working) > 0,
        hours_today: parseFloat(((parseInt(statsRow.minutes_today) || 0) / 60).toFixed(1)),
        hours_week: parseFloat(((parseInt(statsRow.minutes_week) || 0) / 60).toFixed(1)),
        hours_month: parseFloat(((parseInt(statsRow.minutes_month) || 0) / 60).toFixed(1)),
        total_completed: parseInt(statsRow.total_completed) || 0
      },
      recent_tasks: tasksRes.rows
    };
  }
}

module.exports = CraEntry;

