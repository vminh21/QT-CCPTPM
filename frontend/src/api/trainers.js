import client from './client';

/** Trainers API - /api/trainers/* */
export const trainersApi = {
  /** GET /api/trainers?search=&limit= */
  list: (params = {}) => client.get('/trainers', { params }),

  /** GET /api/trainers/{id} */
  get: (id) => client.get(`/trainers/${id}`),

  /** GET /api/trainers/{id}/reviews */
  reviews: (id) => client.get(`/trainers/${id}/reviews`),

  /** POST /api/trainers (multipart: có file ảnh) */
  create: (formData) =>
    client.post('/trainers', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),

  /** PUT /api/trainers/{id} (multipart: có file ảnh) */
  update: (id, formData) =>
    client.post(`/trainers/${id}?_method=PUT`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),

  /** DELETE /api/trainers/{id} */
  delete: (id) => client.delete(`/trainers/${id}`),

  /** GET /api/trainers/{id}/reviews - alias dùng trong RateTrainersPage */
  getReviews: (id) => client.get(`/trainers/${id}/reviews`),
};
