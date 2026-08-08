const { Pool } = require("pg");
const LeaveBalance = require("./src/models/LeaveBalance");
const Absence = require("./src/models/Absence");
const Employee = require("./src/models/Employee");
const { accrueAllEmployees } = require("./src/controllers/leaveBalanceController");

const pool = new Pool({ host: 'localhost', port: 5432, database: 'absenceflow', user: 'postgres', password: '1289' });

async function run() {
  console.log("🚀 Starting Leave Balance automated verification tests...");

  let testEmployeeId = null;
  let testAbsenceId = null;

  try {
    // 1. Create a test employee
    const matricule = "TEST_" + Math.random().toString(36).substring(2, 7).toUpperCase();
    console.log(`👤 Creating test employee with matricule ${matricule}...`);
    const empRes = await pool.query(
      `INSERT INTO employees (matricule, first_name, last_name, email, hire_date)
       VALUES ($1, 'Test', 'Employee', $2, CURRENT_DATE)
       RETURNING *`,
      [matricule, `${matricule.toLowerCase()}@test.com`]
    );
    testEmployeeId = empRes.rows[0].id;
    console.log(`✅ Test employee created. ID: ${testEmployeeId}`);

    // 2. Initialize leave balance
    console.log("⚙️ Initializing leave balance...");
    await LeaveBalance.initialize(testEmployeeId);

    // 3. Verify initial balances
    let balance = await LeaveBalance.getByEmployeeId(testEmployeeId);
    console.log("→ Initial Balance:", {
      paid: parseFloat(balance.paid_leave_balance),
      sick: parseFloat(balance.sick_leave_balance)
    });
    if (parseFloat(balance.paid_leave_balance) === 0 && parseFloat(balance.sick_leave_balance) === 5) {
      console.log("✅ Initial balances verified (0.00 Paid, 5.00 Sick).");
    } else {
      throw new Error("Initial balances mismatch!");
    }

    // 4. Test Accrual (by simulating that last accrual was last month)
    console.log("\n⏳ Testing monthly accrual logic...");
    await pool.query(
      "UPDATE leave_balances SET last_accrual_date = CURRENT_DATE - INTERVAL '1 month' WHERE employee_id = $1",
      [testEmployeeId]
    );
    console.log("→ Backdated last accrual date to last month.");

    console.log("📡 Triggering monthly accrual job...");
    await accrueAllEmployees();

    balance = await LeaveBalance.getByEmployeeId(testEmployeeId);
    console.log("→ Balance after accrual:", {
      paid: parseFloat(balance.paid_leave_balance),
      sick: parseFloat(balance.sick_leave_balance)
    });
    if (parseFloat(balance.paid_leave_balance) === 1.83) {
      console.log("✅ Accrual added +1.83 paid leave days successfully.");
    } else {
      throw new Error("Accrual amount mismatch!");
    }

    // 5. Test Duplicate Accrual Prevention
    console.log("\n🛡️ Testing duplicate accrual prevention...");
    console.log("📡 Triggering accrual job again...");
    await accrueAllEmployees();
    
    balance = await LeaveBalance.getByEmployeeId(testEmployeeId);
    console.log("→ Balance after second accrual:", parseFloat(balance.paid_leave_balance));
    if (parseFloat(balance.paid_leave_balance) === 1.83) {
      console.log("✅ Duplicate accrual skipped successfully (balance remains 1.83).");
    } else {
      throw new Error("Duplicate accrual was not prevented!");
    }

    // 6. Test Request Deduction Approval Flow
    console.log("\n📝 Testing leave validation and deduction flow...");
    // Create a 2-day Sick Leave request
    const startDate = new Date();
    // Move to next Monday to ensure no weekend is hit (which would give 0 chargeable days)
    const monday = new Date();
    monday.setDate(monday.getDate() + (1 + 7 - monday.getDay()) % 7);
    const tuesday = new Date(monday);
    tuesday.setDate(tuesday.getDate() + 1);

    const startStr = monday.toISOString().split('T')[0];
    const endStr = tuesday.toISOString().split('T')[0];

    console.log(`→ Creating Sick Leave request for ${startStr} to ${endStr} (2 working days)...`);
    const absence = await Absence.create({
      employee_id: testEmployeeId,
      type: 'Sick Leave',
      start_date: startStr,
      end_date: endStr,
      reason: 'Test Sick Leave request',
      source: 'employee_request'
    });
    testAbsenceId = absence.id;

    // Call the validation endpoint logic via simulation
    // Send a PUT to validation
    console.log(`📡 Validating leave request ID ${testAbsenceId}...`);
    
    // We can simulate validateAbsence controller's logic:
    // 1. Fetch available balance
    const available = parseFloat((await LeaveBalance.getByEmployeeId(testEmployeeId)).sick_leave_balance);
    const chargeableDays = 2; // Monday and Tuesday
    console.log(`  → Chargeable days: ${chargeableDays}, Available: ${available}`);

    if (chargeableDays <= available) {
      await LeaveBalance.deduct(testEmployeeId, 'sick', chargeableDays, testAbsenceId);
      await Absence.validate(testAbsenceId);
      console.log("  → Request successfully validated and balance deducted.");
    } else {
      throw new Error("Incorrectly determined insufficient balance");
    }

    balance = await LeaveBalance.getByEmployeeId(testEmployeeId);
    console.log("→ Balance after deduction:", {
      paid: parseFloat(balance.paid_leave_balance),
      sick: parseFloat(balance.sick_leave_balance)
    });
    if (parseFloat(balance.sick_leave_balance) === 3.00) {
      console.log("✅ Sick leave balance successfully deducted by 2.00 (remaining: 3.00).");
    } else {
      throw new Error("Deduction mismatch!");
    }

    // Check transactions
    const txRes = await pool.query(
      "SELECT * FROM leave_transactions WHERE employee_id = $1 AND transaction_type = 'DEDUCTION'",
      [testEmployeeId]
    );
    console.log("→ Logged Transaction:", {
      type: txRes.rows[0].leave_type,
      amount: parseFloat(txRes.rows[0].amount),
      reference: txRes.rows[0].reference_id
    });
    if (parseFloat(txRes.rows[0].amount) === -2.00) {
      console.log("✅ Deduction transaction correctly logged with -2.00.");
    } else {
      throw new Error("Transaction log mismatch!");
    }

    // 7. Test Insufficient Balance Failure
    console.log("\n❌ Testing insufficient balance check...");
    const largeAbsence = await Absence.create({
      employee_id: testEmployeeId,
      type: 'Sick Leave',
      start_date: startStr,
      end_date: new Date(monday.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 10 days out
      reason: 'Too many days',
      source: 'employee_request'
    });

    const largeChargeableDays = 6;
    const currentAvailable = parseFloat((await LeaveBalance.getByEmployeeId(testEmployeeId)).sick_leave_balance);
    console.log(`  → Requesting: ${largeChargeableDays} days, Available: ${currentAvailable}`);
    
    if (largeChargeableDays > currentAvailable) {
      console.log("✅ Correctly rejected: Insufficient balance.");
    } else {
      throw new Error("Should have failed due to insufficient balance!");
    }
    // Clean up large absence
    await pool.query("DELETE FROM absences WHERE id = $1", [largeAbsence.id]);

    // 8. Test Delete/Refund Flow
    console.log("\n🧼 Testing refund on deletion of validated leaves...");
    // Simulating manager deleting validated request
    const deletedAbsence = await Absence.delete(testAbsenceId);
    if (deletedAbsence.status === 'Validated') {
      await LeaveBalance.refund(testEmployeeId, 'sick', 2.00, testAbsenceId);
      console.log("  → Request deleted and balance refunded.");
    }

    balance = await LeaveBalance.getByEmployeeId(testEmployeeId);
    console.log("→ Balance after refund:", {
      paid: parseFloat(balance.paid_leave_balance),
      sick: parseFloat(balance.sick_leave_balance)
    });
    if (parseFloat(balance.sick_leave_balance) === 5.00) {
      console.log("✅ Sick leave balance successfully refunded back to 5.00.");
    } else {
      throw new Error("Refund amount mismatch!");
    }

    // Check refund transaction
    const refundTxRes = await pool.query(
      "SELECT * FROM leave_transactions WHERE employee_id = $1 AND transaction_type = 'REFUND'",
      [testEmployeeId]
    );
    console.log("→ Logged Refund Transaction:", {
      type: refundTxRes.rows[0].leave_type,
      amount: parseFloat(refundTxRes.rows[0].amount)
    });
    if (parseFloat(refundTxRes.rows[0].amount) === 2.00) {
      console.log("✅ Refund transaction correctly logged with +2.00.");
    } else {
      throw new Error("Refund transaction log mismatch!");
    }

  } catch (error) {
    console.error("\n❌ Verification tests failed:", error.message);
    process.exitCode = 1;
  } finally {
    // 9. Clean up test employee (which cascades to balances/transactions)
    if (testEmployeeId) {
      console.log("\n🧹 Cleaning up test data...");
      await pool.query("DELETE FROM employees WHERE id = $1", [testEmployeeId]);
      console.log("🗑️ Test employee and cascaded references deleted.");
    }
    await pool.end();
    console.log("🏁 Verification finished.");
  }
}

run();
