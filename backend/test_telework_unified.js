const { Pool } = require("pg");
const jwt = require("jsonwebtoken");
const db = require("./src/config/database");
const Absence = require("./src/models/Absence");
const LeaveBalance = require("./src/models/LeaveBalance");
require("dotenv").config();

const pool = new Pool({ host: 'localhost', port: 5432, database: 'absenceflow', user: 'postgres', password: '1289' });
const API_URL = 'http://127.0.0.1:5000/api';
const JWT_SECRET = process.env.JWT_SECRET || 'your-default-jwt-secret-key-change-it';

async function run() {
  console.log("🚀 Starting Unified Telework Leave Request integration tests...");

  const testEmployeeId = 4; // ilyes_benhmid
  let testAbsenceId = null;
  let employeeToken = null;

  try {
    // 1. Fetch user to sign JWT
    const empUserRes = await pool.query("SELECT * FROM users WHERE employee_id = $1", [testEmployeeId]);
    const empUser = empUserRes.rows[0];
    employeeToken = jwt.sign(
      { id: empUser.id, username: empUser.username, role: empUser.role, employee_id: empUser.employee_id },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // 2. Fetch initial leave balances
    const initialBalRes = await pool.query(
      "SELECT paid_leave_balance, sick_leave_balance FROM leave_balances WHERE employee_id = $1",
      [testEmployeeId]
    );
    const initialBalance = initialBalRes.rows[0] || { paid_leave_balance: 0.00, sick_leave_balance: 5.00 };
    console.log("📊 Initial Leave Balances:", {
      paid: parseFloat(initialBalance.paid_leave_balance),
      sick: parseFloat(initialBalance.sick_leave_balance)
    });

    // 3. Clear existing attendance & absences for test range
    const testDate = '2026-08-14';
    await pool.query("DELETE FROM absences WHERE employee_id = $1 AND start_date = $2", [testEmployeeId, testDate]);
    await pool.query("DELETE FROM attendance WHERE employee_id = $1 AND date = $2", [testEmployeeId, testDate]);
    console.log("🧹 Cleaned up existing data for test date 2026-08-14.");

    // 4. Create Telework Leave Request via API
    console.log("\n📥 Creating a 'Telework' request via API...");
    const createRes = await fetch(`${API_URL}/absences`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${employeeToken}`
      },
      body: JSON.stringify({
        type: "Telework",
        start_date: testDate,
        end_date: testDate,
        reason: "Working from home on API specs"
      })
    });
    
    const createData = await createRes.json();
    console.log("→ Status:", createRes.status);
    if (createRes.status === 201 && createData.success) {
      testAbsenceId = createData.data.id;
      console.log(`✅ Telework Leave Request created. ID: ${testAbsenceId}`);
    } else {
      throw new Error(`Failed to create request: ${JSON.stringify(createData)}`);
    }

    // 5. Verify overlap constraints
    console.log("\n🛡️ Testing overlap block for another request on the same day...");
    const overlapRes = await fetch(`${API_URL}/absences`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${employeeToken}`
      },
      body: JSON.stringify({
        type: "Vacation",
        start_date: testDate,
        end_date: testDate,
        reason: "Should fail"
      })
    });
    const overlapData = await overlapRes.json();
    console.log("→ Status:", overlapRes.status);
    if (overlapRes.status === 400 && !overlapData.success) {
      console.log("✅ Overlapping request correctly blocked.");
    } else {
      throw new Error("Overlapping request was not blocked!");
    }

    // 6. Validate/Approve the Telework absence
    console.log(`\n✏️ Approving Telework request ID ${testAbsenceId}...`);
    const validatedAbsence = await Absence.validate(testAbsenceId);
    console.log("→ Validation response status in DB:", validatedAbsence.status);

    // 7. Verify balances are UNCHANGED
    const postBalRes = await pool.query(
      "SELECT paid_leave_balance, sick_leave_balance FROM leave_balances WHERE employee_id = $1",
      [testEmployeeId]
    );
    const postBalance = postBalRes.rows[0];
    console.log("📊 Post-Approval Leave Balances:", {
      paid: parseFloat(postBalance.paid_leave_balance),
      sick: parseFloat(postBalance.sick_leave_balance)
    });
    if (
      parseFloat(postBalance.paid_leave_balance) === parseFloat(initialBalance.paid_leave_balance) &&
      parseFloat(postBalance.sick_leave_balance) === parseFloat(initialBalance.sick_leave_balance)
    ) {
      console.log("✅ Balance verification passed: leave balances remain completely unaffected.");
    } else {
      throw new Error("Leave balance was incorrectly modified!");
    }

    // 8. Test Automatic Check-In for Telework today (change request date to today for testing)
    console.log("\n🤖 Testing automatic check-in for Telework today...");
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    // Clean any existing attendance for today
    await pool.query("DELETE FROM attendance WHERE employee_id = $1 AND date = $2", [testEmployeeId, todayStr]);
    
    // Update our Telework request to today's date
    await pool.query(
      "UPDATE absences SET start_date = $1, end_date = $1 WHERE id = $2",
      [todayStr, testAbsenceId]
    );
    console.log("  → Shifted WFH request date to today.");

    // Trigger dashboard stats to run check-in
    console.log("  → Querying dashboard API to trigger check-in...");
    const dbRes = await fetch(`${API_URL}/dashboard`, {
      headers: { "Authorization": `Bearer ${employeeToken}` }
    });
    console.log("  → Dashboard response status:", dbRes.status);

    // Assert check-in record exists
    const attRes = await pool.query(
      "SELECT * FROM attendance WHERE employee_id = $1 AND date = $2",
      [testEmployeeId, todayStr]
    );
    if (attRes.rows.length === 1) {
      const attRecord = attRes.rows[0];
      console.log("  → Auto Check-In Record Created:", {
        status: attRecord.status,
        method: attRecord.verification_method,
        device: attRecord.device_information
      });
      if (attRecord.status === "Present" && attRecord.verification_method === "Telework") {
        console.log("✅ Automatic check-in for Telework leaves verified successfully.");
      } else {
        throw new Error("Incorrect attendance record fields!");
      }
    } else {
      throw new Error("No automatic check-in record was created!");
    }

    // 9. Cleanup
    console.log("\n🧹 Cleaning up test attendance and absence records...");
    await pool.query("DELETE FROM attendance WHERE employee_id = $1 AND date = $2", [testEmployeeId, todayStr]);
    await pool.query("DELETE FROM absences WHERE id = $1", [testAbsenceId]);
    console.log("🗑️ Test data cleared.");

  } catch (error) {
    console.error("\n❌ Test failed:", error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
    console.log("🏁 Telework Leave Request integration testing finished.");
  }
}

run();
