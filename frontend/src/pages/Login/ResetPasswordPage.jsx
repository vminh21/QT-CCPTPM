import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '../../api/auth';
import './Login.css';

function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState('');
  
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });

  // Lấy token từ query URL: ?token=...
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const t = params.get('token');
    if (t) {
      setToken(t);
    } else {
      showToast('Đường dẫn không hợp lệ. Vui lòng kiểm tra lại email.', 'error');
    }
  }, [location]);

  const showToast = (msg, type = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type: 'success' }), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      showToast('Không tìm thấy token xác thực!', 'error');
      return;
    }
    if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      showToast('Mật khẩu cần ít nhất 8 ký tự, gồm cả chữ và số!', 'error');
      return;
    }
    if (password !== confirmPass) {
      showToast('Mật khẩu xác nhận không khớp!', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.resetPassword(token, password);
      showToast('Đổi mật khẩu thành công! Chuyển hướng...', 'success');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const msg = err.response?.data?.error || 'Lỗi kết nối. Vui lòng thử lại sau!';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {toast.show && (
        <div className={`toast ${toast.type} show`}>
          <i className={`bx ${toast.type === 'success' ? 'bxs-check-circle' : 'bxs-error-circle'}`}></i>
          <span>{toast.msg}</span>
        </div>
      )}
      
      <div className="login-card">
        <div className="login-header">
          <h1>FitPhysique</h1>
          <p>Đặt lại mật khẩu mới</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <p style={{ color: '#888', fontSize: '0.85rem', textAlign: 'center', marginBottom: 10 }}>
            Vui lòng nhập mật khẩu mới của bạn bên dưới.
          </p>
          
          <div className="input-group">
            <div className="input-wrap">
              <i className="bx bxs-lock-alt"></i>
              <input 
                type={showPass ? 'text' : 'password'} 
                required 
                placeholder="Mật khẩu mới..." 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
              />
              <i 
                className={`bx ${showPass ? 'bxs-show' : 'bxs-hide'} toggle-pass`} 
                onClick={() => setShowPass(!showPass)}
              ></i>
            </div>
          </div>
          
          <div className="input-group">
            <div className="input-wrap">
              <i className="bx bxs-lock"></i>
              <input 
                type="password" 
                required 
                placeholder="Xác nhận mật khẩu..." 
                value={confirmPass} 
                onChange={e => setConfirmPass(e.target.value)} 
              />
            </div>
          </div>

          <button type="submit" className="btn-login" disabled={loading || !token}>
            {loading ? <><span className="btn-spinner"></span> Đang xử lý...</> : 'Lưu mật khẩu mới'}
          </button>
          
          <p className="register-text">
            <Link to="/login"><i className="bx bx-arrow-back"></i> Quay lại đăng nhập</Link>
          </p>
        </form>
      </div>
      
      <div className="bg-blob blob-1"></div>
      <div className="bg-blob blob-2"></div>
    </div>
  );
}

export default ResetPasswordPage;
