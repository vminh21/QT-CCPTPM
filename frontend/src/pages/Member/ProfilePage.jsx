import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MemberLayout } from '../../components/Layout/MemberLayout';
import { profileApi } from '../../api/profile';
import useAuth from '../../hooks/useAuth';
import './Member.css';

function ProfilePage() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [form, setForm] = useState({ full_name:'', email:'', phone_number:'', address:'', gender:'', password:'' });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show:false, msg:'', type:'success' });
  const [submitting, setSubmitting] = useState(false);

  const showToast = (msg, type='success') => { setToast({show:true,msg,type}); setTimeout(()=>setToast({show:false,msg:'',type:'success'}),3500); };

  const fetchProfile = () => {
    setLoading(true);
    profileApi.get().then(r => {
      const d = r.data.data;
      setData(d);
      if (d.member) {
        setForm({
          full_name: d.member.full_name||'', email: d.member.email||'', phone_number: d.member.phone_number||'',
          address: d.member.address||'', gender: d.member.gender||'Male', password: ''
        });
      }
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await profileApi.update(form);
      showToast('Cập nhật thành công!');
      setUser(prev => ({...prev, full_name: form.full_name}));
      setForm(f => ({...f, password:''}));
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Lỗi kết nối!';
      showToast(msg, 'error');
    } finally { setSubmitting(false); }
  };

  const cancelSub = async () => {
    if (!window.confirm('Bạn có chắc muốn hủy gói tập hiện tại? Không thể hoàn tác!')) return;
    try {
      const res = await profileApi.cancelSubscription();
      showToast('Đã hủy gói tập!');
      fetchProfile();
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Lỗi hủy gói!';
      showToast(msg, 'error');
    }
  };

  const confirmSchedule = async (id, status) => {
    try {
      const res = await profileApi.confirmSchedule(id, status);
      showToast(`Đã ${status.toLowerCase()} lịch!`);
      fetchProfile();
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Lỗi!';
      showToast(msg, 'error');
    }
  };

  if (loading) return <MemberLayout title="Hồ sơ cá nhân"><div style={{padding:40,textAlign:'center',color:'#fff'}}>Đang tải dữ liệu...</div></MemberLayout>;

  return (
    <MemberLayout title="Hồ sơ của tôi">
      {toast.show && <div style={{position:'fixed',top:80,right:20,padding:'12px 20px',borderRadius:10,zIndex:9999,background:toast.type==='success'?'#1a2d1a':'#2d1a1a',border:`1px solid ${toast.type==='success'?'#22c55e':'#ef4444'}`,color:toast.type==='success'?'#86efac':'#fca5a5'}}>{toast.msg}</div>}

      <div style={{ maxWidth: 900 }}>
        {/* Profile Form */}
        <div className="admin-table-wrap" style={{ padding: 28, marginBottom: 24, background: '#141414' }}>
          <h2 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 600, marginBottom: 20 }}>Thông tin cá nhân</h2>
          <form onSubmit={handleUpdate} style={{display:'flex',flexDirection:'column',gap:16}}>
            <div className="form-group"><label>Họ và tên</label><input required value={form.full_name} onChange={e=>setForm(f=>({...f,full_name:e.target.value}))} style={{width:'100%',padding:10,borderRadius:8,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',color:'#fff',outline:'none'}} /></div>
            <div style={{display:'flex',gap:16}}>
              <div className="form-group" style={{flex:1}}><label>Email</label><input type="email" required value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} style={{width:'100%',padding:10,borderRadius:8,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',color:'#fff',outline:'none'}} /></div>
              <div className="form-group" style={{flex:1}}><label>Số điện thoại</label><input value={form.phone_number} readOnly style={{width:'100%',padding:10,borderRadius:8,background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.05)',color:'#888',cursor:'not-allowed'}} /></div>
            </div>
            <div style={{display:'flex',gap:16}}>
              <div className="form-group" style={{flex:1}}><label>Giới tính</label><select value={form.gender} onChange={e=>setForm(f=>({...f,gender:e.target.value}))} style={{width:'100%',padding:10,borderRadius:8,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',color:'#fff',outline:'none'}}><option value="Male">Nam</option><option value="Female">Nữ</option></select></div>
              <div className="form-group" style={{flex:1}}><label>Đổi mật khẩu (bỏ trống nếu không đổi)</label><input type="password" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} style={{width:'100%',padding:10,borderRadius:8,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',color:'#fff',outline:'none'}} /></div>
            </div>
            <div className="form-group"><label>Địa chỉ</label><input value={form.address} onChange={e=>setForm(f=>({...f,address:e.target.value}))} style={{width:'100%',padding:10,borderRadius:8,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',color:'#fff',outline:'none'}} /></div>
            <button type="submit" disabled={submitting} className="btn-primary" style={{alignSelf:'flex-end'}}>{submitting?'Đang lưu...':'Cập nhật hồ sơ'}</button>
          </form>
        </div>

        {/* Subscription Info */}
        <div className="admin-table-wrap" style={{ padding: 28, marginBottom: 24, background: '#141414' }}>
          <h2 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 600, marginBottom: 20 }}>Gói tập hiện tại</h2>
          {data?.active_sub ? (
            <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
              <span className="badge badge-reg" style={{ padding: '6px 14px', borderRadius: 20, fontSize: '0.85rem' }}>{data.active_sub.package_name}</span>
              <span style={{ color: '#f97316', fontSize: '0.9rem' }}>Còn lại: {data.days_left} ngày</span>
              <span style={{color:'#888',fontSize:'0.9rem'}}>(Hết hạn: {new Date(data.active_sub.end_date).toLocaleDateString('vi-VN')})</span>
              <button onClick={cancelSub} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: '#ef4444', padding: '8px 16px', fontSize: '0.85rem', cursor: 'pointer', marginLeft: 'auto' }}>Hủy gói tập</button>
            </div>
          ) : (
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <p style={{color:'#888'}}>Bạn chưa đăng ký gói tập nào hoặc gói đã hết hạn.</p>
              <button onClick={() => navigate('/member/payment')} className="btn-primary">Mua gói mới</button>
            </div>
          )}
        </div>

        {/* Schedules */}
        <div className="admin-table-wrap">
          <div className="table-header-row"><h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff' }}>Lịch tập luyện</h2></div>
          {data?.schedules?.length > 0 ? (
            <table className="admin-table">
              <thead><tr>
                <th>Thao tác</th><th>Huấn luyện viên</th><th>Thời gian</th><th>Ngày</th>
              </tr></thead>
              <tbody>
                {data.schedules.map((s,i) => (
                  <tr key={i}>
                    <td>
                      {s.status === 'Chờ xác nhận' ? (
                        <div style={{display:'flex',gap:6}}>
                          <button onClick={()=>confirmSchedule(s.schedule_id, 'Xác nhận')} style={{background:'#22c55e',color:'#fff',border:'none',padding:'4px 10px',borderRadius:4,fontSize:'0.75rem',cursor:'pointer'}}>Xác nhận</button>
                          <button onClick={()=>confirmSchedule(s.schedule_id, 'Đã hủy')} style={{background:'#ef4444',color:'#fff',border:'none',padding:'4px 10px',borderRadius:4,fontSize:'0.75rem',cursor:'pointer'}}>Từ chối</button>
                        </div>
                      ) : (
                        <span className={`badge`} style={{
                          padding: '4px 12px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600,
                          background: s.status === 'Hoàn thành' ? 'rgba(249,115,22,0.15)' : s.status === 'Xác nhận' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                          color: s.status === 'Hoàn thành' ? '#f97316' : s.status === 'Xác nhận' ? '#22c55e' : '#ef4444'
                        }}>
                          {s.status}
                        </span>
                      )}
                    </td>
                    <td style={{color:'#333', fontWeight: 500}}>{s.trainer_name}</td>
                    <td>{s.time_start?.substring(0,5)} - {s.time_end?.substring(0,5)}</td>
                    <td>{new Date(s.session_date).toLocaleDateString('vi-VN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p style={{color:'#888', padding: 20, textAlign: 'center'}}>Không có lịch tập sắp tới.</p>}
        </div>
      </div>
    </MemberLayout>
  );
}

export default ProfilePage;
