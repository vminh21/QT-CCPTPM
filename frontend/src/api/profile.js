import client from './client';

/** Profile API - /api/profile/* */
export const profileApi = {
  /** GET /api/profile */
  get: () => client.get('/profile'),

  /** PUT /api/profile */
  update: (data) => client.put('/profile', data),

  /** DELETE /api/profile/subscription */
  cancelSubscription: () => client.delete('/profile/subscription'),

  /** PATCH /api/profile/schedules/{id}/status */
  confirmSchedule: (id, status) =>
    client.patch(`/profile/schedules/${id}/status`, { status }),

  /** POST /api/profile/reviews */
  submitReview: (data) => client.post('/profile/reviews', data),

  /** GET /api/profile/reviews/can-review?trainer_id= */
  canReview: (trainerId) =>
    client.get('/profile/reviews/can-review', { params: { trainer_id: trainerId } }),
};
