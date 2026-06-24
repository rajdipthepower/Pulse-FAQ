import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, type Role } from '@/store/auth';

export function ProtectedRoute({ children, roles }: { children: JSX.Element; roles?: Role[] }) {
  const { user } = useAuth();
  const loc = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: loc }} replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
}
