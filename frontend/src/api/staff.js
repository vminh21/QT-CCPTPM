import client from './client';

/** Staff API - /api/staff/* */
export const staffApi = {
  list: (params = {}) => client.get('/staff', { params }),
  create: (data) => client.post('/staff', data),
  update: (id, data) => client.put(`/staff/${id}`, data),
  delete: (id) => client.delete(`/staff/${id}`),
};
