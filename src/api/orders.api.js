import api from './axios';

export const ordersApi = {
  create:           (data)    => api.post('/orders', data),
  getAll:           (params)  => api.get('/orders', { params }),
  getMy:            ()        => api.get('/orders/my'),
  getById:          (id)      => api.get(`/orders/${id}`),
  getKitchenQueue:  ()        => api.get('/orders/kitchen'),
  updateStatus:     (id, status) => api.patch(`/orders/${id}/status`, { status }),
};