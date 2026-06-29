import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationsApi } from '../../api/notifications';
import { profileApi } from '../../api/profile';
import { MemberLayout } from '../../components/layout/MemberLayout';
import './Member.css';

function NotificationsPage() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [pendingSchedules, setPendingSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show:false, msg:'', type:'success' });

  const showToast = (msg, type='success') => {
    setToast({show:true,msg,type});
    setTimeout(()=>setToast({show:false,msg:'',type:'success'}),3500);
  };

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      notificationsApi.list(),
      profileApi.get()
    ]).then(([notifRes, profileRes]) => {
      setList(notifRes.data?.data || []);
      const allSchedules = profileRes.data?.data?.schedules || [];
      setPendingSchedules(allSchedules.filter(s => s.status === 'Chờ xác nhận'));
    }).catch(() => {
      setList([]);
      setPendingSchedules([]);
    }).finally(() => {
      setLoading(false);
      notificationsApi.markAllRead().catch(()=>{});
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const confirmSchedule = async (id, status) => {
    setPendingSchedules(prev => prev.filter(s => s.schedule_id !== id));
    try {
      const res = await profileApi.confirmSchedule(id, status);
      showToast(`Đã ${status.toLowerCase()} lịch tập!`);
      Promise.all([notificationsApi.list(), profileApi.get()])
        .then(([notifRes, profileRes]) => {
          setList(notifRes.data?.data || []);
          const allSchedules = profileRes.data?.data?.schedules || [];
          setPendingSchedules(allSchedules.filter(s => s.status === 'Chờ xác nhận'));
        });
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Có lỗi xảy ra!';
      showToast(msg, 'error');
      fetchData();
    }
  };

  return (
    <MemberLayout title="Trung Tâm Thông Báo">
      {/* CSS Keyframes for animations */}
      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.98) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .notif-card {
          animation: fadeInScale 0.4s ease-out forwards;
          opacity: 0;
        }
        .glass-panel {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid #e5e7eb;
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.05);
        }
      `}</style>
      
      {toast.show && <div style={{position:'fixed',top:80,right:20,padding:'16px 24px',borderRadius:12,zIndex:9999,background:toast.type==='success'?'#dcfce7':'#fee2e2', backdropFilter:'blur(10px)', border:`1px solid ${toast.type==='success'?'#86efac':'#fca5a5'}`,color:toast.type==='success'?'#16a34a':'#dc2626', boxShadow: '0 10px 25px rgba(0,0,0,0.1)'}}>{toast.msg}</div>}
      
      <div style={{maxWidth: 850, margin: '0 auto'}}>
        
        {loading ? (
          <div style={{display:'flex',justifyContent:'center',padding:40}}>
            <div style={{width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(249,115,22,0.2)', borderTopColor: '#ea580c', animation: 'spin 1s linear infinite'}} />
          </div>
        ) : (
          <>
            {/* Phần hiển thị Lịch chờ xác nhận */}
            {pendingSchedules.length > 0 && (
              <div style={{marginBottom: 40}}>
                <h3 style={{color:'#111827', fontSize:'1.25rem', fontWeight: 700, marginBottom:20, display:'flex', alignItems:'center', gap:10}}>
                  <div style={{background: 'linear-gradient(135deg, #ea580c, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'flex'}}>
                    <i className="bx bxs-calendar-exclamation" style={{fontSize:'1.6rem'}}></i>
                  </div>
                  Lịch tập chờ xác nhận <span style={{background:'#fef3c7',color:'#d97706',padding:'2px 8px',borderRadius:20,border:'1px solid #fde68a',fontSize:'0.8rem'}}>{pendingSchedules.length}</span>
                </h3>
                <div style={{display:'flex',flexDirection:'column',gap:16}}>
                  {pendingSchedules.map((s, i) => (
                    <div key={'sched_'+i} className="notif-card glass-panel" style={{animationDelay: `${i * 0.1}s`, borderRadius: 16, padding: '24px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap: 'wrap', gap: 20, position: 'relative', overflow: 'hidden'}}>
                      {/* Gradient glow accent */}
                      <div style={{position:'absolute', top:0, left:0, width:4, height:'100%', background:'linear-gradient(180deg, #ea580c, #f59e0b)'}}></div>
                      
                      <div style={{flex: 1, minWidth: 280}}>
                        <h4 style={{color:'#111827', fontSize:'1.15rem', fontWeight: 600, margin: '0 0 8px 0'}}>HLV <span style={{color:'#d97706'}}>{s.trainer_name}</span> đã lên lịch cho bạn</h4>
                        <div style={{display:'flex', gap: 16, flexWrap: 'wrap', marginBottom: s.notes ? 12 : 0}}>
                          <div style={{display:'flex', alignItems:'center', gap:6, background:'#f3f4f6', padding:'6px 12px', borderRadius:8}}>
                            <i className="bx bx-calendar" style={{color:'#d97706'}}></i>
                            <span style={{color:'#4b5563', fontSize:'0.95rem', fontWeight: 500}}>{new Date(s.session_date).toLocaleDateString('vi-VN')}</span>
                          </div>
                          <div style={{display:'flex', alignItems:'center', gap:6, background:'#f3f4f6', padding:'6px 12px', borderRadius:8}}>
                            <i className="bx bx-time-five" style={{color:'#d97706'}}></i>
                            <span style={{color:'#4b5563', fontSize:'0.95rem', fontWeight: 500}}>{s.time_start?.substring(0,5) || s.start_time?.substring(0,5)} - {s.time_end?.substring(0,5) || s.end_time?.substring(0,5)}</span>
                          </div>
                        </div>
                        {s.notes && (
                          <div style={{background: '#fefce8', padding:'10px 14px', borderRadius:8, borderLeft: '2px solid #fde047'}}>
                             <p style={{color:'#854d0e', margin:0, fontSize:'0.9rem', fontStyle:'italic'}}>"{s.notes}"</p>
                          </div>
                        )}
                      </div>
                      
                      <div style={{display:'flex',gap:12}}>
                        <button onClick={() => confirmSchedule(s.schedule_id, 'Xác nhận')} style={{background:'linear-gradient(135deg, #16a34a, #15803d)',color:'#fff',border:'none',padding:'10px 24px',borderRadius:10,fontWeight:700,cursor:'pointer', transition: 'transform 0.2s, box-shadow 0.2s', boxShadow: '0 4px 12px rgba(22,163,74,0.3)'}} onMouseEnter={e => {e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 6px 16px rgba(22,163,74,0.4)'}} onMouseLeave={e => {e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 4px 12px rgba(22,163,74,0.3)'}}>
                          Tham gia
                        </button>
                        <button onClick={() => confirmSchedule(s.schedule_id, 'Đã hủy')} style={{background:'transparent',color:'#dc2626',border:'1px solid #f87171',padding:'10px 20px',borderRadius:10,fontWeight:600,cursor:'pointer', transition: 'background 0.2s'}} onMouseEnter={e => e.currentTarget.style.background='#fef2f2'} onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                          Từ chối
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Phần Thông báo chung */}
            <div>
              <h3 style={{color:'#111827', fontSize:'1.25rem', fontWeight: 700, marginBottom:20, display:'flex', alignItems:'center', gap:10}}>
                <div style={{background: 'linear-gradient(135deg, #ea580c, #c2410c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'flex'}}>
                  <i className="bx bxs-bell-ring" style={{fontSize:'1.6rem'}}></i>
                </div>
                Tất cả thông báo
              </h3>
              
              {list.length === 0 ? (
                <div className="glass-panel" style={{padding: 40, textAlign: 'center', borderRadius: 16}}>
                  <i className="bx bx-check-double" style={{fontSize: '3rem', color: '#9ca3af', marginBottom: 16}}></i>
                  <p style={{color:'#6b7280', fontSize: '1.1rem'}}>Bạn đã xem hết tất cả thông báo.</p>
                </div>
              ) : (
                <div style={{display:'flex',flexDirection:'column',gap:16}}>
                  {list.map((n, i) => (
                    <div key={i} className="notif-card glass-panel" style={{animationDelay: `${i * 0.05}s`, background: n.is_read ? 'rgba(255, 255, 255, 0.8)' : '#fff7ed', border: `1px solid ${n.is_read ? '#e5e7eb' : '#fed7aa'}`, borderRadius:16, padding:'24px 28px', position:'relative', transition: 'transform 0.2s', cursor: 'default'}} onMouseEnter={e => e.currentTarget.style.transform='translateX(4px)'} onMouseLeave={e => e.currentTarget.style.transform='translateX(0)'}>
                      
                      {!n.is_read && (
                        <div style={{position:'absolute',top:24,right:24,display:'flex',alignItems:'center',gap:6}}>
                          <span style={{fontSize:'0.75rem', color:'#ea580c', fontWeight: 600, textTransform:'uppercase', letterSpacing: 1}}>Mới</span>
                          <div style={{width:8,height:8,background:'#ea580c',borderRadius:'50%', boxShadow:'0 0 10px rgba(234,88,12,0.4)'}}></div>
                        </div>
                      )}
                      
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:12, paddingRight: !n.is_read ? 60 : 0}}>
                        <strong style={{color: n.is_read ? '#6b7280' : '#111827', fontSize:'1.1rem', letterSpacing: 0.3}}>{n.title}</strong>
                      </div>
                      
                      <div style={{color:n.is_read?'#6b7280':'#374151', fontSize:'0.95rem', lineHeight:1.6, margin:0, whiteSpace: 'pre-wrap'}}>
                        {n.message || n.content}
                      </div>

                      <div style={{marginTop: 16, display:'flex', alignItems:'center', gap: 6, color: '#9ca3af', fontSize: '0.85rem'}}>
                        <i className="bx bx-time"></i>
                        <span>{new Date(n.created_at).toLocaleString('vi-VN', {hour: '2-digit', minute:'2-digit', day:'2-digit', month:'2-digit', year:'numeric'})}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </MemberLayout>
  );
}

export default NotificationsPage;
