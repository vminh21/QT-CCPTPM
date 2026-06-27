import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../../api/auth';
import './Login.css';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({show:false,msg:'',type:'success'});

  const showToast = (msg,type='success') => { setToast({show:true,msg,type}); setTimeout(()=>setToast({show:false,msg:'',type:'success'}),4000); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res = await authApi.forgotPassword(email);
      showToast('Đã gửi email khôi phục mật khẩu!', 'success');
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Lỗi kết nối!';
      showToast(msg, 'error');
    }
    finally { setLoading(false); }
  };

  return (
    <div className="login-page">
      {toast.show && <div className={`toast ${toast.type} show`}><i className="bx bxs-info-circle"></i><span>{toast.msg}</span></div>}
      <div className="login-card">
        <div className="login-header">
          <h1>FitPhysique</h1>
          <p>Khôi phục mật khẩu</p>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          <p style={{color:'#888',fontSize:'0.85rem',textAlign:'center',marginBottom:10}}>Vui lòng nhập địa chỉ email bạn đã sử dụng để đăng ký. Chúng tôi sẽ gửi link khôi phục mật khẩu.</p>
          <div className="input-group">
            <label>Email</label>
            <div className="input-wrap"><i className="bx bx-envelope"></i><input type="email" required placeholder="Nhập email..." value={email} onChange={e=>setEmail(e.target.value)} /></div>
          </div>
          <button type="submit" className="btn-login" disabled={loading}>{loading?'Đang xử lý...':'Gửi yêu cầu'}</button>
          <p className="register-text"><Link to="/login"><i className="bx bx-arrow-back"></i> Quay lại đăng nhập</Link></p>
        </form>
      </div>
      <div className="bg-blob blob-1"></div><div className="bg-blob blob-2"></div>
    </div>
  );
}

export default ForgotPasswordPage;
