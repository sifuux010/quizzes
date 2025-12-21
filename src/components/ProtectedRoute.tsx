import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const ProtectedRoute = ({ children, redirectTo = '/student-entry' }: ProtectedRouteProps) => {
  const studentName = localStorage.getItem('studentName');
  const location = useLocation();

  if (!studentName) {
    // Redirect to login page, saving the current location they were trying to access
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
