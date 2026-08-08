const db = require("../config/database");

class LeaveBalance {
  static async getByEmployeeId(employeeId) {
    const result = await db.query(
      "SELECT * FROM leave_balances WHERE employee_id = $1",
      [employeeId]
    );
    return result.rows[0];
  }

  static async initialize(employeeId) {
    const result = await db.query(
      `INSERT INTO leave_balances (employee_id, paid_leave_balance, sick_leave_balance, last_accrual_date)
       VALUES ($1, 0.00, 5.00, CURRENT_DATE)
       ON CONFLICT (employee_id) DO NOTHING
       RETURNING *`,
      [employeeId]
    );
    return result.rows[0];
  }

  static async deduct(employeeId, type, amount, referenceId) {
    const client = await db.connect();
    try {
      await client.query("BEGIN");

      // Verify leave balance and get details
      const balRes = await client.query(
        "SELECT paid_leave_balance, sick_leave_balance FROM leave_balances WHERE employee_id = $1 FOR UPDATE",
        [employeeId]
      );
      const balance = balRes.rows[0];
      if (!balance) {
        throw new Error("Leave balance record not found for employee");
      }

      let query = "";
      if (type === "paid") {
        if (parseFloat(balance.paid_leave_balance) < parseFloat(amount)) {
          throw new Error("Insufficient leave balance");
        }
        query = "UPDATE leave_balances SET paid_leave_balance = paid_leave_balance - $1 WHERE employee_id = $2 RETURNING *";
      } else if (type === "sick") {
        if (parseFloat(balance.sick_leave_balance) < parseFloat(amount)) {
          throw new Error("Insufficient leave balance");
        }
        query = "UPDATE leave_balances SET sick_leave_balance = sick_leave_balance - $1 WHERE employee_id = $2 RETURNING *";
      } else {
        throw new Error("Invalid leave type for deduction");
      }

      const updateRes = await client.query(query, [amount, employeeId]);
      
      // Log transaction
      await client.query(
        `INSERT INTO leave_transactions (employee_id, leave_type, amount, transaction_type, reference_id)
         VALUES ($1, $2, $3, 'DEDUCTION', $4)`,
        [employeeId, type, -amount, referenceId]
      );

      await client.query("COMMIT");
      return updateRes.rows[0];
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  static async refund(employeeId, type, amount, referenceId) {
    const client = await db.connect();
    try {
      await client.query("BEGIN");

      let query = "";
      if (type === "paid") {
        query = "UPDATE leave_balances SET paid_leave_balance = paid_leave_balance + $1 WHERE employee_id = $2 RETURNING *";
      } else if (type === "sick") {
        query = "UPDATE leave_balances SET sick_leave_balance = sick_leave_balance + $1 WHERE employee_id = $2 RETURNING *";
      } else {
        throw new Error("Invalid leave type for refund");
      }

      const updateRes = await client.query(query, [amount, employeeId]);
      
      // Log transaction
      await client.query(
        `INSERT INTO leave_transactions (employee_id, leave_type, amount, transaction_type, reference_id)
         VALUES ($1, $2, $3, 'REFUND', $4)`,
        [employeeId, type, amount, referenceId]
      );

      await client.query("COMMIT");
      return updateRes.rows[0];
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  static async accrue(employeeId, amount) {
    const client = await db.connect();
    try {
      await client.query("BEGIN");

      // Verify the employee has not already accrued leave for the current month
      const balRes = await client.query(
        `SELECT last_accrual_date FROM leave_balances WHERE employee_id = $1 FOR UPDATE`,
        [employeeId]
      );
      
      if (balRes.rows.length === 0) {
        throw new Error("Leave balance record not found for employee");
      }

      const lastAccrual = balRes.rows[0].last_accrual_date;
      const today = new Date();
      if (lastAccrual) {
        const lastAccrualDate = new Date(lastAccrual);
        if (
          lastAccrualDate.getMonth() === today.getMonth() &&
          lastAccrualDate.getFullYear() === today.getFullYear()
        ) {
          // Already accrued for this month, skip
          await client.query("COMMIT");
          return null;
        }
      }

      const updateRes = await client.query(
        `UPDATE leave_balances 
         SET paid_leave_balance = paid_leave_balance + $1, 
             last_accrual_date = CURRENT_DATE 
         WHERE employee_id = $2 
         RETURNING *`,
        [amount, employeeId]
      );

      // Log transaction
      await client.query(
        `INSERT INTO leave_transactions (employee_id, leave_type, amount, transaction_type)
         VALUES ($1, 'paid', $2, 'ACCRUAL')`,
        [employeeId, amount]
      );

      await client.query("COMMIT");
      return updateRes.rows[0];
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = LeaveBalance;
