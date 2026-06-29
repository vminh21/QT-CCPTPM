import { useEffect, useRef, useState, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import viLocale from '@fullcalendar/core/locales/vi';
import { fetchSchedules } from '../api/pt';

/* ═══════════════════════════════════════════════════════════════════
   STATUS CONFIG — Nguồn sự thật duy nhất cho màu sắc và nhãn
   ═══════════════════════════════════════════════════════════════════ */
const STATUS_CONFIG = {
  'Chờ xác nhận': {
    bg:     '#fffbeb',
    border: '#f59e0b',
    text:   '#92400e',
    dot:    '#f59e0b',
    badge:  { bg: '#fef3c7', text: '#92400e' },
  },
  'Đã xác nhận': {
    bg:     '#f0fdf4',
    border: '#22c55e',
    text:   '#166534',
    dot:    '#22c55e',
    badge:  { bg: '#dcfce7', text: '#166534' },
  },
  'Hoàn thành': {
    bg:     '#f5f3ff',
    border: '#8b5cf6',
    text:   '#5b21b6',
    dot:    '#8b5cf6',
    badge:  { bg: '#ede9fe', text: '#5b21b6' },
  },
  'Đã hủy': {
    bg:     '#f9fafb',
    border: '#9ca3af',
    text:   '#4b5563',
    dot:    '#9ca3af',
    badge:  { bg: '#f3f4f6', text: '#6b7280' },
  },
};

const DEFAULT_COLOR = { bg: '#eff6ff', border: '#3b82f6', text: '#1e40af', dot: '#3b82f6', badge: { bg: '#dbeafe', text: '#1e40af' } };

const getStatus = (status) => STATUS_CONFIG[status] ?? DEFAULT_COLOR;

/* ─── Helpers ──────────────────────────────────────────────────── */
const fmtTime = (iso) =>
  iso ? new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false }) : '—';

const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

const calcDuration = (start, end) => {
  if (!start || !end) return '';
  const diff = (new Date(end) - new Date(start)) / 60000;
  const h = Math.floor(diff / 60), m = diff % 60;
  return h > 0 ? `${h}g ${m > 0 ? m + 'p' : ''}`.trim() : `${m}p`;
};

/* ═══════════════════════════════════════════════════════════════════
   SUB-COMPONENT: Custom Event Block
   ═══════════════════════════════════════════════════════════════════ */
function EventBlock({ eventInfo }) {
  const { status, member_name } = eventInfo.event.extendedProps;
  const cfg = getStatus(status);
  const startStr = fmtTime(eventInfo.event.startStr);
  const endStr   = fmtTime(eventInfo.event.endStr);

  return (
    <div style={{
      height: '100%',
      padding: '3px 6px',
      borderLeft: `4px solid ${cfg.border}`,
      background: cfg.bg,
      borderRadius: '0 6px 6px 0',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      gap: '1px',
      cursor: 'pointer',
    }}>
      {/* Giờ */}
      <span style={{ fontSize: '0.68rem', color: cfg.text, opacity: 0.75, display: 'flex', alignItems: 'center', gap: 3 }}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
        </svg>
        {startStr} – {endStr}
      </span>
      {/* Tên hội viên */}
      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: cfg.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {member_name || eventInfo.event.title}
      </span>
      {/* Tiêu đề buổi tập nhỏ hơn */}
      {eventInfo.event.title && member_name && (
        <span style={{ fontSize: '0.65rem', color: cfg.text, opacity: 0.7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {eventInfo.event.title}
        </span>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SUB-COMPONENT: Status Badge
   ═══════════════════════════════════════════════════════════════════ */
function StatusBadge({ status }) {
  const cfg = getStatus(status);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 99,
      background: cfg.badge.bg, color: cfg.badge.text,
      fontWeight: 700, fontSize: '0.78rem',
    }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: cfg.dot, display: 'inline-block' }} />
      {status}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SUB-COMPONENT: Event Detail Modal
   ═══════════════════════════════════════════════════════════════════ */
const STATUS_OPTIONS = ['Chờ xác nhận', 'Đã xác nhận', 'Hoàn thành', 'Đã hủy'];

function EventModal({ event, onClose, onConfirm, confirming, onDelete, onUpdateStatus }) {
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const cfg = getStatus(event.status);

  // Đóng bằng ESC
  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(3px)',
          zIndex: 1000,
          animation: 'ts-fadeIn 0.18s ease',
        }}
      />
      {/* Box */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1001,
        width: 400, maxWidth: 'calc(100vw - 32px)',
        background: '#fff',
        borderRadius: 20,
        boxShadow: '0 25px 80px rgba(0,0,0,0.22)',
        overflow: 'hidden',
        animation: 'ts-slideUp 0.22s cubic-bezier(.22,1,.36,1)',
      }}>
        {/* Header stripe */}
        <div style={{ background: cfg.bg, borderBottom: `3px solid ${cfg.border}`, padding: '18px 20px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <div>
            <p style={{ margin: 0, fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, color: cfg.text, opacity: 0.7 }}>
              Chi tiết buổi tập
            </p>
            <h3 style={{ margin: '4px 0 0', fontSize: '1.05rem', fontWeight: 800, color: cfg.text }}>
              {event.title}
            </h3>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(0,0,0,0.06)', border: 'none', borderRadius: 8,
            width: 30, height: 30, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#666', flexShrink: 0, marginTop: 2,
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.target.style.background = '#fee2e2'}
          onMouseLeave={e => e.target.style.background = 'rgba(0,0,0,0.06)'}
          >✕</button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 13 }}>

          {/* Trạng thái */}
          <StatusBadge status={event.status} />

          {/* Grid thông tin */}
          <div style={{ display: 'grid', gridTemplateColumns: '20px 1fr', gap: '10px 10px', alignItems: 'start' }}>
            <InfoRow icon="📅" label={fmtDate(event.start)} />
            <InfoRow icon="⏰" label={`${fmtTime(event.start)} – ${fmtTime(event.end)}`} sub={calcDuration(event.start, event.end)} />
            <InfoRow icon="👤" label={event.member_name || '—'} sub="Hội viên" />
            {event.trainer_name && <InfoRow icon="🏋️" label={event.trainer_name} sub="Huấn luyện viên" />}
            {event.notes && <InfoRow icon="📝" label={event.notes} />}
          </div>
        </div>

        {/* ── Status dropdown (đổi trạng thái ngay trong modal) ── */}
        {onUpdateStatus && event.status !== 'Hoàn thành' && (
          <div style={{ padding: '0 20px 4px' }}>
            <label style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600, display: 'block', marginBottom: 5 }}>ĐỔI TRẠNG THÁI</label>
            <select
              value={event.status}
              disabled={updatingStatus}
              onChange={async (e) => {
                const newStatus = e.target.value;
                if (newStatus === event.status) return;
                setUpdatingStatus(true);
                try { await onUpdateStatus(event.id, newStatus); onClose(); }
                catch {}
                finally { setUpdatingStatus(false); }
              }}
              style={{
                width: '100%', padding: '8px 12px', borderRadius: 8,
                border: '1.5px solid #e5e7eb', fontSize: '0.86rem', fontWeight: 600,
                color: '#374151', background: '#f9fafb', cursor: 'pointer', outline: 'none',
              }}
            >
              {STATUS_OPTIONS.map(s => {
                // Chỉ cho phép chọn "Hoàn thành" nếu ngày tập <= ngày hiện tại
                const today = new Date().toISOString().split('T')[0];
                const sessionDate = event.start.split('T')[0];
                const isDisabled = (s === 'Hoàn thành' && sessionDate > today);
                
                return (
                  <option key={s} value={s} disabled={isDisabled}>
                    {s} {isDisabled ? '(Chưa đến ngày)' : ''}
                  </option>
                );
              })}
            </select>
          </div>
        )}

        {/* Footer actions */}
        <div style={{ padding: '12px 20px 20px', display: 'flex', gap: 8, justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Nút Xoá bên trái */}
          {onDelete && (
            confirmDelete ? (
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 600 }}>Xác nhận xoá?</span>
                <button
                  disabled={deleting}
                  onClick={async () => {
                    setDeleting(true);
                    try { await onDelete(event.id); onClose(); }
                    catch {}
                    finally { setDeleting(false); }
                  }}
                  style={{
                    padding: '6px 14px', borderRadius: 8, border: 'none',
                    background: '#ef4444', color: '#fff', fontWeight: 700,
                    fontSize: '0.82rem', cursor: deleting ? 'not-allowed' : 'pointer',
                  }}
                >
                  {deleting ? '...' : 'Xoá'}
                </button>
                <button onClick={() => setConfirmDelete(false)}
                  style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', color: '#6b7280', fontSize: '0.82rem', cursor: 'pointer', fontWeight: 600 }}>
                  Không
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                style={{
                  padding: '8px 14px', borderRadius: 8,
                  border: '1.5px solid #fecaca', background: '#fff5f5',
                  color: '#ef4444', fontWeight: 600, fontSize: '0.84rem',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#fff5f5'; }}
              >
                🗑 Xoá lịch
              </button>
            )
          )}

          {/* Đóng bên phải */}
          <button onClick={onClose}
            style={{
              padding: '9px 20px', borderRadius: 10, border: '1.5px solid #e5e7eb',
              background: '#fff', color: '#6b7280', fontWeight: 600,
              fontSize: '0.87rem', cursor: 'pointer', transition: 'all 0.18s', marginLeft: 'auto',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f9fafb'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
          >
            Đóng
          </button>
        </div>
      </div>
    </>
  );
}

/* Inline info row cho modal */
function InfoRow({ icon, label, sub }) {
  return (
    <>
      <span style={{ fontSize: '1rem', lineHeight: '1.5', marginTop: 1 }}>{icon}</span>
      <div>
        <p style={{ margin: 0, fontSize: '0.88rem', color: '#1f2937', fontWeight: sub ? 600 : 400 }}>{label}</p>
        {sub && <p style={{ margin: '1px 0 0', fontSize: '0.73rem', color: '#9ca3af' }}>{sub}</p>}
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SUB-COMPONENT: Status Legend strip
   ═══════════════════════════════════════════════════════════════════ */
function Legend() {
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
      {Object.entries(STATUS_CONFIG).map(([label, cfg]) => (
        <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', color: '#6b7280' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.dot, display: 'inline-block' }} />
          {label}
        </span>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT: TrainerSchedule
   Props:
     trainerId  (number|null)
     onConfirmSchedule  (id) => Promise<void>  – optional callback
   ═══════════════════════════════════════════════════════════════════ */
export default function TrainerSchedule({ trainerId, onConfirmSchedule, onDelete, onUpdateStatus }) {
  const calendarRef = useRef(null);
  const [events,     setEvents]     = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState(null);
  const [selected,   setSelected]   = useState(null);
  const [confirming, setConfirming] = useState(false);

  /* ── Responsive: mobile → timeGridDay, desktop → timeGridWeek ── */
  const [calView, setCalView] = useState(
    window.innerWidth < 768 ? 'timeGridDay' : 'timeGridWeek'
  );

  useEffect(() => {
    const onResize = () => {
      const newView = window.innerWidth < 768 ? 'timeGridDay' : 'timeGridWeek';
      setCalView(newView);
      calendarRef.current?.getApi()?.changeView(newView);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  /* ── Load events khi FullCalendar đổi range ──────────────────── */
  const loadEvents = useCallback(async (start, end) => {
    if (!trainerId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchSchedules(
        trainerId,
        start.toISOString().split('T')[0],
        end.toISOString().split('T')[0]
      );
      setEvents(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Không thể tải lịch tập. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [trainerId]);

  const handleDatesSet = useCallback((info) => {
    loadEvents(info.start, info.end);
  }, [loadEvents]);

  /* ── Click event → mở modal ─────────────────────────────────── */
  const handleEventClick = useCallback(({ event }) => {
    setSelected({
      id:           event.id,
      title:        event.title,
      start:        event.startStr,
      end:          event.endStr,
      status:       event.extendedProps.status,
      member_name:  event.extendedProps.member_name,
      trainer_name: event.extendedProps.trainer_name,
      notes:        event.extendedProps.notes,
    });
  }, []);

  /* ── Xác nhận lịch từ Modal ──────────────────────────────────── */
  const handleConfirm = useCallback(async (scheduleId) => {
    if (!onConfirmSchedule) return;
    setConfirming(true);
    try {
      await onConfirmSchedule(scheduleId);
      setSelected(null);
      // Reload lịch hiện tại
      const api = calendarRef.current?.getApi();
      if (api) loadEvents(api.view.activeStart, api.view.activeEnd);
    } finally {
      setConfirming(false);
    }
  }, [onConfirmSchedule, loadEvents]);

  /* ── Custom render mỗi event block ──────────────────────────── */
  const renderEventContent = useCallback((eventInfo) => (
    <EventBlock eventInfo={eventInfo} />
  ), []);

  /* ─────────────────────────────────────────────────────────────── */
  return (
    <div style={{
      background: '#fff',
      borderRadius: 18,
      padding: '20px 20px 24px',
      boxShadow: '0 4px 32px rgba(0,0,0,0.08)',
      position: 'relative',
    }}>

      {/* ── Loading skeleton overlay ────────────────────────────── */}
      {loading && (
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 18,
          background: 'rgba(255,255,255,0.8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          zIndex: 50, backdropFilter: 'blur(2px)',
        }}>
          <div style={{
            width: 22, height: 22, borderRadius: '50%',
            border: '3px solid #e0e7ff', borderTopColor: '#6366f1',
            animation: 'ts-spin 0.7s linear infinite',
          }} />
          <span style={{ color: '#4f46e5', fontWeight: 600, fontSize: '0.9rem' }}>Đang tải lịch tập...</span>
        </div>
      )}

      {/* ── Error banner ───────────────────────────────────────── */}
      {error && (
        <div style={{
          background: '#fee2e2', border: '1px solid #fca5a5',
          color: '#991b1b', padding: '10px 14px', borderRadius: 10,
          marginBottom: 14, fontSize: '0.86rem', display: 'flex', gap: 8, alignItems: 'center',
        }}>
          <span>⚠️</span> {error}
          <button onClick={() => setError(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#991b1b', fontWeight: 700 }}>✕</button>
        </div>
      )}

      {/* ── Legend ─────────────────────────────────────────────── */}
      <Legend />

      {/* ══ FullCalendar ════════════════════════════════════════ */}
      <FullCalendar
        ref={calendarRef}
        plugins={[timeGridPlugin, interactionPlugin]}
        initialView={calView}
        locale={viLocale}
        headerToolbar={{
          left:   'prev,next today',
          center: 'title',
          right:  'timeGridWeek,timeGridDay',
        }}
        buttonText={{ today: 'Hôm nay', week: 'Tuần', day: 'Ngày' }}
        slotMinTime="06:00:00"
        slotMaxTime="21:00:00"
        slotDuration="00:30:00"
        slotLabelInterval="01:00:00"
        slotLabelFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
        events={events}
        datesSet={handleDatesSet}
        eventClick={handleEventClick}
        eventContent={renderEventContent}
        nowIndicator={true}
        allDaySlot={false}
        weekends={true}
        height="auto"
        stickyHeaderDates={true}
        /* Tắt background mặc định của FC vì chúng ta tự render */
        eventBackgroundColor="transparent"
        eventBorderColor="transparent"
        eventTextColor="inherit"
        /* Tô xám khung nghỉ trưa 11:00-13:00 và ngoài giờ hoạt động */
        businessHours={[
          { daysOfWeek: [0,1,2,3,4,5,6], startTime: '06:00', endTime: '11:00' },
          { daysOfWeek: [0,1,2,3,4,5,6], startTime: '13:00', endTime: '21:00' },
        ]}
        selectConstraint="businessHours"
      />

      {/* ══ Modal ════════════════════════════════════════════════ */}
      {selected && (
        <EventModal
          event={selected}
          onClose={() => setSelected(null)}
          onConfirm={onConfirmSchedule ? handleConfirm : undefined}
          confirming={confirming}
          onDelete={onDelete}
          onUpdateStatus={onUpdateStatus}
        />
      )}

      {/* ══ Global keyframe animations ════════════════════════════ */}
      <style>{`
        @keyframes ts-spin    { to { transform: rotate(360deg); } }
        @keyframes ts-fadeIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes ts-slideUp {
          from { opacity: 0; transform: translate(-50%, calc(-50% + 18px)); }
          to   { opacity: 1; transform: translate(-50%, -50%); }
        }

        /* ══ FullCalendar Premium Overrides ══ */

        /* Toolbar */
        .fc .fc-toolbar {
          margin-bottom: 16px !important;
          flex-wrap: wrap;
          gap: 8px;
        }
        .fc .fc-toolbar-title {
          font-size: 1rem !important;
          font-weight: 800 !important;
          color: #1e1b4b !important;
          letter-spacing: -0.3px;
        }

        /* Buttons */
        .fc .fc-button {
          background: #f3f4f6 !important;
          border: 1px solid #e5e7eb !important;
          color: #374151 !important;
          border-radius: 8px !important;
          font-size: 0.8rem !important;
          font-weight: 600 !important;
          box-shadow: none !important;
          transition: all 0.15s !important;
          padding: 5px 12px !important;
        }
        .fc .fc-button:hover {
          background: #e0e7ff !important;
          border-color: #c7d2fe !important;
          color: #4338ca !important;
        }
        .fc .fc-button-primary.fc-button-active {
          background: #4f46e5 !important;
          border-color: #4338ca !important;
          color: #fff !important;
          box-shadow: 0 2px 8px rgba(79,70,229,0.35) !important;
        }
        .fc .fc-button-primary:focus { box-shadow: none !important; }
        .fc .fc-button-group .fc-button { border-radius: 0 !important; }
        .fc .fc-button-group .fc-button:first-child { border-radius: 8px 0 0 8px !important; }
        .fc .fc-button-group .fc-button:last-child  { border-radius: 0 8px 8px 0 !important; }

        /* Column header (Thứ, Ngày) */
        .fc-col-header-cell {
          background: linear-gradient(180deg, #f0f4ff 0%, #e8eeff 100%) !important;
          border-bottom: 2px solid #c7d2fe !important;
        }
        .fc-col-header-cell-cushion {
          color: #3730a3 !important;
          font-weight: 700 !important;
          font-size: 0.82rem !important;
          padding: 10px 4px !important;
          text-decoration: none !important;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1px;
        }

        /* Time label (cột trái) */
        .fc-timegrid-slot-label-cushion {
          font-size: 0.72rem !important;
          font-weight: 600 !important;
          color: #6b7280 !important;
          padding-right: 8px !important;
          font-variant-numeric: tabular-nums;
          letter-spacing: 0.3px;
        }
        .fc-timegrid-slot-label {
          border-right: 2px solid #e5e7eb !important;
        }

        /* Slot rows — xen kẽ màu nhẹ */
        .fc-timegrid-slot {
          height: 40px !important;
          border-color: #f3f4f6 !important;
        }
        .fc-timegrid-slot.fc-timegrid-slot-minor {
          border-color: #fafafa !important;
          border-top-style: dashed !important;
        }

        /* Event block */
        .fc-timegrid-event {
          border-radius: 0 8px 8px 0 !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.10) !important;
          border: none !important;
          margin-right: 2px !important;
        }
        .fc-timegrid-event:hover {
          box-shadow: 0 4px 16px rgba(0,0,0,0.16) !important;
          transform: translateY(-1px);
          z-index: 10 !important;
        }

        /* Now indicator */
        .fc-now-indicator-line {
          border-color: #ef4444 !important;
          border-width: 2px !important;
        }
        .fc-now-indicator-arrow {
          border-top-color: #ef4444 !important;
          border-bottom-color: #ef4444 !important;
        }

        /* Scrollgrid borders */
        .fc-scrollgrid { border-color: #e5e7eb !important; border-radius: 10px; overflow: hidden; }
        .fc-scrollgrid-section > td { border-color: #e5e7eb !important; }
        .fc-scrollgrid td { border-color: #f3f4f6 !important; }
        .fc-scrollgrid th { border-color: #c7d2fe !important; }

        /* Khung nghỉ trưa (11:00-13:00) */
        .fc-non-business {
          background: repeating-linear-gradient(
            -45deg,
            rgba(156,163,175,0.07),
            rgba(156,163,175,0.07) 5px,
            rgba(156,163,175,0.14) 5px,
            rgba(156,163,175,0.14) 10px
          ) !important;
        }
      `}</style>
    </div>
  );
}
