import { useEffect, useState, useCallback } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import '../../components/layout/AdminLayout.css';
import { staffApi } from '../../api/staff';

function Toast({ t }) {
  if (!t.show) return null;
  return <div style={{position:'fixed',top:20,right:20,padding:'12px 20px',borderRadius:10,zIndex:9999,background:t.type==='success'?'#1a2d1a':'#2d1a1a',border:`1px solid ${t.type==='success'?'#22c55e':'#ef4444'}`,color:t.type==='success'?'#86efac':'#fca5a5'}}>{t.msg}</div>;
}

function StaffPage() {
  const [list, setList]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [modal, setModal]     = useState(null);
  const [toast, setToast]     = useState({ show:false, msg:'', type:'success' });

  const showToast = (msg, type='success') => { setToast({show:true,msg,type}); setTimeout(()=>setToast({show:false,msg:'',type:'success'}),3500); };

  const fetchList = useCallback(async () => {
    setLoading(true);
    try { const res = await staffApi.list({ search }); setList(res.data.data||[]); }
    catch { showToast('Lỗi tải dữ liệu!','error'); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchList(); }, [fetchList]);

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa nhân viên này?')) return;
    try {
      await staffApi.delete(id);
      showToast('Đã xóa!'); fetchList();
    } catch (err) {
      showToast(err.response?.data?.error || err.message || 'Lỗi xóa!','error');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = { email: fd.get('email'), password: fd.get('password'), full_name: fd.get('full_name'), phone: fd.get('phone'), salary: fd.get('salary') };
    try {
      await (modal.staff_id ? staffApi.update(modal.staff_id, data) : staffApi.create(data));
      showToast('Lưu thành công!'); setModal(null); fetchList();
    } catch (err) {
      showToast(err.response?.data?.error || err.message || 'Lưu thất bại!','error');
    }
  };

  return (
    <AdminLayout title="Quản lý nhân sự">
      <Toast t={toast} />

      {/* Thẻ Thống Kê */}
      <div style={{background:'#fff', borderRadius:12, padding:'24px', marginBottom:24, boxShadow:'0 2px 8px rgba(0,0,0,0.02)', display:'flex', alignItems:'center', justifyContent:'space-between', width:'250px'}}>
        <div>
            <h2 style={{fontSize:'1.8rem', color:'#111', margin:0}}>{list.length}</h2>
            <p style={{color:'#666', margin:0, fontSize:'0.9rem'}}>Nhân Viên</p>
        </div>
        <div style={{width:45, height:45, borderRadius:8, background:'rgba(59,130,246,0.1)', display:'flex', alignItems:'center', justifyContent:'center'}}>
            <i className="bx bxs-id-card" style={{color:'#3b82f6', fontSize:'1.5rem'}}></i>
        </div>
      </div>

      <div className="search-row">
        <div className="search-input-wrap">
        <i className="bx bx-search"></i>
        <input type="text" placeholder="Nhập tên hoặc email..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key==='Enter'&&fetchList()} />
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <button className="btn-primary" onClick={fetchList} style={{padding:'9px 16px'}}><i className="bx bx-filter-alt"></i> Lọc dữ liệu</button>
        </div>
      </div>

      <div className="admin-table-wrap">
        <div className="table-header-row">
          <h2>Danh sách Staff</h2>
          <div style={{display:'flex', gap:10}}>
            <button className="btn-success" onClick={() => setModal({})}><i className="bx bx-plus"></i> Thêm nhân viên</button>
            <button className="btn-cancel" onClick={() => fetchList()} style={{background:'#f8f9fa', border:'1px solid #ddd', color:'#555'}}><i className="bx bx-refresh"></i> Làm mới</button>
          </div>
        </div>
        
        <table className="admin-table">
          <thead><tr><th>ID</th><th>HỌ TÊN</th><th>EMAIL ĐĂNG NHẬP</th><th>SỐ ĐIỆN THOẠI</th><th>LƯƠNG</th><th>THAO TÁC</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={6} style={{textAlign:'center',padding:24,color:'#555'}}>Đang tải...</td></tr>
            : list.length===0 ? <tr><td colSpan={6} style={{textAlign:'center',padding:24,color:'#555'}}>Không có nhân viên</td></tr>
            : list.map(s => {
              const id = s.admin_id || s.staff_id || s.id;
              const phone = s.phone_number || s.phone;
              return (
              <tr key={id}>
                <td style={{color:'#666'}}>#{id}</td>
                <td><strong style={{color:'#333'}}>{s.full_name}</strong></td>
                <td style={{color:'#666'}}>{s.email}</td>
                <td style={{color:'#666'}}>{phone || '—'}</td>
                <td><strong style={{color:'#333'}}>{s.salary ? Number(s.salary).toLocaleString('vi-VN')+'đ' : '—'}</strong></td>
                <td>
                  <button className="btn-icon edit" onClick={() => setModal({...s, staff_id: id, phone: phone})}><i className="bx bxs-edit"></i></button>
                  <button className="btn-icon delete" onClick={() => handleDelete(id)}><i className="bx bxs-trash"></i></button>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {modal !== null && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">{modal.staff_id ? 'Sửa nhân viên' : 'Thêm nhân viên mới'}</h3>
            <form onSubmit={handleSave}>
              <input type="hidden" name="staff_id" value={modal.staff_id||''} />
              <div className="form-group"><label>Họ và tên *</label><input name="full_name" required defaultValue={modal.full_name||''} placeholder="Nhập tên..." /></div>
              <div className="form-group"><label>Email *</label><input name="email" type="email" required defaultValue={modal.email||''} placeholder="Email..." /></div>
              <div className="form-group"><label>Mật khẩu {modal.staff_id?'(để trống = không đổi)':''}</label><input name="password" type="password" placeholder="Mật khẩu..." /></div>
              <div className="form-row">
                <div className="form-group"><label>Điện thoại</label><input name="phone" defaultValue={modal.phone||''} placeholder="SĐT..." /></div>
                <div className="form-group"><label>Lương (đ)</label><input name="salary" type="number" defaultValue={modal.salary||''} placeholder="Lương..." /></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setModal(null)}>Hủy</button>
                <button type="submit" className="btn-primary">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default StaffPage;
