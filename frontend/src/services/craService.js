import api from "./api";

// Employee: get own CRA entries
export const getMyActivities = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.page) query.set("page", params.page);
  if (params.limit) query.set("limit", params.limit);
  if (params.status) query.set("status", params.status);
  if (params.month) query.set("month", params.month);
  if (params.year) query.set("year", params.year);
  if (params.startDate) query.set("startDate", params.startDate);
  if (params.endDate) query.set("endDate", params.endDate);
  if (params.search) query.set("search", params.search);
  const response = await api.get(`/cra/my-activities?${query.toString()}`);
  return response.data;
};

// Manager: get all employees' CRA entries
export const getAllActivities = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.page) query.set("page", params.page);
  if (params.limit) query.set("limit", params.limit);
  if (params.search) query.set("search", params.search);
  if (params.status) query.set("status", params.status);
  if (params.employeeId) query.set("employeeId", params.employeeId);
  if (params.month) query.set("month", params.month);
  if (params.year) query.set("year", params.year);
  if (params.startDate) query.set("startDate", params.startDate);
  if (params.endDate) query.set("endDate", params.endDate);
  const response = await api.get(`/cra?${query.toString()}`);
  return response.data;
};

// Create a pending activity
export const createCraEntry = async (data) => {
  const response = await api.post("/cra", data);
  return response.data;
};

// Start a new activity immediately
export const startActivity = async (data) => {
  const response = await api.post("/cra/start", data);
  return response.data;
};

// Start an existing pending activity
export const startExistingActivity = async (id) => {
  const response = await api.put(`/cra/${id}/start`);
  return response.data;
};

// End a running activity
export const endActivity = async (id) => {
  const response = await api.put(`/cra/${id}/end`);
  return response.data;
};

// Update details
export const updateCraEntry = async (id, data) => {
  const response = await api.put(`/cra/${id}`, data);
  return response.data;
};

// Delete entry
export const deleteCraEntry = async (id) => {
  const response = await api.delete(`/cra/${id}`);
  return response.data;
};

// Manager validation
export const approveCraEntry = async (id) => {
  const response = await api.put(`/cra/${id}/approve`);
  return response.data;
};

export const rejectCraEntry = async (id) => {
  const response = await api.put(`/cra/${id}/reject`);
  return response.data;
};

// Get stats (count-based)
export const getCraStats = async () => {
  const response = await api.get("/cra/stats");
  return response.data.data;
};

// Get monthly stats (hours/days/productivity)
export const getMonthlyStats = async () => {
  const response = await api.get("/cra/monthly-stats");
  return response.data.data;
};

// Live monitoring data (manager only)
export const getLiveCraData = async () => {
  const response = await api.get("/cra/live");
  return response.data;
};

// Manager Control Center stats & live feed
export const getControlCenterData = async () => {
  const response = await api.get("/cra/control-center");
  return response.data.data;
};

// Read-only employee monitor summary profile
export const getEmployeeMonitorSummary = async (employeeId) => {
  const response = await api.get(`/cra/employee-summary/${employeeId}`);
  return response.data.data;
};

