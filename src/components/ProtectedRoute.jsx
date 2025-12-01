import { Navigate } from 'react-router-dom';
import useStore from '../store/useStore';

function ProtectedRoute({ children, requiredRole }) {
  const { currentUser } = useStore();

  // Si no hay usuario logueado
  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  // Si requiere un rol específico y no coincide
  if (requiredRole && currentUser.rol !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;