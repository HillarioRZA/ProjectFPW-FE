import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

interface PublicRouteProps {
  children: React.ReactNode;
}

export default function PublicRoute({ children }: PublicRouteProps) {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  if (isAuthenticated && user) {
    return <Navigate to={user.role === 'admin' ? '/admin/AdminDashboard' : '/dashboard'} replace />;
  }

  return <>{children}</>;
}; 