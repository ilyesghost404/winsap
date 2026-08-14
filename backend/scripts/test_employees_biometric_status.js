require('dotenv').config();
const Employee = require('../src/models/Employee');

async function testEmployeesBiometricStatus() {
  console.log("==========================================");
  console.log("  Testing Employee Biometric Status Query ");
  console.log("==========================================");

  const result = await Employee.getAll({ limit: 100 });
  const employees = result.data;

  console.log(`Retrieved ${employees.length} employee records from database:\n`);

  let countEnrolled = 0;
  let countNotEnrolled = 0;

  employees.forEach(emp => {
    console.log(`- Employee ID ${emp.id} (${emp.first_name} ${emp.last_name}):`);
    console.log(`  Matricule: ${emp.matricule}`);
    console.log(`  Face Profile ID: ${emp.face_profile_id || 'None'}`);
    console.log(`  Face Status: ${emp.face_status || 'N/A'}`);
    console.log(`  Is Face Enrolled: ${emp.is_face_enrolled}`);
    console.log(`  Biometric Status: ${emp.biometric_status}`);
    console.log("------------------------------------------");

    if (emp.is_face_enrolled) countEnrolled++;
    else countNotEnrolled++;
  });

  console.log(`\nSummary: ${countEnrolled} Enrolled, ${countNotEnrolled} Not Enrolled.`);

  // Verify known enrolled employees (IDs 4 and 39)
  const emp4 = employees.find(e => e.id === 4);
  const emp39 = employees.find(e => e.id === 39);

  if (emp4 && (!emp4.is_face_enrolled || emp4.biometric_status !== 'Enrolled')) {
    throw new Error("Employee ID 4 should be Enrolled!");
  }

  if (emp39 && (!emp39.is_face_enrolled || emp39.biometric_status !== 'Enrolled')) {
    throw new Error("Employee ID 39 should be Enrolled!");
  }

  console.log("\n==========================================");
  console.log(" ✅ BIOMETRIC STATUS DETECTION TEST PASSED!");
  console.log("==========================================");
  process.exit(0);
}

testEmployeesBiometricStatus().catch(err => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
