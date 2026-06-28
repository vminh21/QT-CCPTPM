import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import '../Member/Member.css';

const PROGRAMS = [
  {
    id: 'bodybuilding',
    title: 'Body Building',
    subtitle: 'Xây dựng khối cơ & Sức mạnh',
    desc: 'Tập trung vào việc phá vỡ và tái cấu trúc sợi cơ thông qua các bài tập kháng lực cường độ cao, giúp bạn sở hữu hình thể lý tưởng.',
    icon: 'bx-dumbbell',
    color: '#ef4444',
    bg: 'linear-gradient(135deg, #450a0a, #991b1b)',
    benefits: ['Tăng khối lượng cơ bắp', 'Tăng mật độ xương', 'Tăng cường trao đổi chất'],
    exercises: ['Bench Press', 'Deadlift', 'Squat', 'Bicep Curls']
  },
  {
    id: 'cardio',
    title: 'Cardio Training',
    subtitle: 'Đốt mỡ & Sức bền tim mạch',
    desc: 'Hệ thống các bài tập nhịp điệu giúp tăng cường khả năng tuần hoàn, đốt cháy calo dư thừa hiệu quả nhất.',
    icon: 'bx-run',
    color: '#eab308',
    bg: 'linear-gradient(135deg, #422006, #854d0e)',
    benefits: ['Giảm mỡ nhanh chóng', 'Tim mạch khỏe mạnh', 'Giảm căng thẳng'],
    exercises: ['Treadmill', 'Cycling', 'Burpees', 'Jump Rope']
  },
  {
    id: 'crossfit',
    title: 'CrossFit System',
    subtitle: 'Thử thách đa chức năng',
    desc: 'Kết hợp giữa cử tạ, thể dục dụng cụ và bài tập cường độ cao. Chương trình tập luyện toàn diện để phát triển mọi tố chất.',
    icon: 'bx-infinite',
    color: '#f97316',
    bg: 'linear-gradient(135deg, #431407, #9a3412)',
    benefits: ['Sức mạnh toàn diện', 'Khả năng linh hoạt', 'Đốt calo cực cao'],
    exercises: ['Clean & Jerk', 'Pull-ups', 'Kettlebell Swings', 'Box Jumps']
  },
  {
    id: 'fitness',
    title: 'General Fitness',
    subtitle: 'Duy trì vóc dáng & Sức khỏe',
    desc: 'Dành cho những người muốn có cơ thể săn chắc, linh hoạt và một lối sống lành mạnh. Phù hợp cho mọi đối tượng.',
    icon: 'bx-shape-polygon',
    color: '#22c55e',
    bg: 'linear-gradient(135deg, #064e3b, #065f46)',
    benefits: ['Giữ dáng săn chắc', 'Cải thiện tư thế', 'Tốt cho tinh thần'],
    exercises: ['Plank', 'Push-ups', 'Lunges', 'Mountain Climbers']
  }
];

function ExercisePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const ctaPath = user?.loggedIn ? '/member/payment' : '/login';

  return (
    <div className="profile-page" style={{ minHeight: '100vh', background: '#09090b' }}>
      <nav className="member-navbar" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(15px)', position: 'fixed', width: '100%', zIndex: 100 }}>
        <div className="member-nav-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <span className="brand-name">FitPhysique</span>
        </div>
        <div className="member-nav-links">
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
            <i className="bx bx-home-alt"></i> Trang chủ
          </button>
        </div>
      </nav>

      {/* Hero Header */}
      <div style={{ background: 'linear-gradient(to bottom, #18181b, #09090b)', padding: '160px 20px 80px', textAlign: 'center' }}>
        <h1 style={{ color: '#fff', fontSize: '3.5rem', fontWeight: 800, marginBottom: 16, textTransform: 'uppercase' }}>Chương Trình Tập Luyện</h1>
        <p style={{ color: '#a1a1aa', fontSize: '1.2rem', maxWidth: 800, margin: '0 auto' }}>
          Khám phá các dịch vụ cao cấp của FitPhysique. Chúng tôi mang đến những phương pháp tập luyện khoa học nhất để bạn đạt được mục tiêu hình thể.
        </p>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px 100px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: 30 }}>
          {PROGRAMS.map((prog) => (
            <div key={prog.id} id={prog.id} style={{ background: '#18181b', borderRadius: 24, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', transition: 'transform 0.3s' }}>
              <div style={{ background: prog.bg, padding: '40px 30px', position: 'relative' }}>
                 <i className={`bx ${prog.icon}`} style={{ position: 'absolute', right: 20, top: 20, fontSize: '6rem', color: 'rgba(255,255,255,0.1)' }}></i>
                 <h2 style={{ color: '#fff', fontSize: '2rem', fontWeight: 800, marginBottom: 8 }}>{prog.title}</h2>
                 <p style={{ color: prog.color, fontWeight: 600, fontSize: '1.1rem' }}>{prog.subtitle}</p>
              </div>
              <div style={{ padding: 30 }}>
                <p style={{ color: '#d4d4d8', lineHeight: 1.6, marginBottom: 24, fontSize: '1.05rem' }}>{prog.desc}</p>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                  <div>
                    <h4 style={{ color: '#fff', marginBottom: 12, fontSize: '1rem', textTransform: 'uppercase', letterSpacing: 1 }}>Lợi ích</h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {prog.benefits.map((b, i) => (
                        <li key={i} style={{ color: '#a1a1aa', fontSize: '0.9rem', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <i className="bx bx-check-circle" style={{ color: prog.color }}></i> {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 style={{ color: '#fff', marginBottom: 12, fontSize: '1rem', textTransform: 'uppercase', letterSpacing: 1 }}>Bài tập tiêu biểu</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {prog.exercises.map((ex, i) => (
                        <span key={i} style={{ background: 'rgba(255,255,255,0.05)', color: '#e4e4e7', padding: '4px 10px', borderRadius: 6, fontSize: '0.8rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                          {ex}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <button onClick={() => navigate(ctaPath)} style={{ width: '100%', marginTop: 30, padding: '14px', borderRadius: 12, background: 'transparent', border: `1px solid ${prog.color}`, color: prog.color, fontWeight: 700, cursor: 'pointer', transition: '0.2s' }} onMouseEnter={e => { e.currentTarget.style.background = prog.color; e.currentTarget.style.color = '#000'; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = prog.color; }}>
                   ĐĂNG KÝ NGAY
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div style={{ marginTop: 80, textAlign: 'center', background: 'rgba(255,255,255,0.02)', padding: '60px', borderRadius: 32, border: '1px solid rgba(255,255,255,0.05)' }}>
           <h2 style={{ color: '#fff', fontSize: '2.5rem', marginBottom: 20 }}>Bạn đã sẵn sàng thay đổi?</h2>
           <p style={{ color: '#a1a1aa', fontSize: '1.2rem', marginBottom: 40 }}>Hãy tham gia cùng 1000+ hội viên khác để có được vóc dáng mong muốn.</p>
           <button onClick={() => navigate(user?.loggedIn ? '/member/payment' : '/signup')} className="btn-primary" style={{ padding: '16px 48px', fontSize: '1.1rem', borderRadius: 14, background: '#f97316' }}>BẮT ĐẦU MIỄN PHÍ</button>
        </div>
      </div>
    </div>
  );
}

export default ExercisePage;
