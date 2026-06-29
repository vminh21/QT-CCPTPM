import client from './client';

/** Reports API - /api/reports/* */
export const reportsApi = {
  /** GET /api/reports/years */
  years: () => client.get('/reports/years'),

  /** GET /api/reports?year= */
  get: (year) => client.get('/reports', { params: { year } }),
};
