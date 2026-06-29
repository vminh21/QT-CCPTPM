import client from './client';

/** Notifications API - /api/notifications/* */
export const notificationsApi = {
  /** GET /api/notifications */
  list: () => client.get('/notifications'),

  /** GET /api/notifications/count */
  count: () => client.get('/notifications/count'),

  /** PATCH /api/notifications/read */
  markAllRead: () => client.patch('/notifications/read'),

  /** POST /api/notifications */
  create: (formData) =>
    client.post('/notifications', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),

  /** PUT /api/notifications/{id} */
  update: (id, formData) =>
    client.post(`/notifications/${id}?_method=PUT`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  /** DELETE /api/notifications/{id} */
  delete: (id) => client.delete(`/notifications/${id}`),
};
