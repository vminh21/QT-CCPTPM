import { NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import './AdminLayout.css';

const MEMBER_NAV = [
  { path: '/member',               label: 'Tổng quan',     icon: 'bxs-dashboard', exact: true },
  { path: '/member/profile',       label: 'Hồ sơ của tôi', icon: 'bxs-user-detail' },
  { path: '/member/payment',       label: 'Mua gói tập',   icon: 'bx-credit-card' },
  { path: '/member/notifications', label: 'Thông báo',     icon: 'bxs-bell' },
];

export function MemberLayout({ children, title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => { await logout(); navigate('/login', { replace: true }); };

  return (
    <div className="admin-wrapper">
      <aside className="admin-sidebar">
        <div className="sidebar-logo">
          <h2>FitPhysique<span>Member</span></h2>
        </div>
        <nav className="sidebar-nav">
          <ul>
            {MEMBER_NAV.map(item => (
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
            <span>Xin chào, <strong>{user?.full_name || 'Member'}</strong></span>
            <div className="avatar-circle"><i className="bx bxs-user-circle"></i></div>
          </div>
        </header>
        <div className="admin-content">{children}</div>
      </main>
    </div>
  );
}

export default MemberLayout;
