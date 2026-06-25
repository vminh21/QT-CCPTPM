import { NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import './AdminLayout.css';

const NAV_ITEMS = [
  { path: '/admin',                label: 'Dashboard',         icon: 'bxs-dashboard',   exact: true },
  { path: '/admin/members',        label: 'Quản lý thành viên',icon: 'bxs-user-detail' },
  { path: '/admin/reports',        label: 'Báo cáo',           icon: 'bxs-report' },
  { path: '/admin/notifications',  label: 'Thông báo',         icon: 'bxs-bell' },
  { path: '/admin/blog',           label: 'Quản lý tin tức',   icon: 'bxs-news' },
];

const ADMIN_ONLY_ITEMS = [
  { path: '/admin/staff',    label: 'Quản lý nhân sự', icon: 'bxs-group' },
  { path: '/admin/trainer',  label: 'Quản lý PT',      icon: 'bx-user-pin' },
  { path: '/admin/equipment',label: 'Quản lý máy tập', icon: 'bxs-wrench' },
];

function AdminSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-logo">
        <h2>FitPhysique<span>Admin</span></h2>
      </div>

      <nav className="sidebar-nav">
        <ul>
          {NAV_ITEMS.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.exact}
                className={({ isActive }) => isActive ? 'active' : ''}
              >
                <i className={`bx ${item.icon}`}></i>
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}

          {/* Admin-only menu items */}
          {user?.role === 'admin' && ADMIN_ONLY_ITEMS.map((item) => (
            <li key={item.path}>
              <NavLink to={item.path} className={({ isActive }) => isActive ? 'active' : ''}>
                <i className={`bx ${item.icon}`}></i>
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}

          <li className="logout-item">
            <button onClick={handleLogout} className="logout-btn">
              <i className="bx bxs-log-out"></i>
              <span>Đăng xuất</span>
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
}

/**
 * AdminLayout: wrapper cho tất cả Admin pages
 */
export function AdminLayout({ children, title }) {
  const { user } = useAuth();

  return (
    <div className="admin-wrapper">
      <AdminSidebar />
      <main className="admin-main">
        <header className="admin-header">
          <h1>{title}</h1>
          <div className="admin-user-info">
            <span>Xin chào, <strong>{user?.full_name || 'Admin'}</strong></span>
            <div className="avatar-circle">
              <i className="bx bxs-user-circle"></i>
            </div>
          </div>
        </header>
        <div className="admin-content">
          {children}
        </div>
      </main>
    </div>
  );
}

export default AdminSidebar;
