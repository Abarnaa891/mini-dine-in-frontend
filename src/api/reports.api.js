import api from './axios';

export const reportsApi = {
  getSummary:        (params) => api.get('/reports/summary', { params }),
  getDaily:          (params) => api.get('/reports/daily', { params }),
  getTopItems:       (params) => api.get('/reports/top-items', { params }),
  getStatusBreakdown:(params) => api.get('/reports/status-breakdown', { params }),
  getDriverStats:    (params) => api.get('/reports/drivers', { params }),
  getCategoryRevenue:(params) => api.get('/reports/categories', { params }),
};