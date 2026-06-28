import { useEffect, useState } from 'react';
import { PTLayout } from '../../components/layout/PTLayout';
import '../../components/layout/AdminLayout.css';
import './PT.css';
import { ptApi } from '../../api/pt';
import TrainerSchedule from '../../components/TrainerSchedule';

/* ── Đọc trainer_id từ JWT payload ─────────────────────────────── */
function getTrainerIdFromToken() {
  try {
    const token = localStorage.getItem('jwt_token');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.trainer_id || payload.user_id || null;
  } catch {
    return null;
  }
}

/* ── Validate giờ Gym ─────────────────────────────────────────── */
function validateTime(start, end) {
  if (!start || !end) return 'Vui lòng nhập giờ bắt đầu và kết thúc.';
  const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  const s = toMin(start), e = toMin(end);
  if (s < 6 * 60 || e > 21 * 60) return 'Phòng gym chỉ hoạt động từ 06:00 đến 21:00.';
  if (s >= e) return 'Giờ kết thúc phải sau giờ bắt đầu.';
  if (s < 13 * 60 && e > 11 * 60) return 'Không thể đặt lịch trong khung nghỉ trưa (11:00 – 13:00).';
  return null;
}

/* ══════════════════════════════════════════════════════════════════
   SchedulePage — Chỉ còn Calendar View
   ══════════════════════════════════════════════════════════════════ */
function SchedulePage() {
  const [students, setStudents] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({
    member_id: '', session_date: '', time_start: '',
    time_end: '', session_title: 'Buổi tập cá nhân', notes: '',
  });
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });
  // calendarKey dùng để force reload calendar sau khi thêm/xoá/sửa
  const [calendarKey, setCalendarKey] = useState(0);

  const trainerId = getTrainerIdFromToken();

  const showToast = (msg, type = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type: 'success' }), 3500);
  };

  /* Chỉ fetch danh sách học viên cho form thêm lịch */
  useEffect(() => {
    ptApi.getStudents()
      .then(res => setStudents(res.data.data || []))
      .catch(() => {});
  }, []);

  /* ── Thêm lịch ────────────────────────────────────────────────── */
  const handleAdd = async (e) => {
    e.preventDefault();
    const err = validateTime(form.time_start, form.time_end);
    if (err) { showToast(err, 'error'); return; }
    try {
      await ptApi.addSchedule(form);
      showToast('Đã thêm lịch tập!');
      setModal(false);
      setForm({ member_id: '', session_date: '', time_start: '', time_end: '', session_title: 'Buổi tập cá nhân', notes: '' });
      setCalendarKey(k => k + 1); // reload calendar
    } catch (err) {
      showToast(err.response?.data?.error || 'Lỗi thêm lịch!', 'error');
    }
  };

  /* ── Xoá lịch (gọi từ Modal của TrainerSchedule) ─────────────── */
  const handleDelete = async (id) => {
    try {
      await ptApi.deleteSchedule(id);
      showToast('Đã xóa lịch tập!');
      setCalendarKey(k => k + 1);
    } catch (err) {
      showToast(err.response?.data?.error || 'Lỗi xóa!', 'error');
      throw err; // để Modal biết lỗi
    }
  };

  /* ── Cập nhật trạng thái (gọi từ Modal của TrainerSchedule) ──── */
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await ptApi.updateScheduleStatus(id, newStatus);
      showToast('Cập nhật trạng thái thành công!');
      setCalendarKey(k => k + 1);
    } catch (err) {
      showToast(err.response?.data?.error || 'Lỗi cập nhật!', 'error');
      throw err;
    }
  };

  /* ══ Render ═══════════════════════════════════════════════════ */
  return (
    <PTLayout title="Lịch dạy">
      {/* Toast */}
      {toast.show && (
        <div style={{
          position: 'fixed', top: 20, right: 20, padding: '12px 20px',
          borderRadius: 10, zIndex: 9999, fontWeight: 500,
          background: toast.type === 'success' ? '#1a2d1a' : '#2d1a1a',
          border: `1px solid ${toast.type === 'success' ? '#22c55e' : '#ef4444'}`,
          color: toast.type === 'success' ? '#86efac' : '#fca5a5',
        }}>{toast.msg}</div>
      )}

      <div className="admin-table-wrap">
        {/* Header */}
        <div className="table-header-row">
          <h2>📅 Lịch dạy tuần</h2>
          <button className="btn-primary" onClick={() => setModal(true)}>
            <i className="bx bx-plus"></i> Thêm lịch
          </button>
        </div>

        {/* Calendar — key thay đổi sẽ remount để reload data */}
        <TrainerSchedule
          key={calendarKey}
          trainerId={trainerId}
          onDelete={handleDelete}
          onUpdateStatus={handleUpdateStatus}
        />
      </div>

      {/* ── Modal Thêm lịch ──────────────────────────────────────── */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Thêm lịch tập mới</h3>
            <form onSubmit={handleAdd}>
              <div className="form-group">
                <label>Học viên</label>
                <select required value={form.member_id}
                  onChange={e => setForm(f => ({ ...f, member_id: e.target.value }))}>
                  <option value="">-- Chọn học viên --</option>
                  {students.map(s => (
                    <option key={s.member_id} value={s.member_id}>{s.full_name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Tiêu đề buổi tập</label>
                <input type="text" value={form.session_title}
                  onChange={e => setForm(f => ({ ...f, session_title: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Ngày tập</label>
                <input type="date" required value={form.session_date}
                  onChange={e => setForm(f => ({ ...f, session_date: e.target.value }))} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Giờ bắt đầu</label>
                  <input type="time" required min="06:00" max="20:59"
                    value={form.time_start}
                    onChange={e => setForm(f => ({ ...f, time_start: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Giờ kết thúc</label>
                  <input type="time" required min="06:01" max="21:00"
                    value={form.time_end}
                    onChange={e => setForm(f => ({ ...f, time_end: e.target.value }))} />
                </div>
              </div>
              <p style={{ margin: '-4px 0 8px', fontSize: '0.76rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span>⚠️</span> Hoạt động: 06:00–21:00 &nbsp;|&nbsp; Nghỉ trưa: 11:00–13:00
              </p>
              <div className="form-group">
                <label>Ghi chú</label>
                <input type="text" value={form.notes} placeholder="Ghi chú..."
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setModal(false)}>Hủy</button>
                <button type="submit" className="btn-primary"
                  style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)' }}>
                  Thêm lịch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PTLayout>
  );
}

export default SchedulePage;
