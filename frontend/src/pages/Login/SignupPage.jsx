import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/auth';
import '../Login/Login.css';

function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', address: '', gender: 'Male', password: '', confirm_pass: ''
  });
  const [toast, setToast]       = useState({ show: false, msg: '', type: 'error' });
  const [submitting, setSubmitting] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const showToast = (msg, type = 'error') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type: 'error' }), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { full_name, email, phone, password, confirm_pass } = form;

    if (!full_name.trim() || full_name.trim().length < 5) {
      showToast('Họ tên phải chứa ít nhất 5 ký tự!'); return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      showToast('Email không đúng định dạng!'); return;
    }
    if (!phone) {
      showToast('Vui lòng nhập số điện thoại!'); return;
    }
    const phoneRegex = /^[0-9]{10,}$/;
    if (!phoneRegex.test(phone)) {
      showToast('Số điện thoại không hợp lệ (ít nhất 10 số)!'); return;
    }
    if (!password || password.length < 8 || !/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      showToast('Mật khẩu cần ít nhất 8 ký tự, gồm cả chữ và số!'); return;
    }
    if (password !== confirm_pass) { 
      showToast('Mật khẩu xác nhận không khớp!'); return; 
    }
    setSubmitting(true);
    try {
      const res = await authApi.register(form);
      showToast('Đăng ký thành công! Chuyển về đăng nhập...', 'success');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      const data = err.response?.data;
      let msg = data?.error || 'Đăng ký thất bại!';
      
      // Nếu Backend trả về mảng errors chi tiết (422)
      if (data?.errors) {
        msg = Object.values(data.errors)[0]; // Lấy lỗi đầu tiên để hiển thị
      }
      
      showToast(msg, 'error');
    }
    finally { setSubmitting(false); }
  };

  const f = (field) => ({ value: form[field], onChange: (e) => setForm({ ...form, [field]: e.target.value }) });

  return (
    <div className="login-page">
      {toast.show && (
        <div className={`toast ${toast.type} show`}>
          <i className={`bx ${toast.type === 'success' ? 'bxs-check-circle' : 'bxs-error-circle'}`}></i>
          <span>{toast.msg}</span>
        </div>
      )}
      <div className="login-card" style={{ maxWidth: 500 }}>
        <div className="login-header">
          <h1>FitPhysique</h1>
          <p>Tạo tài khoản mới</p>
        </div>
        <form onSubmit={handleSubmit} className="login-form" noValidate>
          <div className="input-group">
            <div className="input-wrap">
              <i className="bx bxs-user"></i>
              <input type="text" placeholder="Nhập họ tên..." required {...f('full_name')} />
            </div>
          </div>
          <div className="input-group">
            <div className="input-wrap">
              <i className="bx bxs-envelope"></i>
              <input type="email" placeholder="Nhập email..." required {...f('email')} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="input-group">
              <div className="input-wrap">
                <i className="bx bxs-phone"></i>
                <input type="tel" placeholder="SĐT..." {...f('phone')} />
              </div>
            </div>
            <div className="input-group">
              <div className="input-wrap">
                <i className="bx bxs-user-detail"></i>
                <select style={{ width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, padding:'12px 12px 12px 40px', color:'#e2e8f0', fontSize:'0.95rem', outline:'none' }} {...f('gender')}>
                  <option value="Male">Nam</option>
                  <option value="Female">Nữ</option>
                </select>
              </div>
            </div>
          </div>
          <div className="input-group">
            <div className="input-wrap">
              <i className="bx bxs-map"></i>
              <input type="text" placeholder="Nhập địa chỉ..." {...f('address')} />
            </div>
          </div>
          <div className="input-group">
            <div className="input-wrap">
              <i className="bx bxs-lock-alt"></i>
              <input type={showPass ? 'text' : 'password'} placeholder="Mật khẩu..." required {...f('password')} />
              <i className={`bx ${showPass ? 'bxs-show' : 'bxs-hide'} toggle-pass`} onClick={() => setShowPass(!showPass)}></i>
            </div>
          </div>
          <div className="input-group">
            <div className="input-wrap">
              <i className="bx bxs-lock"></i>
              <input type="password" placeholder="Nhập lại mật khẩu..." required {...f('confirm_pass')} />
            </div>
          </div>
          <button type="submit" className="btn-login" disabled={submitting}>
            {submitting ? <><span className="btn-spinner"></span> Đang đăng ký...</> : 'Đăng ký'}
          </button>
          <p className="register-text">Đã có tài khoản? <Link to="/login">Đăng nhập</Link></p>
        </form>
      </div>
      <div className="bg-blob blob-1"></div>
      <div className="bg-blob blob-2"></div>
    </div>
  );
}

export default SignupPage;
