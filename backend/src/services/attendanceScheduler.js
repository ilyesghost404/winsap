const cron = require('node-cron');
const db = require('../config/database');
const emailService = require('../utils/emailService');

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

      // Step 4: Send Daily Attendance Digest to users with report_notifications enabled
      try {
        const usersToNotify = await db.query(`
          SELECT u.id, u.email, u.username, us.report_notifications, us.email_notifications
          FROM users u
          JOIN user_settings us ON us.user_id = u.id
          WHERE us.report_notifications = true AND u.email IS NOT NULL
        `);
        const todayStr = new Date().toISOString().split('T')[0];
        const presentCount = attendedEmployeeIds.size;
        for (const u of usersToNotify.rows) {
          emailService.sendAttendanceDigestEmail(u.email, u.username, todayStr, {
            status: 'Daily Check-in Completed',
            presentCount: presentCount
          }).catch(err => console.warn('⚠️ Attendance digest email warning:', err.message));
        }
      } catch (digestErr) {
        console.warn('⚠️ Error sending daily attendance digest:', digestErr.message);
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

const runHolidayReminderScheduler = () => {
  cron.schedule('0 9 * * *', async () => {
    try {
      const upcomingHolidays = await db.query(
        `SELECT name, date FROM holidays WHERE date = CURRENT_DATE + INTERVAL '1 day' OR date = CURRENT_DATE + INTERVAL '2 days'`
      );
      if (upcomingHolidays.rows.length === 0) return;

      const usersToNotify = await db.query(`
        SELECT u.id, u.email, u.username, us.holiday_notifications, us.email_notifications
        FROM users u
        LEFT JOIN user_settings us ON us.user_id = u.id
        WHERE (us.holiday_notifications IS NULL OR us.holiday_notifications = true)
          AND u.email IS NOT NULL
      `);

      for (const h of upcomingHolidays.rows) {
        const hDateStr = new Date(h.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        for (const u of usersToNotify.rows) {
          emailService.sendHolidayReminderEmail(u.email, u.username, h.name, hDateStr)
            .catch(err => console.warn('⚠️ Holiday reminder email warning:', err.message));
        }
      }
    } catch (err) {
      console.warn('⚠️ Error running holiday reminder scheduler:', err.message);
    }
  });

  console.log('Holiday reminder scheduler registered (runs daily at 09:00)');
};

module.exports = { runAttendanceScheduler, runLeaveBalanceScheduler, runHolidayReminderScheduler };

