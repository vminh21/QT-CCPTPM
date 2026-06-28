import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MemberLayout } from '../../components/Layout/MemberLayout';
import { blogsApi } from '../../api/blogs';
import { trainersApi } from '../../api/trainers';
import './Member.css';

function HomePage() {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const BACKEND_URL = 'http://localhost/BTLWeb(PC)/backend';

  useEffect(() => {
    Promise.all([
      blogsApi.list({ limit: 4 }),
      trainersApi.list({ limit: 4 }),
    ]).then(([blogRes, trainerRes]) => {
      setBlogs(blogRes.data.data || []);
      setTrainers(trainerRes.data.data || []);
    }).finally(() => setLoading(false));
  }, []);

  const Stars = ({ n }) => <span style={{display: 'flex', alignItems: 'center'}}>{[1,2,3,4,5].map(i => <i key={i} className={i <= Math.round(n) ? 'bx bxs-star' : 'bx bx-star'} style={{color: i<=Math.round(n)?'#f59e0b':'#3f3f46', fontSize: '0.9rem'}}></i>)}</span>;

  return (
    <MemberLayout title="Tổng quan Hội viên">
      {/* Stats Quick Links (To match admin look) */}
      <div className="stats-grid">
        <div className="stat-card" onClick={() => navigate('/member/profile')} style={{cursor: 'pointer'}}>
          <div className="stat-info"><h3 style={{fontSize: '1.2rem', marginBottom: 5}}>Hồ sơ cá nhân</h3><p>Hạng membership & thông tin</p></div>
          <div className="stat-icon icon-blue"><i className="bx bxs-user-detail"></i></div>
        </div>
        <div className="stat-card" onClick={() => navigate('/member/payment')} style={{cursor: 'pointer'}}>
          <div className="stat-info"><h3 style={{fontSize: '1.2rem', marginBottom: 5}}>Mua Khóa Học</h3><p>Đăng ký gói tập mới</p></div>
          <div className="stat-icon icon-green"><i className="bx bx-cart"></i></div>
        </div>
        <div className="stat-card" onClick={() => navigate('/exercise/fitness')} style={{cursor: 'pointer'}}>
          <div className="stat-info"><h3 style={{fontSize: '1.2rem', marginBottom: 5}}>Lịch Trình</h3><p>Bắt đầu buổi tập hôm nay</p></div>
          <div className="stat-icon icon-gold"><i className="bx bx-dumbbell"></i></div>
        </div>
        <div className="stat-card" onClick={() => navigate('/rate-trainers')} style={{cursor: 'pointer'}}>
          <div className="stat-info"><h3 style={{fontSize: '1.2rem', marginBottom: 5}}>Đánh giá PT</h3><p>Đóng góp ý kiến chất lượng</p></div>
          <div className="stat-icon icon-red"><i className="bx bxs-star"></i></div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 24, marginTop: 32 }}>
        {/* Khám Phá Bài Tập */}
        <div className="admin-table-wrap" style={{ padding: 24 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: 20 }}>Khám phá Lịch trình</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { type:'bodybuilding', label:'Thể hình', icon:'bx-dumbbell', color:'#f97316' },
              { type:'cardio',       label:'Cardio',   icon:'bx-heart',    color:'#ef4444' },
              { type:'crossfit',     label:'CrossFit', icon:'bx-trending-up', color:'#8b5cf6' },
              { type:'fitness',      label:'Fitness',  icon:'bx-cycling',  color:'#22c55e' },
            ].map(e => (
              <div key={e.type} onClick={() => navigate(`/exercise/${e.type}`)} style={{ background: '#f8f9fa', border: '1px solid #e2e6ea', borderRadius: 12, padding: 20, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', transition: '0.2s' }} onMouseEnter={ev=>ev.currentTarget.style.borderColor=e.color} onMouseLeave={ev=>ev.currentTarget.style.borderColor='#e2e6ea'}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: `${e.color}20`, color: e.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
                  <i className={`bx ${e.icon}`}></i>
                </div>
                <strong style={{ color: 'var(--text-dark)', fontSize: '0.95rem' }}>{e.label}</strong>
              </div>
            ))}
          </div>
        </div>

        {/* Top Trainers */}
        <div className="admin-table-wrap" style={{ padding: 24 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: 20 }}>PT Nổi Bật</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {loading ? <p style={{color:'#555'}}>Đang tải...</p> : trainers.map((t, index) => {
              const fallbackImg = new URL(`../../assets/trainer-${(index%4)+1}.jpg`, import.meta.url).href;
              return (
                <div key={t.trainer_id} style={{ background: '#f8f9fa', border: '1px solid #e2e6ea', borderRadius: 12, padding: 16, display: 'flex', gap: 12, alignItems: 'center', cursor: 'pointer' }}>
                  <img src={t.image ? `${BACKEND_URL}/uploads/${t.image}` : fallbackImg} alt={t.full_name} style={{ width: 50, height: 50, borderRadius: '50%', objectFit: 'cover' }} onError={e=>e.target.src=fallbackImg} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <strong style={{ color: 'var(--text-dark)', display: 'block', fontSize: '0.95rem', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.full_name}</strong>
                    <span style={{ color: '#6b7280', fontSize: '0.8rem', display: 'block', marginBottom: 4 }}>{t.specialty||'Gym'}</span>
                    <Stars n={Number(t.calculated_rating || t.rating || 0)} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Blogs */}
      <div className="admin-table-wrap" style={{ padding: 24, marginTop: 24 }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: 20 }}>Tin tức mới</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {loading ? <p style={{color:'#555'}}>Đang tải...</p> : blogs.map((b, i) => {
            const fbImg = new URL(`../../assets/blog-${(i%4)+1}.jpg`, import.meta.url).href;
            return (
              <div key={b.blog_id} onClick={() => navigate(`/member/blog/${b.blog_id}`)} style={{ cursor: 'pointer', background: '#f8f9fa', borderRadius: 12, overflow: 'hidden', border: '1px solid #e2e6ea' }}>
                <img src={b.image_url ? `${BACKEND_URL}/uploads/${b.image_url}` : fbImg} alt={b.title} style={{ width: '100%', height: 120, objectFit: 'cover' }} onError={e=>e.target.src=fbImg} />
                <div style={{ padding: 16 }}>
                  <h3 style={{ color: 'var(--text-dark)', fontSize: '0.9rem', lineHeight: 1.4, marginBottom: 8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{b.title}</h3>
                  <p style={{ color: '#f97316', fontSize: '0.8rem', fontWeight: 600 }}>{b.created_at ? new Date(b.created_at).toLocaleDateString('vi-VN') : ''}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </MemberLayout>
  );
}

export default HomePage;
