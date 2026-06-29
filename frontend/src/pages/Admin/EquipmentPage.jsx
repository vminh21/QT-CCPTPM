import { useEffect, useState, useRef, useCallback } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import '../../components/layout/AdminLayout.css';
import { equipmentApi } from '../../api/equipment';

function Toast({ t }) {
  if (!t.show) return null;
  return <div style={{position:'fixed',top:20,right:20,padding:'12px 20px',borderRadius:10,zIndex:9999,background:t.type==='success'?'#1a2d1a':'#2d1a1a',border:`1px solid ${t.type==='success'?'#22c55e':'#ef4444'}`,color:t.type==='success'?'#86efac':'#fca5a5'}}>{t.msg}</div>;
}

const STATUS_LABELS = { 'Hoạt động':'Hoạt động', 'Bảo trì':'Đang bảo trì', 'Hỏng':'Đã hỏng' };
const STATUS_COLORS = { 'Hoạt động':'#22c55e', 'Bảo trì':'#f59e0b', 'Hỏng':'#ef4444' };

function EquipmentPage() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [form,    setForm]    = useState({ id:'', name:'', category:'Máy Cardio', quantity:1, status:'Hoạt động', purchase_date: new Date().toISOString().split('T')[0] });
  const [toast,   setToast]   = useState({ show:false, msg:'', type:'success' });
  const formRef = useRef(null);

  const showToast = (msg, type='success') => { setToast({show:true,msg,type}); setTimeout(()=>setToast({show:false,msg:'',type:'success'}),3500); };

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try { const res = await equipmentApi.list({ search }); setItems(res.data.data||[]); }
    catch { showToast('Lỗi tải!','error'); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa thiết bị này?')) return;
    try {
      await equipmentApi.delete(id);
      showToast('Đã xóa!'); fetchItems();
    } catch (err) {
      showToast(err.response?.data?.error || err.message || 'Lỗi!','error');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const data = { name: form.name, category: form.category, quantity: form.quantity, status: form.status, purchase_date: form.purchase_date };
    try {
      await (form.id ? equipmentApi.update(form.id, data) : equipmentApi.create(data));
      showToast('Lưu thành công!'); 
      setForm({ id:'', name:'', category:'Máy Cardio', quantity:1, status:'Hoạt động', purchase_date: new Date().toISOString().split('T')[0] });
      fetchItems(); 
    } catch (err) {
      showToast(err.response?.data?.error || err.message || 'Lưu thất bại!','error');
    }
  };

  const handleEdit = (eq) => {
      setForm({ id: eq.equipment_id, name: eq.name, category: eq.category||eq.type||'Máy Cardio', quantity: eq.quantity, status: eq.status, purchase_date: eq.purchase_date||new Date().toISOString().split('T')[0] });
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleCancel = () => {
      setForm({ id:'', name:'', category:'Máy Cardio', quantity:1, status:'Hoạt động', purchase_date: new Date().toISOString().split('T')[0] });
  }

  return (
    <AdminLayout title="Quản lý máy tập">
      <Toast t={toast} />
      
      <div style={{background:'#fff', borderRadius:12, padding:'24px', marginBottom:24, boxShadow:'0 2px 8px rgba(0,0,0,0.02)'}}>
        <h2 style={{fontSize:'1.2rem', color:'#111', marginBottom:20}}>{form.id ? 'Sửa máy tập' : 'Nhập máy tập mới'}</h2>
        <form ref={formRef} onSubmit={handleSave}>
          <div className="form-row">
            <div className="form-group">
                <label style={{color:'#444'}}>Tên Thiết Bị / Máy</label>
                <input name="name" required value={form.name} onChange={e=>setForm(f=>({...f, name: e.target.value}))} placeholder="Vd: Máy chạy bộ mofit 1" style={{background:'#fff', border:'1px solid #ddd', color:'#333'}} />
            </div>
            <div className="form-group">
                <label style={{color:'#444'}}>Phân loại danh mục</label>
                <select name="category" value={form.category} onChange={e=>setForm(f=>({...f, category: e.target.value}))} style={{background:'#fff', border:'1px solid #ddd', color:'#333'}}>
                    <option value="Máy Cardio">Máy Cardio</option>
                    <option value="Thể hình">Thể hình</option>
                    <option value="Tạ">Tạ</option>
                    <option value="Phụ kiện">Phụ kiện fitness</option>
                </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
                <label style={{color:'#444'}}>Số lượng kho</label>
                <input name="quantity" type="number" min="0" value={form.quantity} onChange={e=>setForm(f=>({...f, quantity: e.target.value}))} style={{background:'#fff', border:'1px solid #ddd', color:'#333'}} />
            </div>
            <div className="form-group">
                <label style={{color:'#444'}}>Tình trạng sử dụng</label>
                <select name="status" value={form.status} onChange={e=>setForm(f=>({...f, status: e.target.value}))} style={{background:'#fff', border:'1px solid #ddd', color:'#333'}}>
                    <option value="Hoạt động">Hoạt động tốt</option>
                    <option value="Bảo trì">Đang bảo trì/sửa</option>
                    <option value="Hỏng">Đã hỏng/Kém</option>
                </select>
            </div>
          </div>
          <div className="form-group" style={{maxWidth: 'calc(50% - 8px)'}}>
            <label style={{color:'#444'}}>Ngày nhập máy về</label>
            <input name="purchase_date" type="date" value={form.purchase_date} onChange={e=>setForm(f=>({...f, purchase_date: e.target.value}))} style={{background:'#fff', border:'1px solid #ddd', color:'#333'}} />
          </div>
          <div style={{marginTop: 10}}>
            <button type="submit" className="btn-primary" style={{background:'#ff5252', padding:'10px 24px'}}>{form.id ? 'Cập nhật Máy Tập' : 'Thêm Máy Tập'}</button>
            {form.id && <button type="button" className="btn-cancel" onClick={handleCancel} style={{marginLeft: 10, background: '#f1f1f1', color: '#333'}}>Hủy sửa</button>}
          </div>
        </form>
      </div>

      <div className="search-row" style={{marginBottom: 24}}>
        <div className="search-input-wrap">
            <i className="bx bx-search"></i>
            <input type="text" placeholder="Nhập tên máy hoặc loại cần tìm..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key==='Enter'&&fetchItems()} />
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <button className="btn-primary" onClick={fetchItems} style={{padding:'9px 16px'}}><i className="bx bx-filter-alt"></i> Lọc dữ liệu</button>
        </div>
      </div>

      <div className="admin-table-wrap" style={{background:'#fff', border:'none', boxShadow:'0 2px 8px rgba(0,0,0,0.02)'}}>
        <div className="table-header-row" style={{borderBottom:'none', paddingBottom:10}}>
          <h2 style={{color:'#111'}}>Kho thiết bị và Máy tập luyện</h2>
        </div>
        <div style={{padding:'0 24px 20px',color:'#555'}}>
            <table className="admin-table">
            <thead><tr><th>TÊN MÁY TẬP</th><th>PHÂN LOẠI</th><th>SL.</th><th>TÌNH TRẠNG</th><th>NGÀY NHẬP</th><th>KIỂM SOÁT</th></tr></thead>
            <tbody>
                {loading ? <tr><td colSpan={6} style={{textAlign:'center',padding:24,color:'#333'}}>Đang tải...</td></tr>
                : items.length===0 ? <tr><td colSpan={6} style={{textAlign:'center',padding:24,color:'#333'}}>Không có máy tập</td></tr>
                : items.map(eq => (
                <tr key={eq.equipment_id}>
                    <td style={{textAlign:'left'}}><strong style={{color:'#333'}}>{eq.name}</strong></td>
                    <td style={{color:'#666'}}>{eq.category||eq.type||'—'}</td>
                    <td style={{color:'#666'}}>{eq.quantity}</td>
                    <td>
                        <span className="badge" 
                              style={{background: STATUS_COLORS[eq.status] || '#888', color: '#fff', border:'none'}}>
                            {STATUS_LABELS[eq.status] || eq.status}
                        </span>
                    </td>
                    <td style={{color:'#666'}}>{eq.purchase_date ? new Date(eq.purchase_date).toLocaleDateString('vi-VN') : '—'}</td>
                    <td>
                    <button className="btn-icon edit" onClick={() => handleEdit(eq)}><i className="bx bxs-edit"></i></button>
                    <button className="btn-icon delete" onClick={() => handleDelete(eq.equipment_id)}><i className="bx bxs-trash"></i></button>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
      </div>

    </AdminLayout>
  );
}

export default EquipmentPage;
