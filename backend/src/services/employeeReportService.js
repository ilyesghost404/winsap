const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");
const cron = require("node-cron");
const fs = require("fs");
const path = require("path");
const db = require("../config/database");

/**
 * Fetch yearly report data for a specific employee.
 *
 * @param {number} employeeId - Target employee ID
 * @param {number} year - Target calendar year
 * @returns {Promise<Object>} Formatted report data
 */
async function getReportData(employeeId, year) {
  // 1. Fetch employee details with department/position info
  const empResult = await db.query(`
    SELECT 
      e.*, 
      d.name AS department_name
    FROM employees e
    LEFT JOIN departments d ON e.department_id = d.id
    WHERE e.id = $1
  `, [employeeId]);

  const employee = empResult.rows[0];
  if (!employee) {
    throw new Error(`Employee with ID ${employeeId} not found.`);
  }

  // 2. Fetch approved tasks for this employee and year
  const tasksResult = await db.query(`
    SELECT * FROM cra_entries
    WHERE employee_id = $1 
      AND status = 'APPROVED'
      AND EXTRACT(YEAR FROM end_time) = $2
    ORDER BY end_time ASC
  `, [employeeId, year]);

  const tasks = tasksResult.rows;

  // 3. Compute stats
  let totalTasks = tasks.length;
  let totalMinutes = 0;
  const priorityCounts = { High: 0, Medium: 0, Low: 0 };
  
  const monthlyCounts = {
    January: 0, February: 0, March: 0, April: 0, May: 0, June: 0,
    July: 0, August: 0, September: 0, October: 0, November: 0, December: 0
  };

  const monthsList = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  tasks.forEach(t => {
    totalMinutes += t.duration_minutes || 0;
    
    // Priority
    if (t.priority === 2) priorityCounts.High++;
    else if (t.priority === 0) priorityCounts.Low++;
    else priorityCounts.Medium++;

    // Month
    if (t.end_time) {
      const monthIdx = new Date(t.end_time).getMonth();
      const monthName = monthsList[monthIdx];
      if (monthName) {
        monthlyCounts[monthName]++;
      }
    }
  });

  const totalHours = parseFloat((totalMinutes / 60).toFixed(2));

  return {
    employee: {
      id: employee.id,
      matricule: employee.matricule,
      fullName: `${employee.first_name} ${employee.last_name}`,
      email: employee.email_address || employee.email || "N/A",
      department: employee.department_name || "N/A",
      position: employee.position || "Staff",
    },
    year: parseInt(year, 10),
    generationDate: new Date().toISOString().split("T")[0],
    summary: {
      totalTasks,
      totalHours,
      priorityCounts,
      monthlyCounts
    },
    tasks: tasks.map(t => ({
      id: t.id,
      ticketReference: t.ticket_reference,
      description: t.description,
      priority: t.priority === 2 ? "High" : t.priority === 0 ? "Low" : "Medium",
      status: t.status,
      startTime: t.start_time,
      endTime: t.end_time,
      durationMinutes: t.duration_minutes || 0,
      durationHours: parseFloat(((t.duration_minutes || 0) / 60).toFixed(2)),
      validationDate: t.updated_at,
      source: t.source || "manual",
      comments: t.comments || ""
    }))
  };
}

/**
 * Generate Excel report workbook.
 *
 * @param {Object} reportData - Object returned by getReportData
 * @returns {ExcelJS.Workbook} ExcelJS workbook instance
 */
function generateExcelReport(reportData) {
  const workbook = new ExcelJS.Workbook();
  
  // Sheet 1: Summary Dashboard
  const summarySheet = workbook.addWorksheet("Summary Dashboard");
  summarySheet.views = [{ showGridLines: true }];

  // Title styling
  summarySheet.addRow(["AbsenceFlow - Employee Activity Summary"]);
  summarySheet.mergeCells("A1:D1");
  summarySheet.getCell("A1").font = { bold: true, size: 16, color: { argb: "1e3a8a" } };
  summarySheet.getRow(1).height = 30;

  summarySheet.addRow([]);

  // Info Box
  summarySheet.addRow(["Employee Name:", reportData.employee.fullName, "Report Year:", reportData.year]);
  summarySheet.addRow(["Employee ID:", reportData.employee.matricule, "Gen Date:", reportData.generationDate]);
  summarySheet.addRow(["Email:", reportData.employee.email, "Department:", reportData.employee.department]);
  summarySheet.addRow(["Position:", reportData.employee.position]);

  // Style Info Box
  for (let r = 3; r <= 6; r++) {
    const row = summarySheet.getRow(r);
    row.getCell(1).font = { bold: true, color: { argb: "475569" } };
    row.getCell(3).font = { bold: true, color: { argb: "475569" } };
  }

  summarySheet.addRow([]);
  summarySheet.addRow([]);

  // Stats Card Headers
  const statsStartRow = 9;
  summarySheet.addRow(["Metric", "Value"]);
  summarySheet.getRow(statsStartRow).getCell(1).font = { bold: true };
  summarySheet.getRow(statsStartRow).getCell(2).font = { bold: true };
  summarySheet.getRow(statsStartRow).getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "e2e8f0" } };
  summarySheet.getRow(statsStartRow).getCell(2).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "e2e8f0" } };

  summarySheet.addRow(["Total Tasks Completed", reportData.summary.totalTasks]);
  summarySheet.addRow(["Total Worked Hours", `${reportData.summary.totalHours} hrs`]);
  summarySheet.addRow(["High Priority Tasks", reportData.summary.priorityCounts.High]);
  summarySheet.addRow(["Medium Priority Tasks", reportData.summary.priorityCounts.Medium]);
  summarySheet.addRow(["Low Priority Tasks", reportData.summary.priorityCounts.Low]);

  summarySheet.addRow([]);
  summarySheet.addRow([]);

  // Monthly breakdown title
  const monthStartRow = 18;
  summarySheet.addRow(["Month", "Tasks Completed"]);
  summarySheet.getRow(monthStartRow).getCell(1).font = { bold: true };
  summarySheet.getRow(monthStartRow).getCell(2).font = { bold: true };
  summarySheet.getRow(monthStartRow).getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "e2e8f0" } };
  summarySheet.getRow(monthStartRow).getCell(2).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "e2e8f0" } };

  Object.entries(reportData.summary.monthlyCounts).forEach(([m, count]) => {
    summarySheet.addRow([m, count]);
  });

  // Autofit column widths
  summarySheet.columns.forEach(col => {
    col.width = 25;
  });

  // Sheet 2: Task Details
  const detailsSheet = workbook.addWorksheet("Task Details");
  detailsSheet.views = [{ showGridLines: true }];

  // Column Setup
  detailsSheet.columns = [
    { header: "Task ID", key: "id", width: 10 },
    { header: "Ticket Ref", key: "ticketReference", width: 15 },
    { header: "Description", key: "description", width: 40 },
    { header: "Priority", key: "priority", width: 12 },
    { header: "Status", key: "status", width: 15 },
    { header: "Start Date", key: "startTime", width: 22 },
    { header: "End Date", key: "endTime", width: 22 },
    { header: "Duration (hrs)", key: "durationHours", width: 15 },
    { header: "Validation Date", key: "validationDate", width: 22 },
    { header: "Source", key: "source", width: 12 },
    { header: "Comments", key: "comments", width: 25 }
  ];

  // Fill data
  reportData.tasks.forEach(t => {
    detailsSheet.addRow({
      id: t.id,
      ticketReference: t.ticketReference,
      description: t.description,
      priority: t.priority,
      status: t.status,
      startTime: t.startTime ? new Date(t.startTime).toLocaleString() : "N/A",
      endTime: t.endTime ? new Date(t.endTime).toLocaleString() : "N/A",
      durationHours: t.durationHours,
      validationDate: t.validationDate ? new Date(t.validationDate).toLocaleString() : "N/A",
      source: t.source,
      comments: t.comments
    });
  });

  // Style Header Row
  const headerRow = detailsSheet.getRow(1);
  headerRow.height = 25;
  headerRow.eachCell(cell => {
    cell.font = { bold: true, color: { argb: "ffffff" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "1e3a8a" }
    };
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });

  // Add auto filter
  detailsSheet.autoFilter = "A1:K1";

  return workbook;
}

/**
 * Generate PDF report document.
 *
 * @param {Object} reportData - Object returned by getReportData
 * @param {res} res - Express HTTP response object
 */
function generatePdfReport(reportData, res) {
  const doc = new PDFDocument({
    size: "A4",
    margin: 40,
    bufferPages: true
  });

  // Pipe to response
  doc.pipe(res);

  // Colors
  const primaryColor = "#1e3a8a"; // Navy
  const secondaryColor = "#475569"; // Slate
  const textDark = "#1e293b"; // Dark Gray
  const borderLight = "#cbd5e1"; // Muted Gray
  const cardBg = "#f8fafc"; // Off-white

  // 1. Header Decor
  doc.rect(0, 0, 595.28, 15).fill(primaryColor);

  // 2. Title Block
  doc.fillColor(primaryColor).fontSize(20).font("Helvetica-Bold").text("Annual Employee Activity Report", 40, 35);
  doc.fillColor(secondaryColor).fontSize(10).font("Helvetica").text("WinSAP AbsenceFlow Management System", 40, 58);
  doc.moveDown(1.5);

  // Horizontal separator
  doc.strokeColor(primaryColor).lineWidth(1.5).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
  doc.moveDown(1);

  // 3. Employee Info Grid (2-column layout)
  const infoY = doc.y;
  
  // Left Column
  doc.fillColor(secondaryColor).font("Helvetica-Bold").fontSize(9).text("EMPLOYEE INFORMATION", 40, infoY);
  doc.moveDown(0.4);
  doc.fillColor(textDark).font("Helvetica").fontSize(10);
  doc.text(`Full Name:  ${reportData.employee.fullName}`);
  doc.text(`Employee ID:  ${reportData.employee.matricule}`);
  doc.text(`Email Address:  ${reportData.employee.email}`);
  
  // Right Column
  doc.fillColor(secondaryColor).font("Helvetica-Bold").fontSize(9).text("REPORT METRICS", 300, infoY);
  doc.moveDown(0.4);
  doc.fillColor(textDark).font("Helvetica").fontSize(10);
  doc.text(`Report Year:  ${reportData.year}`, 300);
  doc.text(`Department:  ${reportData.employee.department}`, 300);
  doc.text(`Position:  ${reportData.employee.position}`, 300);
  doc.text(`Generation Date:  ${reportData.generationDate}`, 300);

  doc.moveDown(2);

  // 4. Statistics Cards (Boxes side-by-side)
  const cardsY = doc.y;
  const cardWidth = 160;
  const cardHeight = 60;
  const cardGap = 15;

  const cardData = [
    { label: "Tasks Completed", val: `${reportData.summary.totalTasks} Tasks` },
    { label: "Hours Worked", val: `${reportData.summary.totalHours} hrs` },
    { label: "High Priority", val: `${reportData.summary.priorityCounts.High} High` }
  ];

  cardData.forEach((card, idx) => {
    const x = 40 + idx * (cardWidth + cardGap);
    
    // Draw Box
    doc.roundedRect(x, cardsY, cardWidth, cardHeight, 8)
       .fillColor(cardBg)
       .fill()
       .roundedRect(x, cardsY, cardWidth, cardHeight, 8)
       .strokeColor(borderLight)
       .lineWidth(1)
       .stroke();

    // Box text
    doc.fillColor(secondaryColor).font("Helvetica").fontSize(8).text(card.label.toUpperCase(), x + 10, cardsY + 12);
    doc.fillColor(primaryColor).font("Helvetica-Bold").fontSize(16).text(card.val, x + 10, cardsY + 28);
  });

  doc.y = cardsY + cardHeight + 20;

  // 5. Monthly Distribution & Priorities Grid
  const gridY = doc.y;
  doc.fillColor(secondaryColor).font("Helvetica-Bold").fontSize(10).text("ACTIVITY SUMMARY", 40, gridY);
  doc.moveDown(0.5);

  // Priorities table
  doc.fillColor(textDark).font("Helvetica").fontSize(9);
  doc.text(`Low Priority Completed:  ${reportData.summary.priorityCounts.Low}`);
  doc.text(`Medium Priority Completed:  ${reportData.summary.priorityCounts.Medium}`);
  doc.text(`High Priority Completed:  ${reportData.summary.priorityCounts.High}`);

  doc.moveDown(1.5);

  // 6. Detailed Tasks List Header
  doc.fillColor(primaryColor).font("Helvetica-Bold").fontSize(11).text("COMPLETED TASK DETAILS", 40);
  doc.moveDown(0.5);

  // Table setup
  const tableHeaders = ["Ticket", "Description", "Priority", "Duration", "End Date"];
  const colWidths = [80, 210, 60, 60, 105];
  
  let drawY = doc.y;

  // Draw Header Row
  doc.rect(40, drawY, 515, 20).fillColor(primaryColor).fill();
  doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(9);
  
  let drawX = 45;
  tableHeaders.forEach((h, idx) => {
    doc.text(h, drawX, drawY + 5, { width: colWidths[idx] });
    drawX += colWidths[idx];
  });

  drawY += 20;

  // Draw Table Rows
  doc.font("Helvetica").fontSize(8).fillColor(textDark);
  
  reportData.tasks.forEach((task, index) => {
    // Page overflow safety
    if (drawY > 730) {
      doc.addPage();
      // Draw top header stripe
      doc.rect(0, 0, 595.28, 15).fill(primaryColor);
      drawY = 40;
      
      // Draw headers again
      doc.rect(40, drawY, 515, 20).fillColor(primaryColor).fill();
      doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(9);
      let tempX = 45;
      tableHeaders.forEach((h, idx) => {
        doc.text(h, tempX, drawY + 5, { width: colWidths[idx] });
        tempX += colWidths[idx];
      });
      drawY += 20;
      doc.font("Helvetica").fontSize(8).fillColor(textDark);
    }

    // Zebra striping
    if (index % 2 === 1) {
      doc.rect(40, drawY, 515, 20).fillColor(cardBg).fill();
    }

    // Row borders
    doc.rect(40, drawY, 515, 20).strokeColor("#e2e8f0").lineWidth(0.5).stroke();

    // Data texts
    doc.fillColor(textDark);
    doc.text(task.ticketReference, 45, drawY + 5, { width: colWidths[0] });
    doc.text(task.description, 45 + colWidths[0], drawY + 5, { width: colWidths[1] - 10, height: 12, ellipsis: true });
    doc.text(task.priority, 45 + colWidths[0] + colWidths[1], drawY + 5, { width: colWidths[2] });
    doc.text(`${task.durationHours} hrs`, 45 + colWidths[0] + colWidths[1] + colWidths[2], drawY + 5, { width: colWidths[3] });
    doc.text(task.endTime ? new Date(task.endTime).toLocaleDateString() : "N/A", 45 + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], drawY + 5, { width: colWidths[4] });

    drawY += 20;
  });

  // Footer & Page numbering
  const totalPages = doc.bufferedPageRange().count;
  for (let i = 0; i < totalPages; i++) {
    doc.switchToPage(i);
    doc.fillColor(secondaryColor).fontSize(8);
    doc.text(
      `Page ${i + 1} of ${totalPages}`,
      40,
      800,
      { align: "center", width: 515 }
    );
    doc.text(
      "AbsenceFlow Yearly Activity Report - Confidential",
      40,
      800,
      { align: "left" }
    );
  }

  doc.end();
}

/**
 * Background Scheduler to automatically generate previous year's employee reports
 * every January 1st at midnight.
 */
function startYearlyReportScheduler() {
  // Cron: Run 00:00 on January 1st (0 0 1 1 *)
  // For safety and demonstration, allow config overrides
  const cronExpr = process.env.YEARLY_REPORT_CRON || "0 0 1 1 *";
  
  console.log(`📊 Yearly Report Scheduler registered (cron: ${cronExpr})`);

  cron.schedule(cronExpr, async () => {
    const previousYear = new Date().getFullYear() - 1;
    console.log(`🔄 Generating automatic employee activity reports for year ${previousYear}...`);

    try {
      // Fetch all employees
      const empRes = await db.query("SELECT id, first_name, last_name FROM employees");
      const employees = empRes.rows;

      // Define destination directory
      const outputDir = path.join(__dirname, "../../generated_reports");
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      for (const emp of employees) {
        try {
          const reportData = await getReportData(emp.id, previousYear);
          
          // Only generate if employee has completed tasks in the previous year
          if (reportData.summary.totalTasks > 0) {
            const fileName = `Employee_Report_${emp.first_name}_${previousYear}.pdf`;
            const filePath = path.join(outputDir, fileName);
            
            const writeStream = fs.createWriteStream(filePath);
            const doc = new PDFDocument({ size: "A4", margin: 40 });
            doc.pipe(writeStream);
            
            // Draw simple PDF layout (reuse parts or draw customized summary for file archiving)
            doc.fillColor("#1e3a8a").fontSize(18).text("Annual Activity Archive", 40, 40);
            doc.fillColor("#334155").fontSize(12).text(`Employee: ${reportData.employee.fullName}`, 40, 70);
            doc.text(`Year: ${reportData.year}`, 40, 90);
            doc.text(`Total Tasks Completed: ${reportData.summary.totalTasks}`, 40, 110);
            doc.text(`Total Hours Worked: ${reportData.summary.totalHours} hrs`, 40, 130);
            
            doc.end();
            console.log(`  💾 Saved yearly report archive for ${emp.first_name} to ${filePath}`);
          }
        } catch (empErr) {
          console.error(`  ⚠️ Failed to generate yearly report for employee ID ${emp.id}:`, empErr.message);
        }
      }
      console.log(`✅ Automatic yearly report generation cycle for ${previousYear} complete.`);
    } catch (err) {
      console.error("❌ Yearly report generation job failed:", err.message);
    }
  });
}

module.exports = {
  getReportData,
  generateExcelReport,
  generatePdfReport,
  startYearlyReportScheduler
};
