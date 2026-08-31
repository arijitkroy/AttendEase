import api from './client';

export const leaveApi = {
  applyLeave: (data) => api.post('/leaves/apply', data),
  getMyLeaves: () => api.get('/leaves/my-leaves'),
  getAllRequests: (params) => api.get('/leaves/all-requests', { params }),
  approveLeave: (id, data) => api.post(`/leaves/${id}/approve`, data),
  rejectLeave: (id, data) => api.post(`/leaves/${id}/reject`, data)
};
