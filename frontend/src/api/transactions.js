import client from './client';

/** Transactions API - /api/transactions/* */
export const transactionsApi = {
  list: (params = {}) => client.get('/transactions', { params }),
  create: (data) => client.post('/transactions', data),
  update: (id, data) => client.put(`/transactions/${id}`, data),
  delete: (id) => client.delete(`/transactions/${id}`),
};
