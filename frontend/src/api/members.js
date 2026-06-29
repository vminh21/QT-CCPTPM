import client from './client';

/** Members API - /api/members/* */
export const membersApi = {
  /** GET /api/members?search=&filter_package=&filter_status= */
  list: (params = {}) => client.get('/members', { params }),

  /** GET /api/members/{id} */
  get: (id) => client.get(`/members/${id}`),

  /** POST /api/members */
  create: (data) => client.post('/members', data),

  /** PUT /api/members/{id} */
  update: (id, data) => client.put(`/members/${id}`, data),

  /** PATCH /api/members/{id}/status */
  toggleStatus: (id, currentStatus) =>
    client.patch(`/members/${id}/status`, { current_status: currentStatus }),

  /** DELETE /api/members/{id} */
  delete: (id) => client.delete(`/members/${id}`),
};
