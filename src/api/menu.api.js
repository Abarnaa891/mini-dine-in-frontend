import api from './axios';

export const menuApi = {
  getCategories:     ()           => api.get('/categories'),
  createCategory:    (data)       => api.post('/categories', data),
  updateCategory:    (id, data)   => api.patch(`/categories/${id}`, data),
  deleteCategory:    (id)         => api.delete(`/categories/${id}`),

  getItems:          (params)     => api.get('/menu', { params }),
  getItemById:       (id)         => api.get(`/menu/${id}`),
  createItem:        (data)       => api.post('/menu', data),
  updateItem:        (id, data)   => api.patch(`/menu/${id}`, data),
  toggleAvailability:(id)         => api.patch(`/menu/${id}/availability`),
  deleteItem:        (id)         => api.delete(`/menu/${id}`),
};