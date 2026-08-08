import api from './api';

export const getMyLeaveBalance = async () => {
  const response = await api.get('/leave-balances/my-balance');
  return response.data; // { success, data: { paidLeave, sickLeave } }
};

export const getEmployeeLeaveBalance = async (employeeId) => {
  const response = await api.get(`/leave-balances/${employeeId}`);
  return response.data; // { success, data: { paidLeave, sickLeave } }
};

export const getEmployeeLeaveBalanceForManager = async (employeeId) => {
  const response = await api.get(`/employees/${employeeId}/leave-balance`);
  return response.data; // { success, data: { paidLeave, sickLeave } }
};
