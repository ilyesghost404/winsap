const LeaveBalance = require("../models/LeaveBalance");
const db = require("../config/database");

const getMyBalance = async (req, res) => {
  try {
    const employeeId = req.user.employee_id;
    if (!employeeId) {
      return res.status(400).json({ success: false, message: "User is not linked to any employee profile" });
    }

    const balance = await LeaveBalance.getByEmployeeId(employeeId);
    if (!balance) {
      const newBalance = await LeaveBalance.initialize(employeeId);
      return res.json({
        success: true,
        data: {
          paidLeave: parseFloat(newBalance.paid_leave_balance),
          sickLeave: parseFloat(newBalance.sick_leave_balance)
        }
      });
    }

    res.json({
      success: true,
      data: {
        paidLeave: parseFloat(balance.paid_leave_balance),
        sickLeave: parseFloat(balance.sick_leave_balance)
      }
    });
  } catch (error) {
    console.error("Error in getMyBalance:", error);
    res.status(500).json({ success: false, message: "Failed to fetch leave balance" });
  }
};

const getEmployeeLeaveBalance = async (req, res) => {
  try {
    const { id } = req.params;
    const employeeId = parseInt(id, 10);

    // Security check: employee role can only view their own balance
    if (req.user.role === 'employee' && req.user.employee_id !== employeeId) {
      return res.status(403).json({ success: false, message: "Access forbidden: you can only view your own leave balance" });
    }

    const balance = await LeaveBalance.getByEmployeeId(employeeId);
    if (!balance) {
      const newBalance = await LeaveBalance.initialize(employeeId);
      return res.json({
        success: true,
        data: {
          paidLeave: parseFloat(newBalance.paid_leave_balance),
          sickLeave: parseFloat(newBalance.sick_leave_balance)
        }
      });
    }

    res.json({
      success: true,
      data: {
        paidLeave: parseFloat(balance.paid_leave_balance),
        sickLeave: parseFloat(balance.sick_leave_balance)
      }
    });
  } catch (error) {
    console.error("Error in getEmployeeLeaveBalance:", error);
    res.status(500).json({ success: false, message: "Failed to fetch employee leave balance" });
  }
};

// Automatic Monthly Accrual function
const accrueAllEmployees = async () => {
  try {
    console.log("⏳ Running monthly paid leave accrual job...");
    
    // Select all employees who are active (where user is active, or if they have no user account yet)
    const activeEmployeesRes = await db.query(`
      SELECT e.id FROM public.employees e
      LEFT JOIN public.users u ON e.id = u.employee_id
      WHERE u.is_active IS NULL OR u.is_active = true
    `);
    
    let count = 0;
    for (const emp of activeEmployeesRes.rows) {
      // First ensure the balance row is initialized
      await LeaveBalance.initialize(emp.id);
      
      // Accrue 1.83 paid leave days
      const res = await LeaveBalance.accrue(emp.id, 1.83);
      if (res) {
        count++;
      }
    }
    console.log(`✅ Paid leave accrual completed: processed ${count} employee balance increments.`);
    return count;
  } catch (err) {
    console.error("❌ Leave accrual job execution failed:", err);
  }
};

module.exports = {
  getMyBalance,
  getEmployeeLeaveBalance,
  accrueAllEmployees
};
