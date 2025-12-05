import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import useStore from '../store/useStore';
import { getUsuarios } from '../services/api';

function Login() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { setCurrentUser } = useStore();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Email requerido',
        text: 'Por favor ingresa tu email',
        background: '#1f2937',
        color: '#f3f4f6'
      });
      return;
    }

    setLoading(true);
    
    try {
      const response = await getUsuarios();
      const usuario = response.data.find(u => u.email === email);
      
      if (usuario) {
        setCurrentUser(usuario);
        
        // Mostrar bienvenida
        Swal.fire({
          icon: 'success',
          title: `¡Bienvenido ${usuario.nombre}!`,
          text: getRolText(usuario.rol),
          timer: 1500,
          showConfirmButton: false,
          background: '#1f2937',
          color: '#f3f4f6'
        });

        // Redirigir según rol
        switch(usuario.rol) {
          case 'ADMIN':
            navigate('/admin');
            break;
          case 'MOZO':
            navigate('/mozo');
            break;
          case 'COCINA':
            navigate('/cocina');
            break;
          default:
            console.error('Rol desconocido:', usuario.rol);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Rol de usuario no válido',
              background: '#1f2937',
              color: '#f3f4f6'
            });
        }
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Usuario no encontrado',
          text: 'El email ingresado no está registrado',
          background: '#1f2937',
          color: '#f3f4f6'
        });
      }
    } catch (error) {
      console.error('Error login:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error de conexión',
        text: 'No se pudo conectar con el servidor',
        background: '#1f2937',
        color: '#f3f4f6'
      });
    } finally {
      setLoading(false);
    }
  };

  const getRolText = (rol) => {
    switch(rol) {
      case 'ADMIN': return '👑 Acceso completo al sistema';
      case 'MOZO': return '🍽️ Gestión de comandas y mesas';
      case 'COCINA': return '👨‍🍳 Panel de cocina';
      default: return '';
    }
  };

  const getRolIcon = (rol) => {
    switch(rol) {
      case 'ADMIN': return '👑';
      case 'MOZO': return '🍽️';
      case 'COCINA': return '👨‍🍳';
      default: return '👤';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700">
        
        {/* HEADER */}
        <div className="text-center mb-8">
          <div className="bg-blue-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-4xl">🍽️</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Sistema de Bar
          </h1>
          <p className="text-gray-400 text-sm">
            Ingresa tu email para acceder
          </p>
        </div>
        
        {/* FORM */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-gray-300 mb-2 font-medium">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="tu@email.com"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition disabled:bg-gray-600 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Cargando...
              </span>
            ) : (
              'Ingresar'
            )}
          </button>
        </form>

        {/* FOOTER INFO */}
        <div className="mt-8 pt-6 border-t border-gray-700">
          <p className="text-gray-400 text-xs text-center mb-3">
            Roles disponibles:
          </p>
          <div className="flex justify-center gap-4 text-xs">
            <div className="text-center">
              <span className="text-2xl block mb-1">👑</span>
              <span className="text-gray-400">Admin</span>
            </div>
            <div className="text-center">
              <span className="text-2xl block mb-1">🍽️</span>
              <span className="text-gray-400">Mozo</span>
            </div>
            <div className="text-center">
              <span className="text-2xl block mb-1">👨‍🍳</span>
              <span className="text-gray-400">Cocina</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;