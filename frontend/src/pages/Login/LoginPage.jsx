import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import './Login.css';

function LoginPage() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm]         = useState({ username: '', password: '', remember_me: false });
  const [toast, setToast]       = useState({ show: false, msg: '', type: 'error' });
  const [submitting, setSubmitting] = useState(false);
  const [showPass, setShowPass] = useState(false);

  // Nếu đã đăng nhập → redirect
  useEffect(() => {
    if (!loading && user?.loggedIn) {
      if (user.role === 'admin' || user.role === 'staff') navigate('/admin', { replace: true });
      else if (user.role === 'pt') navigate('/pt', { replace: true });
      else navigate('/member', { replace: true });
    }
  }, [user, loading, navigate]);

  const showToast = (msg, type = 'error') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type: 'error' }), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      showToast('Vui lòng nhập email và mật khẩu!');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (form.username.includes('@') && !emailRegex.test(form.username)) {
      showToast('Email không hợp lệ!');
      return;
    }
    setSubmitting(true);
    try {
      const result = await login(form.username, form.password, form.remember_me);
      if (result.success) {
        showToast('Đăng nhập thành công! Đang chuyển hướng...', 'success');
        setTimeout(() => {
          if (result.role === 'admin' || result.role === 'staff') navigate('/admin', { replace: true });
          else if (result.role === 'pt') navigate('/pt', { replace: true });
          else navigate('/member', { replace: true });
        }, 800);
      } else {
        showToast(result.error || 'Sai email hoặc mật khẩu!');
      }
    } catch {
      showToast('Lỗi kết nối. Vui lòng thử lại!');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  return (
    <div className="login-page">
      {/* Toast */}
      {toast.show && (
        <div className={`toast ${toast.type} show`}>
          <i className={`bx ${toast.type === 'success' ? 'bxs-check-circle' : 'bxs-error-circle'}`}></i>
          <span>{toast.msg}</span>
        </div>
      )}

      <div className="login-card">
        <div className="login-header">
          <h1>Login</h1>
          <div className="login-logo">
            <i className="bx bx-dumbbell"></i>
            <span>FIT<b>PHYSIQUE</b></span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="login-form" noValidate>
          <div className="input-wrap">
            <input
              id="username"
              type="text"
              placeholder="Email / Tài khoản Admin"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              autoComplete="username"
            />
            <i className="bx bxs-user"></i>
          </div>

          <div className="input-wrap">
            <input
              id="password"
              type={showPass ? 'text' : 'password'}
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              autoComplete="current-password"
            />
            <i
              className={`bx ${showPass ? 'bxs-show' : 'bxs-hide'} toggle-pass`}
              onClick={() => setShowPass(!showPass)}
            ></i>
          </div>

          <div className="login-options">
            <label className="remember-me">
              <input
                type="checkbox"
                checked={form.remember_me}
                onChange={(e) => setForm({ ...form, remember_me: e.target.checked })}
              />
              <span>Remember Me</span>
            </label>
            <Link to="/forgot-password" className="forgot-link">Forgot Password</Link>
          </div>

          <button type="submit" className="btn-login" disabled={submitting}>
            {submitting ? (
              <><span className="btn-spinner"></span> Logging in...</>
            ) : 'Login'}
          </button>

          <p className="register-text">
            Don't have an account? <Link to="/signup">Register</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
