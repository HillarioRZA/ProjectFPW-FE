import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { Box, CircularProgress } from '@mui/material';

interface RouteGuardProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user';
}

export const RouteGuard = ({ children, requiredRole }: RouteGuardProps) => {
  const { isAuthenticated, user, loading } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    const redirectPath = user.role === 'admin' ? '/admin/AdminDashboard' : '/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  if (location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/') {
    const redirectPath = user.role === 'admin' ? '/admin/AdminDashboard' : '/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}; 