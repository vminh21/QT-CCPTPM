import client from './client';

/** Blogs API - /api/blogs/* */
export const blogsApi = {
  /** GET /api/blogs?limit= */
  list: (params = {}) => client.get('/blogs', { params }),

  /** GET /api/blogs/{id} */
  get: (id) => client.get(`/blogs/${id}`),

  /** POST /api/blogs (multipart) */
  create: (formData) =>
    client.post('/blogs', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),

  /** PUT /api/blogs/{id} (multipart) */
  update: (id, formData) =>
    client.post(`/blogs/${id}?_method=PUT`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),

  /** DELETE /api/blogs/{id} */
  delete: (id) => client.delete(`/blogs/${id}`),
};
