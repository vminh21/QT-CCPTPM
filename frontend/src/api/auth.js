import client from './client';

/**
 * Auth API Module
 * Tất cả endpoints: /api/auth/*
 */

export const authApi = {
  /** GET /api/auth/me - Lấy thông tin user từ JWT hiện tại */
  me: () => client.get('/auth/me'),

  /** POST /api/auth/login - Đăng nhập, nhận JWT */
  login: (username, password) =>
    client.post('/auth/login', { username, password }),

  /** POST /api/auth/logout - Đăng xuất */
  logout: () => client.post('/auth/logout'),

  /** POST /api/auth/register - Đăng ký tài khoản mới */
  register: (data) => client.post('/auth/register', data),

  /** POST /api/auth/forgot-password - Gửi email khôi phục */
  forgotPassword: (email) => client.post('/auth/forgot-password', { email }),

  /** POST /api/auth/reset-password - Đổi mật khẩu mới với token */
  resetPassword: (token, newPassword) => client.post('/auth/reset-password', { token, newPassword }),
};