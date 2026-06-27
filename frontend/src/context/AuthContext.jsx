import { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '../api/auth';

const AuthContext = createContext(null);

/**
 * AuthProvider: Wrap toàn bộ app
 * JWT được lưu trong localStorage - stateless, không cần session cookie
 */
export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null);
  const [loading, setLoading] = useState(true);

  // Khởi động: kiểm tra token trong localStorage
  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      setLoading(false);
      return;
    }
    // Xác minh token còn hợp lệ bằng cách gọi /api/auth/me
    authApi.me()
      .then((res) => {
        if (res.data.data?.loggedIn) {
          setUser(res.data.data);
        } else {
          localStorage.removeItem('jwt_token');
          setUser(null);
        }
      })
      .catch(() => {
        localStorage.removeItem('jwt_token');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  /**
   * Đăng nhập: gọi API, lưu token vào localStorage, cập nhật state
   */
  const login = async (username, password) => {
    try {
      const res = await authApi.login(username, password);
      // Login API trả về: { success, token, role, full_name }
      const { token, role, full_name } = res.data;

      if (!token || !role) {
        return { success: false, error: 'Phản hồi từ server không hợp lệ!' };
      }

      localStorage.setItem('jwt_token', token);

      // Build user state từ login response (không cần gọi me() riêng)
      const userData = { loggedIn: true, role, full_name };
      setUser(userData);

      return { success: true, role };

    } catch (err) {
      localStorage.removeItem('jwt_token');
      return { success: false, error: err.response?.data?.error || err.message || 'Đăng nhập thất bại!' };
    }
  };

  /**
   * Đăng xuất: xóa token, clear state
   */
  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      localStorage.removeItem('jwt_token');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
