import { useEffect, useState, useRef } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import '../../components/layout/AdminLayout.css';
import { notificationsApi } from '../../api/notifications';
import { UPLOADS_URL } from '../../config';


function NotificationPage() {
  const [list,    setList]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [form,    setForm]    = useState({ id: '', title:'', message:'' });
  const [toast,   setToast]   = useState({ show:false, msg:'', type:'success' });
  const fileInputRef = useRef(null);

  const showToast = (msg, type='success') => { setToast({show:true,msg,type}); setTimeout(()=>setToast({show:false,msg:'',type:'success'}),3500); };

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await notificationsApi.list();
      setList(res.data.data || []);
    } catch { setList([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchList(); }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('title', form.title);
    fd.append('content', form.message);
    if(fileInputRef.current?.files?.[0]) fd.append('image', fileInputRef.current.files[0]);
    try {
      await (form.id ? notificationsApi.update(form.id, fd) : notificationsApi.create(fd));
      showToast(form.id ? 'Cập nhật thành công!' : 'Đã đăng thông báo thành công!', 'success');
      setForm({ id:'', title:'', message:'' });
      if(fileInputRef.current) fileInputRef.current.value = '';
      fetchList();
    } catch(err) {
      showToast(err.response?.data?.error || err.message || 'Lưu thất bại!', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xác nhận xóa thông báo này?')) return;
    try {
      await notificationsApi.delete(id);
      showToast('Đã xóa!'); fetchList();
    } catch(err) {
      showToast(err.response?.data?.error || err.message || 'Lỗi!', 'error');
    }
  };

  const handleEdit = (n) => {
      setForm({ id: n.notification_id, title: n.title, message: n.content });
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AdminLayout title="Quản lý thông báo">
      {toast.show && <div style={{position:'fixed',top:20,right:20,padding:'12px 20px',borderRadius:10,zIndex:9999,background:toast.type==='success'?'#1a2d1a':'#2d1a1a',border:`1px solid ${toast.type==='success'?'#22c55e':'#ef4444'}`,color:toast.type==='success'?'#86efac':'#fca5a5'}}>{toast.msg}</div>}

      <div style={{background:'#fff', borderRadius:12, padding:'24px', marginBottom:24, boxShadow:'0 2px 8px rgba(0,0,0,0.02)'}}>
        <h2 style={{fontSize:'1.2rem', color:'#111', marginBottom:20}}>{form.id ? 'Sửa thông báo' : 'Thêm thông báo mới'}</h2>
        <form onSubmit={handleSend}>
          <div className="form-row">
            <div className="form-group">
                <label style={{color:'#444'}}>Tiêu đề thông báo</label>
                <input required value={form.title} onChange={e => setForm(f=>({...f,title:e.target.value}))} placeholder="Nhập tiêu đề..." style={{background:'#fff', border:'1px solid #ddd', color:'#333'}} />
            </div>
            <div className="form-group">
                <label style={{color:'#444'}}>Hình ảnh (Chấp nhận .jpg, .png)</label>
                <input type="file" ref={fileInputRef} accept="image/*" style={{background:'#fff', border:'1px solid #ddd', color:'#333', padding:'7px'}} />
            </div>
          </div>
          <div className="form-group">
            <label style={{color:'#444'}}>Nội dung thông báo</label>
            <textarea required value={form.message} onChange={e => setForm(f=>({...f,message:e.target.value}))} placeholder="Nhập nội dung chi tiết..."
              style={{width:'100%',minHeight:120,background:'#fff',border:'1px solid #ddd',borderRadius:8,color:'#333',padding:'10px 14px',fontSize:'0.9rem',outline:'none',resize:'vertical'}}></textarea>
          </div>
          <div>
            <button type="submit" className="btn-primary" style={{background:'#ff5252', padding:'10px 24px'}}>{form.id ? 'Cập nhật' : 'Đăng thông báo'}</button>
            {form.id && <button type="button" className="btn-cancel" onClick={() => setForm({id:'',title:'',message:''})} style={{marginLeft: 10, background: '#f1f1f1', color: '#333'}}>Hủy sửa</button>}
          </div>
        </form>
      </div>

      <div className="admin-table-wrap" style={{background:'#fff', border:'none', boxShadow:'0 2px 8px rgba(0,0,0,0.02)'}}>
        <div className="table-header-row" style={{borderBottom:'none', paddingBottom:10}}>
          <h2 style={{color:'#111'}}>Thông báo đã đăng</h2>
        </div>
        <div style={{padding:'0 24px 20px',color:'#555'}}>
          {loading ? 'Đang tải...' : (list.length === 0 ? 'Không có thông báo nào' : (
            <table className="admin-table">
              <thead><tr><th>ẢNH</th><th>TIÊU ĐỀ</th><th>NGÀY TẠO</th><th>NGƯỜI TẠO</th><th>THAO TÁC</th></tr></thead>
              <tbody>
                {list.map((n, i) => (
                  <tr key={i}>
                    <td>
                      {n.image
                        ? <img src={`${UPLOADS_URL}/${n.image}`} style={{width:50, height:50, objectFit:'cover', borderRadius:6}} alt="" />
                        : <div style={{width:50,height:50,background:'#eee',borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center'}}><i className='bx bx-image' style={{color:'#aaa',fontSize:'1.5rem'}}></i></div>
                      }
                    </td>
                    <td style={{textAlign:'left'}}><strong style={{color:'#333'}}>{n.title}</strong></td>
                    <td style={{color:'#666'}}>{n.created_at ? new Date(n.created_at).toLocaleDateString('vi-VN') : '—'}</td>
                    <td style={{color:'#666'}}>{n.creator_name || 'Admin'}</td>
                    <td>
                        <button className="btn-icon edit" onClick={() => handleEdit(n)}><i className="bx bxs-edit"></i></button>
                        <button className="btn-icon delete" onClick={() => handleDelete(n.notification_id)}><i className="bx bxs-trash"></i></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}

export default NotificationPage;
