import api from './client';

export const attendanceApi = {
  checkIn: (data) => api.post('/attendance/check-in', data),
  checkOut: (data) => api.post('/attendance/check-out', data),
  getTodayStatus: () => api.get('/attendance/today'),
  getMyHistory: (params) => api.get('/attendance/my-history', { params }),
  getHRMetrics: () => api.get('/attendance/hr-metrics'),
  getAllLogs: (params) => api.get('/attendance/all-logs', { params }),
  adjustAttendance: (id, data) => api.put(`/attendance/adjust/${id}`, data),
  exportCSVUrl: '/api/attendance/export-csv'
};
