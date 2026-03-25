import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  console.log("ProtectedRoute currentUser:", currentUser);
  return currentUser ? <Outlet /> : <Navigate to="/login"  />;
};

export default ProtectedRoute;