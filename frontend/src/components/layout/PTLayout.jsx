import { NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import '../../components/layout/AdminLayout.css';
import '../../pages/PT/PT.css';

const PT_NAV = [
  { path: '/pt',           label: 'Tổng quan',     icon: 'bxs-dashboard', exact: true },
  { path: '/pt/schedule',  label: 'Lịch dạy',      icon: 'bxs-calendar' },
  { path: '/pt/students',  label: 'Học viên',       icon: 'bxs-user-detail' },
  { path: '/pt/workouts',  label: 'Bài tập',        icon: 'bxs-dumbbell' },
  { path: '/pt/reviews',   label: 'Đánh giá',       icon: 'bxs-star' },
];

export function PTLayout({ children, title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => { await logout(); navigate('/login', { replace: true }); };

  return (
    <div className="admin-wrapper">
      <aside className="admin-sidebar">
        <div className="sidebar-logo">
          <h2>FitPhysique<span>PT</span></h2>
        </div>
        <nav className="sidebar-nav">
          <ul>
            {PT_NAV.map(item => (
              <li key={item.path}>
                <NavLink to={item.path} end={item.exact} className={({ isActive }) => isActive ? 'active' : ''}>
                  <i className={`bx ${item.icon}`}></i><span>{item.label}</span>
                </NavLink>
              </li>
            ))}
            <li className="logout-item">
              <button onClick={handleLogout} className="logout-btn">
                <i className="bx bxs-log-out"></i><span>Đăng xuất</span>
              </button>
            </li>
          </ul>
        </nav>
      </aside>
      <main className="admin-main">
        <header className="admin-header">
          <h1>{title}</h1>
          <div className="admin-user-info">
            <span>Xin chào, <strong>{user?.full_name || 'Trainer'}</strong></span>
            <div className="avatar-circle"><i className="bx bxs-user-circle"></i></div>
          </div>
        </header>
        <div className="admin-content">{children}</div>
      </main>
    </div>
  );
}
