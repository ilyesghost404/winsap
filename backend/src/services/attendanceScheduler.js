const cron = require('node-cron');
const db = require('../config/database');

const runAttendanceScheduler = () => {
  // Run every working day at 17:30
  // cron syntax: second minute hour day month weekday
  // Weekday 1-5: Monday to Friday
  cron.schedule('30 17 * * 1-5', async () => {
    console.log('Running automatic attendance check...');
    
    try {
      // Step 1: Get all employees
      const employeesResult = await db.query('SELECT id FROM employees');
      const employees = employeesResult.rows;
      
      if (employees.length === 0) {
        console.log('No employees found');
        return;
      }

      // Step 2: Get today's attendance records
      const todayAttendanceResult = await db.query(
        'SELECT employee_id FROM attendance WHERE date = CURRENT_DATE'
      );
      const attendedEmployeeIds = new Set(
        todayAttendanceResult.rows.map(row => row.employee_id)
      );

      // Step 3: For employees without attendance today, mark as Absent and create absence
      for (const employee of employees) {
        if (!attendedEmployeeIds.has(employee.id)) {
          try {
            await db.query(
              `INSERT INTO attendance (employee_id, date, status) 
               VALUES ($1, CURRENT_DATE, 'Absent')
               ON CONFLICT (employee_id, date) DO NOTHING`,
              [employee.id]
            );

            // Create automatic absence record
            await db.query(
              `INSERT INTO absences (employee_id, type, start_date, end_date, reason, status, source)
               VALUES ($1, 'Other', CURRENT_DATE, CURRENT_DATE, 'Automatic absence - no check-in detected', 'Validated', 'automatic')
               ON CONFLICT DO NOTHING`,
              [employee.id]
            );

            console.log(`Marked employee ${employee.id} as Absent and created automatic absence for today`);
          } catch (error) {
            console.error(`Error processing employee ${employee.id}:`, error.message);
          }
        }
      }

      console.log('Automatic attendance check completed');
    } catch (error) {
      console.error('Error running attendance scheduler:', error);
    }
  });

  console.log('Attendance scheduler started (runs Mon-Fri at 17:30)');
};

const runLeaveBalanceScheduler = () => {
  const { accrueAllEmployees } = require("../controllers/leaveBalanceController");

  // Schedule monthly leave accrual at 00:00 on the 1st day of every month
  cron.schedule("0 0 1 * *", async () => {
    console.log("⏰ [Cron] Triggering monthly leave accrual...");
    await accrueAllEmployees();
  });

  // Also trigger accrual on startup to ensure current month is handled immediately
  // (It internally skips employees who have already accrued for the current month)
  setTimeout(async () => {
    console.log("🚀 [Startup] Checking and running current month's leave accrual...");
    await accrueAllEmployees();
  }, 2000);

  console.log("Leave balance accrual scheduler started (runs monthly on the 1st)");
};

module.exports = { runAttendanceScheduler, runLeaveBalanceScheduler };
