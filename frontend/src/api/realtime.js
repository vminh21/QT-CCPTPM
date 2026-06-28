import client from './client';

/** Realtime API - /api/realtime/* */
export const realtimeApi = {
  /** GET /api/realtime/poll */
  poll: () => client.get('/realtime/poll'),
};
