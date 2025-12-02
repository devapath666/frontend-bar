import { Navigate } from 'react-router-dom';
import useStore from '../store/useStore';

function ProtectedRoute({ children, requiredRole }) {
  const { currentUser } = useStore();

  console.log("🟡 ProtectedRoute:", { currentUser, requiredRole });

  // 🛑 Si currentUser es undefined → NO ROMPAS
  if (!currentUser) {
    console.warn("⛔ No hay usuario logueado. Redireccionando a /");
    return <Navigate to="/" replace />;
  }

  // 🛑 Si rol no existe → NO ROMPAS
  if (!currentUser.rol) {
    console.error("⚠️ El usuario no tiene 'rol' definido:", currentUser);
    return <Navigate to="/" replace />;
  }

  // 🛑 Si no coincide el rol
  if (requiredRole && currentUser.rol !== requiredRole) {
    console.warn(`🚫 Acceso denegado. Rol requerido: ${requiredRole}, rol actual: ${currentUser.rol}`);
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
