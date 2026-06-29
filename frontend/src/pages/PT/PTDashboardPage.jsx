import { useEffect, useState } from 'react';
import { PTLayout } from '../../components/layout/PTLayout';
import '../../components/layout/AdminLayout.css';
import './PT.css';
import { ptApi } from '../../api/pt';
import useAuth from '../../hooks/useAuth';

function Stars({ rating }) {
  return (
    <span>
      {[1,2,3,4,5].map(i => (
        <i key={i} className={`bx ${i <= Math.round(rating) ? 'bxs-star star-filled' : 'bxs-star star-empty'}`} style={{fontSize:'1rem'}}></i>
      ))}
    </span>
  );
}

function PTDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [ptRes, schedRes] = await Promise.all([
          ptApi.dashboard(),
          ptApi.getSchedules(),
        ]);
        const ptData = ptRes.data.data;
        const allSchedules = schedRes.data.data || [];
        const todayStr = new Date().toISOString().split('T')[0];

        setData({
          student_count:   ptData?.students?.length ?? 0,
          today_sessions:  allSchedules.filter(s => s.session_date === todayStr).length ?? 0,
          avg_rating:      ptData?.trainer?.calculated_rating ?? ptData?.trainer?.avg_rating ?? null,
          total_sessions:  allSchedules.length ?? 0,
        });

        const upcoming = allSchedules
          .filter(s => s.session_date >= todayStr)
          .sort((a,b) => new Date(a.session_date) - new Date(b.session_date))
          .slice(0, 5);
        setSchedule(upcoming);
      } catch(e) { console.error(e); }
      finally { setLoading(false); }
    };
    if (user) fetch();
  }, [user]);

  const formatDate = (s) => s ? new Date(s).toLocaleDateString('vi-VN') : '—';
  const formatTime = (t) => t ? t.substring(0,5) : '—';

  const STATUS_COLORS = { 
    'Chờ xác nhận': '#f59e0b', 
    'Xác nhận': '#3b82f6', 
    'Hoàn thành': '#22c55e', 
    'Đã hủy': '#ef4444' 
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (user) {
        ptApi.getSchedules().then(schedRes => {
          const allSchedules = schedRes.data.data || [];
          const todayStr = new Date().toISOString().split('T')[0];
          const upcoming = allSchedules
            .filter(s => s.session_date >= todayStr)
            .sort((a,b) => new Date(a.session_date) - new Date(b.session_date))
            .slice(0, 5);
          setSchedule(upcoming);
          setData(prev => prev ? {
            ...prev,
            today_sessions: allSchedules.filter(s => s.session_date === todayStr).length,
            total_sessions: allSchedules.length
          } : prev);
        });
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <PTLayout title="Tổng quan PT">
      {/* Stats */}
      <div className="stats-grid">
        {[
          { label: 'Học viên',      value: loading ? '...' : (data?.student_count ?? '—'),           icon: 'bxs-user-detail', cls: 'icon-blue' },
          { label: 'Buổi hôm nay',  value: loading ? '...' : (data?.today_sessions ?? '—'),          icon: 'bxs-calendar-check', cls: 'icon-green' },
          { label: 'Đánh giá TB',   value: loading ? '...' : (data?.avg_rating ? `${Number(data.avg_rating).toFixed(1)}⭐` : '—'), icon: 'bxs-star', cls: 'icon-gold' },
          { label: 'Tổng buổi',     value: loading ? '...' : (data?.total_sessions ?? '—'),          icon: 'bxs-time', cls: 'icon-blue' },
        ].map((s, i) => (
          <div className="stat-card" key={i}>
            <div className="stat-info"><h3>{s.value}</h3><p>{s.label}</p></div>
            <div className={`stat-icon ${s.cls}`}><i className={`bx ${s.icon}`}></i></div>
          </div>
        ))}
      </div>

      {/* Upcoming Schedule */}
      <div className="admin-table-wrap">
        <div className="table-header-row">
          <h2>Lịch dạy sắp tới</h2>
          <a href="/pt/schedule" style={{color:'#22c55e',fontSize:'0.88rem'}}>Xem tất cả →</a>
        </div>
        <table className="admin-table">
          <thead><tr><th>Học viên</th><th>Ngày</th><th>Giờ</th><th>Địa điểm</th><th>Trạng thái</th></tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{textAlign:'center',padding:24}}>Đang tải...</td></tr>
            ) : schedule.length === 0 ? (
              <tr><td colSpan={5} style={{textAlign:'center',padding:24}}>Không có lịch dạy sắp tới</td></tr>
            ) : schedule.map((row, i) => (
              <tr key={i}>
                <td><strong>{row.member_name || row.full_name}</strong></td>
                <td>{formatDate(row.session_date)}</td>
                <td>{formatTime(row.time_start)} - {formatTime(row.time_end)}</td>
                <td>{row.location || 'Phòng tập'}</td>
                <td><span style={{color: STATUS_COLORS[row.status||'Chờ xác nhận']||'#888',fontWeight:600}}>{row.status || 'Chờ xác nhận'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PTLayout>
  );
}

export default PTDashboardPage;
