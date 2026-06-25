import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import LoadingSpinner from './shared/LoadingSpinner';

/**
 * ProtectedRoute: Bảo vệ route theo role
 * 
 * Usage:
 *   <ProtectedRoute allowedRoles={['admin', 'staff']}>
 *     <AdminDashboard />
 *   </ProtectedRoute>
 */
function ProtectedRoute({ allowedRoles, children, redirectTo = '/login' }) {
  const { user, loading } = useAuth();

  // Đang check session → show loading
  if (loading) return <LoadingSpinner fullScreen />;

  // Chưa đăng nhập → về login
  if (!user || !user.loggedIn) {
    return <Navigate to={redirectTo} replace />;
  }

  // Sai role → về login
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect về đúng dashboard theo role
    if (user.role === 'admin' || user.role === 'staff') return <Navigate to="/admin" replace />;
    if (user.role === 'pt') return <Navigate to="/pt" replace />;
    if (user.role === 'member') return <Navigate to="/" replace />;
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}

export default ProtectedRoute;
