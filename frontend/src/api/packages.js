import client from './client';

/** Packages API - /api/packages */
export const packagesApi = {
  /** GET /api/packages */
  list: () => client.get('/packages'),
};
