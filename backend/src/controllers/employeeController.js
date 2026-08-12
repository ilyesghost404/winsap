const Employee = require("../models/Employee");
const FaceProfile = require("../models/FaceProfile");
const LeaveBalance = require("../models/LeaveBalance");

const getEmployees = async (req, res) => {
    try {
        const { page, limit, search } = req.query;
        const result = await Employee.getAll({
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 10,
            search: search || ''
        });
        res.json({ success: true, ...result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to fetch employees" });
    }
};

const getEmployeeById = async (req, res) => {
    try {
        const { id } = req.params;
        const employee = await Employee.getById(id);
        
        if (!employee) {
            return res.status(404).json({ success: false, message: "Employee not found" });
        }
        
        res.json({ success: true, data: employee });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to fetch employee" });
    }
};

const createEmployee = async (req, res) => {
    try {
        const { matricule, first_name, last_name, email } = req.body;
        let hire_date = req.body.hire_date || new Date().toISOString().split('T')[0];
        
        if (!matricule || !first_name || !last_name) {
            return res.status(400).json({ 
                success: false, 
                message: "Matricule, first name, and last name are required" 
            });
        }

        // Manager authorization rule: Manager cannot set employee email address
        if (req.user && req.user.role === 'manager' && email) {
            return res.status(403).json({ 
                success: false, 
                message: "Managers cannot set employee email addresses. Email addresses are managed by Administrators." 
            });
        }
        
        const employeeData = { ...req.body, hire_date };
        if (req.user && req.user.role === 'manager') {
            employeeData.email = null;
        }

        const employee = await Employee.create(employeeData);
        
        // Initialize leave balance for the new employee
        await LeaveBalance.initialize(employee.id);
        
        res.status(201).json({ success: true, data: employee });
    } catch (error) {
        console.error(error);
        
        if (error.code === "23505") {
            return res.status(400).json({ success: false, message: "Matricule or email already exists" });
        }
        
        res.status(500).json({ success: false, message: "Failed to create employee" });
    }
};

const updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const existing = await Employee.getById(id);
        if (!existing) {
            return res.status(404).json({ success: false, message: "Employee not found" });
        }

        const { matricule, first_name, last_name, email } = req.body;
        let hire_date = req.body.hire_date || existing.hire_date || new Date().toISOString().split('T')[0];
        
        if (!matricule || !first_name || !last_name) {
            return res.status(400).json({ 
                success: false, 
                message: "Matricule, first name, and last name are required" 
            });
        }

        // Manager authorization rule: Manager cannot modify existing employee email address
        const updateData = { ...req.body, hire_date };
        if (req.user && req.user.role === 'manager') {
            if (email && existing.email && email !== existing.email) {
                return res.status(403).json({ 
                    success: false, 
                    message: "Managers cannot modify employee email addresses. Email addresses are managed by Administrators." 
                });
            }
            updateData.email = existing.email; // Preserve existing email
        }
        
        const employee = await Employee.update(id, updateData);
        
        res.json({ success: true, data: employee });
    } catch (error) {
        console.error(error);
        
        if (error.code === "23505") {
            return res.status(400).json({ success: false, message: "Matricule or email already exists" });
        }
        
        res.status(500).json({ success: false, message: "Failed to update employee" });
    }
};

const deleteEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const employee = await Employee.delete(id);
        
        if (!employee) {
            return res.status(404).json({ success: false, message: "Employee not found" });
        }
        
        res.json({ success: true, data: employee });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to delete employee" });
    }
};

const registerFace = async (req, res) => {
  try {
    const { id } = req.params;
    const { images } = req.body; // Array of 3 base64 strings
    
    if (!images || !Array.isArray(images) || images.length !== 3) {
      return res.status(400).json({ success: false, message: "Exactly three facial captures (front, left, right) are required" });
    }

    const employee = await Employee.getById(id);
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    // Prevent duplicate registration
    const existing = await FaceProfile.getByEmployeeId(id);
    if (existing) {
      return res.status(400).json({ success: false, message: "Face profile is already registered for this employee" });
    }

    // Call AI service to generate embedding
    const aiResponse = await fetch("http://localhost:5001/api/ai/embed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ images })
    });
    
    const aiResult = await aiResponse.json();
    if (!aiResponse.ok || !aiResult.success) {
      return res.status(400).json({ success: false, message: aiResult.reason || "Failed to generate facial signature" });
    }

    const embeddings = aiResult.embeddings;
    await FaceProfile.create(id, embeddings, aiResult.qualityScore || 95);

    res.json({ success: true, message: "Face profile registered successfully" });
  } catch (error) {
    console.error("Register face error:", error);
    res.status(500).json({ success: false, message: "An error occurred during face registration. Please try again." });
  }
};

const getUnlinkedEmployees = async (req, res) => {
    try {
        const unlinked = await Employee.getUnlinkedEmployees();
        res.json({ success: true, data: unlinked });
    } catch (error) {
        console.error("Get unlinked employees error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch unlinked employees" });
    }
};

module.exports = {
    getEmployees,
    getEmployeeById,
    getUnlinkedEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    registerFace
};
