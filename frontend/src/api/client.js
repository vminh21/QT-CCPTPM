import axios from 'axios';

/**
 * Axios instance - tất cả request đến PHP backend
 * JWT token được lưu trong localStorage và tự động gắn vào mọi request
 */
const client = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// ── Request Interceptor: tự động gắn Bearer token ─────────────────────────────
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response Interceptor: xử lý lỗi 401 tự động redirect ─────────────────────
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('jwt_token');
      window.location.href = '/login';
      return Promise.reject(error);
    }
    // NGHIÊM CẤM TỰ RESOLVE. 400, 422, 404, 500 ném Reject để Component catch(err) xử lý tường minh.
    return Promise.reject(error);
  }
);

export default client;
