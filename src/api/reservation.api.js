import api from './axios';

export const reservationsApi = {
  create:      (data)       => api.post('/reservations', data),
  getAll:      ()           => api.get('/reservations'),
  getMy:       ()           => api.get('/reservations/my'),
  getById:     (id)         => api.get(`/reservations/${id}`),
  getUpcoming: ()           => api.get('/reservations/upcoming'),
  update:      (id, data)   => api.patch(`/reservations/${id}`, data),
  cancel:      (id)         => api.patch(`/reservations/${id}/cancel`),
};