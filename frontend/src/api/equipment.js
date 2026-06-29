import client from './client';

/** Equipment API - /api/equipment/* */
export const equipmentApi = {
  list: (params = {}) => client.get('/equipment', { params }),
  create: (data) => client.post('/equipment', data),
  update: (id, data) => client.put(`/equipment/${id}`, data),
  delete: (id) => client.delete(`/equipment/${id}`),
};
