import api from './axios';

export const deliveryApi = {
  getDrivers:    ()              => api.get('/delivery/drivers'),
  getActiveRuns: ()              => api.get('/delivery/runs/active'),
  getMyRuns:     ()              => api.get('/delivery/runs/my'),
  getMyHistory:  ()              => api.get('/delivery/runs/my/history'),
  assignDriver:  (orderId, driverId) => api.post(`/delivery/orders/${orderId}/assign`, { driverId }),
  markDelivered: (orderId)       => api.patch(`/delivery/orders/${orderId}/delivered`),
};