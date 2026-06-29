import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import '../../components/layout/AdminLayout.css';
import { dashboardApi } from '../../api/dashboard';
import { transactionsApi } from '../../api/transactions';

function Toast({ toast }) {
  if (!toast.show) return null;
  return (
    <div style={{
      position:'fixed', top:20, right:20, display:'flex', alignItems:'center', gap:10,
      padding:'12px 20px', borderRadius:10, fontSize:'0.9rem', fontWeight:500, zIndex:9999,
      background: toast.type === 'success' ? '#1a2d1a' : '#2d1a1a',
      border: `1px solid ${toast.type === 'success' ? '#22c55e' : '#ef4444'}`,
      color: toast.type === 'success' ? '#86efac' : '#fca5a5',
      animation: 'slideIn 0.3s ease'
    }}>
      <i className={`bx ${toast.type === 'success' ? 'bxs-check-circle' : 'bxs-error-circle'}`} style={{fontSize:'1.2rem'}}></i>
      {toast.msg}
    </div>
  );
}

function TransactionModal({ mode, data, memberList, onClose, onSave }) {
  const [form, setForm] = useState(
    data || { member_id: '', amount: '', transaction_type: 'Registration', payment_method: 'Tiền mặt', end_date: '' }
  );
  const [newMember, setNewMember]   = useState(false);
  const [newName, setNewName]       = useState('');
  const [submitting, setSubmitting] = useState(false);

  const PACKAGES = [
    { value: '500000',  months: 1,  label: 'Gói 1 tháng - 500.000đ' },
    { value: '1350000', months: 3,  label: 'Gói 3 tháng - 1.350.000đ' },
    { value: '5000000', months: 12, label: 'Gói 1 năm - 5.000.000đ' },
  ];

  const calcEndDate = (amount) => {
    const pkg = PACKAGES.find(p => p.value === amount);
    if (!pkg) return '';
    const d = new Date();
    d.setMonth(d.getMonth() + pkg.months);
    return d.toISOString().split('T')[0];
  };

  const f = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...form };
      if (newMember) payload.new_member_name = newName;
      const res = mode === 'add'
        ? await transactionsApi.create(payload)
        : await transactionsApi.update(data.transaction_id, payload);
      onSave(res.data);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Thao tác thất bại!';
      alert(msg);
    } finally { setSubmitting(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <h3 className="modal-title">
          {mode === 'add' ? 'Thêm giao dịch mới' : `Sửa giao dịch #${data?.transaction_id}`}
        </h3>
        <form onSubmit={handleSubmit}>
          {mode === 'add' && (
            <>
              <div className="form-group">
                <label>Thành viên</label>
                <select value={newMember ? 'new' : form.member_id} onChange={e => {
                  if (e.target.value === 'new') { setNewMember(true); f('member_id', ''); }
                  else { setNewMember(false); f('member_id', e.target.value); }
                }}>
                  <option value="">-- Chọn thành viên --</option>
                  <option value="new" style={{color:'#f97316',fontWeight:'bold'}}>+ THÊM NGƯỜI MỚI</option>
                  {memberList.map(m => <option key={m.member_id} value={m.member_id}>{m.full_name}</option>)}
                </select>
              </div>
              {newMember && (
                <div className="form-group">
                  <label>Tên thành viên mới</label>
                  <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nhập tên..." />
                </div>
              )}
            </>
          )}

          <div className="form-row">
            <div className="form-group">
              <label>Gói tập & Số tiền</label>
              <select value={form.amount} onChange={e => { f('amount', e.target.value); f('end_date', calcEndDate(e.target.value)); }} required>
                <option value="">-- Chọn gói --</option>
                {PACKAGES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Ngày hết hạn</label>
              <input type="date" value={form.end_date} readOnly style={{background:'rgba(255,255,255,0.03)', cursor:'not-allowed'}} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Loại giao dịch</label>
              <select value={form.transaction_type} onChange={e => f('transaction_type', e.target.value)}>
                <option value="Registration">Đăng ký mới</option>
                <option value="Renewal">Gia hạn</option>
              </select>
            </div>
            <div className="form-group">
              <label>Phương thức</label>
              <select value={form.payment_method} onChange={e => f('payment_method', e.target.value)}>
                <option value="Tiền mặt">Tiền mặt</option>
                <option value="Chuyển khoản">Chuyển khoản</option>
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>Hủy</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Đang lưu...' : (mode === 'add' ? 'Lưu giao dịch' : 'Cập nhật')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DashboardPage() {
  const [stats, setStats]           = useState(null);
  const [transactions, setTrans]    = useState([]);
  const [memberList, setMemberList] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState({ name: '', type: '' });
  const [modal, setModal]           = useState(null);
  const [toast, setToast]           = useState({ show: false, msg: '', type: 'error' });

  const showToast = (msg, type = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type: 'error' }), 3500);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, transRes, membersRes] = await Promise.all([
        dashboardApi.stats(),
        transactionsApi.list({ search_name: search.name, search_type: search.type }),
        dashboardApi.members(),
      ]);
      setStats(statsRes.data.data);
      setTrans(transRes.data.data || []);
      setMemberList(membersRes.data.data || []);
    } catch { showToast('Lỗi tải dữ liệu!', 'error'); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async (id) => {
    if (!window.confirm('Xác nhận xóa giao dịch này?')) return;
    const res = await transactionsApi.delete(id);
    if (res.data.success) { showToast('Đã xóa giao dịch!'); fetchData(); }
    else showToast(res.data.message || 'Lỗi xóa!', 'error');
  };

  const handleSave = (result) => {
    if (result.success) {
      showToast(modal.mode === 'add' ? 'Đã thêm giao dịch!' : 'Đã cập nhật!');
      setModal(null);
      fetchData();
    } else showToast(result.message || 'Có lỗi xảy ra!', 'error');
  };

  const formatMoney = (n) => Number(n).toLocaleString('vi-VN') + 'đ';
  const formatDate  = (s) => s ? new Date(s).toLocaleDateString('vi-VN') : '—';

  return (
    <AdminLayout title="Tổng quan hệ thống">
      <Toast toast={toast} />

      <div className="stats-grid">
        {[
          { label: 'Thành Viên',  value: stats?.total_members   ?? '—', icon: 'bxs-group',       cls: 'icon-blue' },
          { label: 'Đang Tập',   value: stats?.active_members  ?? '—', icon: 'bxs-check-circle', cls: 'icon-green' },
          { label: 'Hết Hạn',    value: stats?.expired_members ?? '—', icon: 'bxs-x-circle',     cls: 'icon-red' },
          { label: 'Doanh Thu',  value: stats ? formatMoney(stats.total_revenue) : '—', icon: 'bxs-wallet', cls: 'icon-gold' },
        ].map((s, i) => (
          <div className="stat-card" key={i}>
            <div className="stat-info"><h3>{loading ? '...' : s.value}</h3><p>{s.label}</p></div>
            <div className={`stat-icon ${s.cls}`}><i className={`bx ${s.icon}`}></i></div>
          </div>
        ))}
      </div>

      <div className="search-row">
        <div className="search-input-wrap">
          <i className="bx bx-search"></i>
          <input type="text" placeholder="Nhập tên hội viên cần tìm..." value={search.name}
            onChange={e => setSearch(s => ({ ...s, name: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && fetchData()} />
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <select className="filter-select" value={search.type} onChange={e => setSearch(s => ({ ...s, type: e.target.value }))}>
            <option value="">-- Loại giao dịch --</option>
            <option value="Registration">Đăng ký mới</option>
            <option value="Renewal">Gia hạn</option>
          </select>
          <button className="btn-primary" onClick={fetchData} style={{padding:'9px 16px'}}>
            <i className="bx bx-filter-alt"></i> Lọc dữ liệu
          </button>
          {(search.name || search.type) && (
            <button className="btn-cancel" onClick={() => setSearch({ name: '', type: '' })}>Xóa lọc</button>
          )}
        </div>
      </div>

      <div className="admin-table-wrap">
        <div className="table-header-row">
          <h2>Danh sách giao dịch gần đây</h2>
          <button className="btn-success" onClick={() => setModal({ mode: 'add' })}>
            <i className="bx bx-plus"></i> Thêm giao dịch
          </button>
        </div>

        <table className="admin-table">
          <thead>
            <tr><th>ID</th><th>Hội viên</th><th>Loại</th><th>Số Tiền</th><th>Ngày GD</th><th>Hạn dùng</th><th>Thao tác</th></tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{textAlign:'center',padding:30}}>Đang tải...</td></tr>
            ) : transactions.length === 0 ? (
              <tr><td colSpan={7} style={{textAlign:'center',padding:30}}>Không tìm thấy dữ liệu</td></tr>
            ) : transactions.map(row => (
              <tr key={row.transaction_id}>
                <td>#{row.transaction_id}</td>
                <td><strong>{row.full_name}</strong></td>
                <td>
                  <span className={`badge ${row.transaction_type === 'Registration' ? 'badge-reg' : 'badge-renew'}`}>
                    {row.transaction_type === 'Registration' ? 'Đăng ký' : 'Gia hạn'}
                  </span>
                </td>
                <td><strong>{formatMoney(row.amount)}</strong></td>
                <td>{formatDate(row.transaction_date)}</td>
                <td>{formatDate(row.end_date)}</td>
                <td>
                  <button className="btn-icon edit" onClick={() => setModal({ mode: 'edit', data: row })} title="Sửa">
                    <i className="bx bxs-edit"></i>
                  </button>
                  <button className="btn-icon delete" onClick={() => handleDelete(row.transaction_id)} title="Xóa">
                    <i className="bx bxs-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <TransactionModal
          mode={modal.mode}
          data={modal.data}
          memberList={memberList}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </AdminLayout>
  );
}

export default DashboardPage;
