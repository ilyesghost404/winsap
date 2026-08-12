import api from "./api";

export const getHolidays = async (params = {}) => {
  let queryParams = params;
  if (typeof params === 'number' || (typeof params === 'string' && /^\d{4}$/.test(params))) {
    queryParams = { year: parseInt(params, 10) };
  }
  const response = await api.get("/holidays", { params: queryParams });
  return response.data;
};

export const createHoliday = async (holidayData) => {
  const response = await api.post("/holidays", holidayData);
  return response.data.data;
};

export const updateHoliday = async (id, holidayData) => {
  const response = await api.put(`/holidays/${id}`, holidayData);
  return response.data.data;
};

export const deleteHoliday = async (id) => {
  const response = await api.delete(`/holidays/${id}`);
  return response.data.data;
};
