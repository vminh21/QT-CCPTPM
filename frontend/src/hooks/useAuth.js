import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

/**
 * Custom hook để dùng AuthContext ở bất kỳ component nào
 * Usage: const { user, loading, login, logout } = useAuth();
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth phải được dùng bên trong <AuthProvider>');
  }
  return ctx;
}

export default useAuth;
