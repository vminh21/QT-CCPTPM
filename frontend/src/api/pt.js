import client from './client';

/** PT API - /api/pt/* */
export const ptApi = {
  /** GET /api/pt/dashboard */
  dashboard: () => client.get('/pt/dashboard'),

  // ── Schedules ──────────────────────────────────────────────────────────────
  /** GET /api/pt/schedules */
  getSchedules: () => client.get('/pt/schedules'),

  /** POST /api/pt/schedules */
  addSchedule: (data) => client.post('/pt/schedules', data),

  /** PATCH /api/pt/schedules/{id}/status */
  updateScheduleStatus: (id, status) =>
    client.patch(`/pt/schedules/${id}/status`, { status }),

  /** DELETE /api/pt/schedules/{id} */
  deleteSchedule: (id) => client.delete(`/pt/schedules/${id}`),

  // ── Students ───────────────────────────────────────────────────────────────
  /** GET /api/pt/students */
  getStudents: () => client.get('/pt/students'),

  // ── Workouts ───────────────────────────────────────────────────────────────
  /** GET /api/pt/workouts */
  getWorkouts: () => client.get('/pt/workouts'),

  /** POST /api/pt/workouts */
  createWorkout: (data) => client.post('/pt/workouts', data),

  /** PUT /api/pt/workouts/{id} */
  updateWorkout: (id, data) => client.put(`/pt/workouts/${id}`, data),

  /** DELETE /api/pt/workouts/{id} */
  deleteWorkout: (id) => client.delete(`/pt/workouts/${id}`),

  // ── Reviews ────────────────────────────────────────────────────────────────
  /** GET /api/pt/reviews */
  getReviews: () => client.get('/pt/reviews'),
};

/**
 * Lấy lịch tập đã format ISO 8601 cho FullCalendar.
 * Gọi endpoint GET /api/schedules (ScheduleController mới).
 */
export const fetchSchedules = (trainerId, startDate, endDate) =>
  client.get('/schedules', {
    params: {
      trainer_id: trainerId,
      start: startDate,
      end: endDate,
    },
  });

