import client from './client';

/** Dashboard API - /api/dashboard/* */
export const dashboardApi = {
  /** GET /api/dashboard/stats */
  stats: () => client.get('/dashboard/stats'),

  /** GET /api/dashboard/members */
  members: () => client.get('/dashboard/members'),
};
