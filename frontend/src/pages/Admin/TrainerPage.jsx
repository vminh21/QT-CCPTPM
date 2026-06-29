import { useEffect, useState, useRef, useCallback } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import '../../components/layout/AdminLayout.css';
import { trainersApi } from '../../api/trainers';
import { UPLOADS_URL } from '../../config';

function TrainerPage() {
  const [trainers, setTrainers] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [form,     setForm]     = useState({ id:'', full_name:'', specialty:'', facebook_url:'', twitter_url:'', youtube_url:'', email:'', password:'' });
  const [toast,    setToast]    = useState({show:false,msg:'',type:'success'});
  const [previewImg, setPreviewImg] = useState(null);
  const formRef = useRef(null);

  const showToast = (msg, type='success') => { setToast({show:true,msg,type}); setTimeout(()=>setToast({show:false,msg:'',type:'success'}),3500); };

  const fetchList = useCallback(async () => {
    setLoading(true);
    try { const r = await trainersApi.list(); setTrainers(r.data.data||[]); }
    catch { showToast('Lỗi!','error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchList(); }, [fetchList]);

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa HLV này?')) return;
    const r = await trainersApi.delete(id);
    if (r.data.success) { showToast('Đã xóa!'); fetchList(); } else showToast('Lỗi!','error');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const fd = new FormData(formRef.current);
    const r = form.id
      ? await trainersApi.update(form.id, fd)
      : await trainersApi.create(fd);
    if (r.data.success) {
      showToast('Lưu thành công!');
      setForm({id:'', full_name:'', specialty:'', facebook_url:'', twitter_url:'', youtube_url:'', email:'', password:''});
      setPreviewImg(null);
      formRef.current.reset();
      fetchList();
    }
    else showToast(r.data.error||'Lưu thất bại!','error');
  };

  const handleEdit = (t) => {
    setForm({ id: t.trainer_id, full_name: t.full_name, specialty: t.specialty,
      facebook_url: t.facebook_url||'#', twitter_url: t.twitter_url||'#', youtube_url: t.youtube_url||'#',
      email: t.email||'', password: '' });
    setPreviewImg(t.image ? `${UPLOADS_URL}/${t.image}` : null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setForm({id:'', full_name:'', specialty:'', facebook_url:'', twitter_url:'', youtube_url:'', email:'', password:''});
    setPreviewImg(null);
    formRef.current.reset();
  };

  const Stars = ({n}) => [1,2,3,4,5].map(i => <i key={i} className={`bx ${i<=Math.round(n)?'bxs-star':'bx-star'}`} style={{color:i<=Math.round(n)?'#f59e0b':'#d1d5db',fontSize:'0.9rem'}}></i>);

  return (
    <AdminLayout title="Quản lý PT">
      {toast.show && <div style={{position:'fixed',top:20,right:20,padding:'12px 20px',borderRadius:10,zIndex:9999,background:toast.type==='success'?'#1a2d1a':'#2d1a1a',border:`1px solid ${toast.type==='success'?'#22c55e':'#ef4444'}`,color:toast.type==='success'?'#86efac':'#fca5a5'}}>{toast.msg}</div>}

      <div style={{background:'#fff', borderRadius:12, padding:'24px', marginBottom:24, boxShadow:'0 2px 8px rgba(0,0,0,0.02)'}}>
        <h2 style={{fontSize:'1.2rem', color:'#111', marginBottom:20}}>{form.id ? 'Sửa thông tin PT' : 'Thêm PT mới'}</h2>
        <form ref={formRef} onSubmit={handleSave} encType="multipart/form-data">
          <div className="form-row">
            <div className="form-group">
              <label style={{color:'#444'}}>Tên Huấn Luyện Viên *</label>
              <input name="full_name" required value={form.full_name} onChange={e=>setForm(f=>({...f, full_name: e.target.value}))} placeholder="Ví dụ: Hiệp Cử Tạ" style={{background:'#fff', border:'1px solid #ddd', color:'#333'}} />
            </div>
            <div className="form-group">
              <label style={{color:'#444'}}>Chuyên môn</label>
              <input name="specialty" value={form.specialty} onChange={e=>setForm(f=>({...f, specialty: e.target.value}))} placeholder="HLV Thể Hình" style={{background:'#fff', border:'1px solid #ddd', color:'#333'}} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label style={{color:'#444'}}>Link Facebook</label>
              <input name="facebook_url" value={form.facebook_url} onChange={e=>setForm(f=>({...f, facebook_url: e.target.value}))} placeholder="#" style={{background:'#fff', border:'1px solid #ddd', color:'#333'}} />
            </div>
            <div className="form-group">
              <label style={{color:'#444'}}>Link Twitter</label>
              <input name="twitter_url" value={form.twitter_url} onChange={e=>setForm(f=>({...f, twitter_url: e.target.value}))} placeholder="#" style={{background:'#fff', border:'1px solid #ddd', color:'#333'}} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label style={{color:'#444'}}>Link YouTube</label>
              <input name="youtube_url" value={form.youtube_url} onChange={e=>setForm(f=>({...f, youtube_url: e.target.value}))} placeholder="#" style={{background:'#fff', border:'1px solid #ddd', color:'#333'}} />
            </div>
            <div className="form-group">
              <label style={{color:'#444'}}>Ảnh hiển thị (.jpg, .png)</label>
              <input type="file" name="image" accept="image/jpeg,image/png"
                onChange={e => {
                  const file = e.target.files[0];
                  setPreviewImg(file ? URL.createObjectURL(file) : null);
                }}
                style={{background:'#fff', border:'1px solid #ddd', color:'#333', padding:'7px'}} />
              {previewImg && (
                <div style={{marginTop:8, display:'flex', alignItems:'center', gap:8}}>
                  <img src={previewImg} alt="preview" style={{width:60,height:60,borderRadius:8,objectFit:'cover',border:'1px solid #ddd'}}
                    onError={e=>e.target.style.display='none'} />
                  {form.id && <span style={{fontSize:'0.8rem',color:'#888'}}>Ảnh hiện tại (chọn file mới để thay)</span>}
                </div>
              )}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label style={{color:'#444'}}>Email Đăng Nhập</label>
              <input name="email" type="email" value={form.email} onChange={e=>setForm(f=>({...f, email: e.target.value}))} placeholder="pt@gym.com" style={{background:'#fff', border:'1px solid #ddd', color:'#333'}} />
            </div>
            <div className="form-group">
              <label style={{color:'#444'}}>Mật khẩu {form.id ? '(để trống = không đổi)' : ''}</label>
              <input name="password" type="password" value={form.password} onChange={e=>setForm(f=>({...f, password: e.target.value}))} placeholder="Mật khẩu cho PT" style={{background:'#fff', border:'1px solid #ddd', color:'#333'}} />
            </div>
          </div>
          <div style={{marginTop:10, display:'flex', gap:10}}>
            <button type="submit" className="btn-primary" style={{background:'#ff5252', padding:'10px 24px'}}>{form.id ? 'Cập nhật' : 'Lưu lại'}</button>
            {form.id && <button type="button" className="btn-cancel" onClick={handleCancel} style={{background:'#f1f1f1', color:'#333'}}>Hủy sửa</button>}
          </div>
        </form>
      </div>

      <div className="admin-table-wrap" style={{background:'#fff', border:'none', boxShadow:'0 2px 8px rgba(0,0,0,0.02)'}}>
        <div className="table-header-row" style={{borderBottom:'none', paddingBottom:10}}>
          <h2 style={{color:'#111'}}>Danh sách Huấn luyện viên {trainers.length > 0 && `(Hiển thị trên Trang Chủ)`}</h2>
        </div>
        <div style={{padding:'0 24px 20px', color:'#555'}}>
          <table className="admin-table">
            <thead><tr><th>ẢNH</th><th>HỌ TÊN</th><th>CHUYÊN MÔN</th><th>EMAIL</th><th>RATING</th><th>THAO TÁC</th></tr></thead>
            <tbody>
              {loading
                ? <tr><td colSpan={6} style={{textAlign:'center',padding:24,color:'#333'}}>Đang tải...</td></tr>
                : trainers.length === 0
                  ? <tr><td colSpan={6} style={{textAlign:'center',padding:24,color:'#333'}}>Không có HLV</td></tr>
                  : trainers.map(t => (
                    <tr key={t.trainer_id}>
                      <td>
                        {t.image
                          ? <img src={`${UPLOADS_URL}/${t.image}`} alt="" style={{width:44,height:44,borderRadius:'8px',objectFit:'cover'}} onError={e=>e.target.style.display='none'} />
                          : <div style={{width:44,height:44,borderRadius:'8px',background:'rgba(249,115,22,0.2)',display:'flex',alignItems:'center',justifyContent:'center'}}><i className="bx bxs-user" style={{color:'#f97316'}}></i></div>}
                      </td>
                      <td style={{textAlign:'left'}}><strong style={{color:'#333'}}>{t.full_name}</strong></td>
                      <td style={{color:'#666'}}>{t.specialty||'—'}</td>
                      <td style={{color:'#888', fontSize:'0.85rem'}}>{t.email||'—'}</td>
                      <td><Stars n={Number(t.calculated_rating||5)} /> <span style={{fontSize:'0.85rem',color:'#888'}}>({t.calculated_rating||'5.0'})</span></td>
                      <td>
                        <button className="btn-icon edit" title="Sửa" onClick={() => handleEdit(t)}><i className="bx bxs-edit"></i></button>
                        <button className="btn-icon delete" title="Xóa" onClick={() => handleDelete(t.trainer_id)}><i className="bx bxs-trash"></i></button>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

export default TrainerPage;
