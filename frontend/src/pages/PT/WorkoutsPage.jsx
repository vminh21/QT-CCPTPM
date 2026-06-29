import { useEffect, useState } from 'react';
import { PTLayout } from '../../components/layout/PTLayout';
import '../../components/layout/AdminLayout.css';
import './PT.css';
import { ptApi } from '../../api/pt';

function WorkoutsPage() {
  const [workouts, setWorkouts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(null);
  const [toast,    setToast]    = useState({show:false,msg:'',type:'success'});

  const showToast = (msg,type='success') => { setToast({show:true,msg,type}); setTimeout(()=>setToast({show:false,msg:'',type:'success'}),3500); };

  const fetchWorkouts = async () => {
    setLoading(true);
    ptApi.getWorkouts().then(r => setWorkouts(r.data.data||[])).finally(()=>setLoading(false));
  };

  useEffect(() => { fetchWorkouts(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = { title: fd.get('title'), description: fd.get('description'), difficulty: fd.get('difficulty'), duration_weeks: fd.get('duration_weeks'), content: fd.get('content') };
    const r = modal.workout_id
      ? await ptApi.updateWorkout(modal.workout_id, data)
      : await ptApi.createWorkout(data);
    if (r.data.success) { showToast('Lưu thành công!'); setModal(null); fetchWorkouts(); }
    else showToast(r.data.message||'Lỗi!','error');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa giáo trình này?')) return;
    const r = await ptApi.deleteWorkout(id);
    if (r.data.success) { showToast('Đã xóa!'); fetchWorkouts(); } else showToast('Lỗi!','error');
  };

  const DIFF_COLORS = { 'Cơ bản':'#22c55e', 'Trung bình':'#eab308', 'Nâng cao':'#ef4444' };

  return (
    <PTLayout title="Giáo trình tập luyện">
      {toast.show && <div style={{position:'fixed',top:20,right:20,padding:'12px 20px',borderRadius:10,zIndex:9999,background:toast.type==='success'?'#1a2d1a':'#2d1a1a',border:`1px solid ${toast.type==='success'?'#22c55e':'#ef4444'}`,color:toast.type==='success'?'#86efac':'#fca5a5'}}>{toast.msg}</div>}

      <div className="admin-table-wrap">
        <div className="table-header-row">
          <h2>Giáo trình ({workouts.length})</h2>
          <button className="btn-primary" style={{background:'linear-gradient(135deg,#22c55e,#16a34a)'}} onClick={() => setModal({})}><i className="bx bx-plus"></i> Thêm giáo trình</button>
        </div>
        <table className="admin-table">
          <thead><tr><th>Tên giáo trình</th><th>Mô tả</th><th>Độ khó</th><th>Thời gian</th><th>Thao tác</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={5} style={{textAlign:'center',padding:24,color:'#555'}}>Đang tải...</td></tr>
            : workouts.length===0 ? <tr><td colSpan={5} style={{textAlign:'center',padding:24,color:'#555'}}>Chưa có giáo trình</td></tr>
            : workouts.map(w => (
              <tr key={w.workout_id}>
                <td><strong style={{color:'#333'}}>{w.title}</strong></td>
                <td style={{color:'#888',maxWidth:240,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{w.description||'—'}</td>
                <td><span style={{color:DIFF_COLORS[w.difficulty]||'#888',fontWeight:600,fontSize:'0.82rem'}}>{w.difficulty||'—'}</span></td>
                <td style={{color:'#888'}}>{w.duration_weeks ? `${w.duration_weeks} tuần` : '—'}</td>
                <td>
                  <button className="btn-icon edit" onClick={() => setModal(w)}><i className="bx bxs-edit"></i></button>
                  <button className="btn-icon delete" onClick={() => handleDelete(w.workout_id)}><i className="bx bxs-trash"></i></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal !== null && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-box" style={{maxWidth:520}} onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">{modal.workout_id ? 'Sửa giáo trình' : 'Thêm giáo trình mới'}</h3>
            <form onSubmit={handleSave}>
              <input type="hidden" name="workout_id" value={modal.workout_id||''} />
              <div className="form-group"><label>Tên giáo trình *</label><input name="title" required defaultValue={modal.title||''} placeholder="Tên..." /></div>
              <div className="form-group"><label>Mô tả</label><input name="description" defaultValue={modal.description||''} placeholder="Mô tả ngắn..." /></div>
              <div className="form-row">
                <div className="form-group"><label>Độ khó</label>
                  <select name="difficulty" defaultValue={modal.difficulty||'Cơ bản'}>
                    <option>Cơ bản</option><option>Trung bình</option><option>Nâng cao</option>
                  </select>
                </div>
                <div className="form-group"><label>Thời gian (tuần)</label><input name="duration_weeks" type="number" min="1" defaultValue={modal.duration_weeks||4} /></div>
              </div>
              <div className="form-group">
                <label>Nội dung chi tiết</label>
                <textarea name="content" defaultValue={modal.content||''} placeholder="Mô tả chi tiết giáo trình..."
                  style={{width:'100%',minHeight:100,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:8,color:'#e2e8f0',padding:'10px 14px',fontSize:'0.9rem',outline:'none',resize:'vertical'}}></textarea>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setModal(null)}>Hủy</button>
                <button type="submit" className="btn-primary" style={{background:'linear-gradient(135deg,#22c55e,#16a34a)'}}>Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PTLayout>
  );
}

export default WorkoutsPage;
