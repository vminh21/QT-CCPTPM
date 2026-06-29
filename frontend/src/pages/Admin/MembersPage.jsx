import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import '../../components/layout/AdminLayout.css';
import { membersApi } from '../../api/members';
import { packagesApi } from '../../api/packages';

const STATUS_MAP = {
  Active:   { label: 'Hoạt động', cls: 'badge-active' },
  Inactive: { label: 'Bị khóa',   cls: 'badge-locked' },
  Expired:  { label: 'Hết hạn',   cls: 'badge-expired' },
};

function Toast({ toast }) {
  if (!toast.show) return null;
  return (
    <div style={{position:'fixed',top:20,right:20,display:'flex',alignItems:'center',gap:10,
      padding:'12px 20px',borderRadius:10,fontSize:'0.9rem',fontWeight:500,zIndex:9999,
      background:toast.type==='success'?'#1a2d1a':'#2d1a1a',
      border:`1px solid ${toast.type==='success'?'#22c55e':'#ef4444'}`,
      color:toast.type==='success'?'#86efac':'#fca5a5'}}>
      <i className={`bx ${toast.type==='success'?'bxs-check-circle':'bxs-error-circle'}`} style={{fontSize:'1.2rem'}}></i>
      {toast.msg}
    </div>
  );
}

function MemberModal({ data, onClose, onSave, packages }) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState(data || { full_name:'', phone_number:'', address:'', package_id:'', start_date: today, end_date:'', status:'Active' });
  const [submitting, setSubmitting] = useState(false);

  const f = (field, val) => setForm(p => ({ ...p, [field]: val }));

  const calcEnd = (pkgId, startDate) => {
    const pkg = packages.find(p => String(p.package_id) === String(pkgId));
    if (!pkg || !startDate) return '';
    const d = new Date(startDate);
    d.setDate(d.getDate() + parseInt(pkg.duration_days || 30));
    return d.toISOString().split('T')[0];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = data?.member_id
        ? await membersApi.update(data.member_id, form)
        : await membersApi.create(form);
      onSave(res.data);
    } catch (err) {
      alert(err.response?.data?.error || err.message || 'Thao tác thất bại!');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{maxWidth:520}} onClick={e => e.stopPropagation()}>
        <h3 className="modal-title">{data?.member_id ? `Sửa hội viên #${data.member_id}` : 'Thêm hội viên mới'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Họ và Tên *</label>
            <input type="text" required value={form.full_name} onChange={e => f('full_name', e.target.value)} placeholder="Nhập họ tên..." />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Số điện thoại</label>
              <input type="tel" value={form.phone_number||''} onChange={e => f('phone_number', e.target.value)} placeholder="SĐT..." />
            </div>
            <div className="form-group">
              <label>Trạng thái</label>
              <select value={form.status||'Active'} onChange={e => f('status', e.target.value)}>
                <option value="Active">Hoạt động</option>
                <option value="Inactive">Khóa</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Địa chỉ</label>
            <input type="text" value={form.address||''} onChange={e => f('address', e.target.value)} placeholder="Địa chỉ..." />
          </div>
          <div className="form-group">
            <label>Gói tập</label>
            <select value={form.package_id||''}
              onChange={e => { f('package_id', e.target.value); f('end_date', calcEnd(e.target.value, form.start_date)); }}>
              <option value="">-- Không đăng ký --</option>
              {packages.map(p => (
                <option key={p.package_id} value={p.package_id}>
                  {p.package_name} — {Number(p.price).toLocaleString('vi-VN')}đ
                </option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Ngày bắt đầu</label>
              <input type="date" value={form.start_date} onChange={e => { f('start_date', e.target.value); f('end_date', calcEnd(form.package_id, e.target.value)); }} />
            </div>
            <div className="form-group">
              <label>Ngày hết hạn</label>
              <input type="date" value={form.end_date||''} readOnly style={{background:'rgba(255,255,255,0.03)',cursor:'not-allowed'}} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>Hủy</button>
            <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Đang lưu...' : 'Lưu dữ liệu'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function MembersPage() {
  const [members, setMembers] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState({ q: '', package: '', status: '' });
  const [modal, setModal]     = useState(null);
  const [toast, setToast]     = useState({ show: false, msg: '', type: 'success' });

  const showToast = (msg, type='success') => {
    setToast({ show:true, msg, type });
    setTimeout(() => setToast({ show:false, msg:'', type:'success' }), 3500);
  };

  useEffect(() => {
    packagesApi.list().then(res => setPackages(res.data.data || [])).catch(() => {});
  }, []);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await membersApi.list({ search: search.q, filter_package: search.package, filter_status: search.status });
      setMembers(res.data.data || []);
    } catch { showToast('Lỗi tải dữ liệu!', 'error'); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const handleToggle = async (id, current) => {
    const res = await membersApi.toggleStatus(id, current);
    if (res.data.success) { showToast('Đã cập nhật trạng thái!'); fetchMembers(); }
    else showToast('Lỗi!', 'error');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xác nhận xóa hội viên này?')) return;
    const res = await membersApi.delete(id);
    if (res.data.success) { showToast('Đã xóa hội viên!'); fetchMembers(); }
    else showToast(res.data.message || 'Lỗi xóa!', 'error');
  };

  const handleSave = (result) => {
    if (result.success) { showToast('Lưu thành công!'); setModal(null); fetchMembers(); }
    else showToast(result.message || 'Có lỗi xảy ra!', 'error');
  };

  const getStatus = (row) => {
    const today = new Date().toISOString().split('T')[0];
    const expired = row.end_date && today > row.end_date;
    if (row.m_status === 'Inactive' && expired) return { label: 'Bị khóa & Hết hạn', cls: 'badge-expired' };
    if (row.m_status === 'Inactive') return { label: 'Bị khóa', cls: 'badge-locked' };
    if (expired) return { label: 'Hết hạn', cls: 'badge-expired' };
    return { label: 'Hoạt động', cls: 'badge-active' };
  };

  const formatDate = (s) => s ? new Date(s).toLocaleDateString('vi-VN') : '—';

  return (
    <AdminLayout title="Danh sách hội viên">
      <Toast toast={toast} />
      <div className="search-row">
        <div className="search-input-wrap">
          <i className="bx bx-search"></i>
          <input type="text" placeholder="Tìm tên hội viên..." value={search.q}
            onChange={e => setSearch(s => ({...s, q: e.target.value}))}
            onKeyDown={e => e.key === 'Enter' && fetchMembers()} />
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <select className="filter-select" value={search.package} onChange={e => setSearch(s => ({...s, package: e.target.value}))}>
            <option value="">-- Tất cả gói --</option>
            {packages.map(p => <option key={p.package_id} value={p.package_id}>{p.package_name}</option>)}
          </select>
          <select className="filter-select" value={search.status} onChange={e => setSearch(s => ({...s, status: e.target.value}))}>
            <option value="">-- Trạng thái --</option>
            <option value="Active">Đang hoạt động</option>
            <option value="Inactive">Bị khóa</option>
            <option value="Expired">Hết hạn</option>
          </select>
          <button className="btn-primary" onClick={fetchMembers} style={{padding:'9px 16px'}}><i className="bx bx-filter-alt"></i> Lọc dữ liệu</button>
          {(search.q || search.package || search.status) && <button className="btn-cancel" onClick={() => setSearch({q:'',package:'',status:''})}>Xóa lọc</button>}
        </div>
      </div>

      <div className="admin-table-wrap">
        <div className="table-header-row">
          <h2>Danh sách hội viên</h2>
          <button className="btn-success" onClick={() => setModal({})}>
            <i className="bx bx-plus-circle"></i> THÊM HỘI VIÊN
          </button>
        </div>
        <table className="admin-table">
          <thead><tr><th>ID</th><th>HỌ VÀ TÊN</th><th>GÓI TẬP</th><th>THỜI HẠN</th><th>TRẠNG THÁI</th><th>THAO TÁC</th></tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{textAlign:'center',padding:30}}>Đang tải...</td></tr>
            ) : members.length === 0 ? (
              <tr><td colSpan={6} style={{textAlign:'center',padding:30}}>Không tìm thấy hội viên</td></tr>
            ) : members.map(row => {
              const s = getStatus(row);
              return (
                <tr key={row.member_id}>
                  <td style={{color:'#666'}}>#{row.member_id}</td>
                  <td><strong>{row.full_name}</strong><br/><small style={{color:'#666'}}>{row.phone_number||''}</small></td>
                  <td><span className={row.package_name ? "badge badge-expired" : "badge badge-locked"} style={{background: row.package_name ? 'rgba(245, 158, 11, 0.1)' : 'rgba(100,116,139,0.1)', color: row.package_name ? '#d97706' : '#64748b'}}>{row.package_name || 'Chưa đăng ký'}</span></td>
                  <td style={{color:'#666'}}>{formatDate(row.end_date)}</td>
                  <td><span className={`badge ${s.cls}`}>{s.label}</span></td>
                  <td>
                    <button className="btn-icon edit" onClick={() => setModal(row)} title="Sửa"><i className="bx bxs-edit"></i></button>
                    <button className="btn-icon" style={{color: row.m_status==='Active'?'#22c55e':'#eab308'}}
                      onClick={() => handleToggle(row.member_id, row.m_status)} title={row.m_status==='Active'?'Khóa':'Mở khóa'}>
                      <i className={`bx ${row.m_status==='Active'?'bxs-lock-open':'bxs-lock'}`}></i>
                    </button>
                    <button className="btn-icon delete" onClick={() => handleDelete(row.member_id)} title="Xóa"><i className="bx bxs-trash"></i></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {modal !== null && <MemberModal data={modal.member_id ? modal : null} packages={packages} onClose={() => setModal(null)} onSave={handleSave} />}
    </AdminLayout>
  );
}

export default MembersPage;
