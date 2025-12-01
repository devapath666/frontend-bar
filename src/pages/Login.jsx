import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { getUsuarios } from '../services/api';

function Login() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { setCurrentUser } = useStore();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await getUsuarios();
      const usuario = response.data.find(u => u.email === email);
      
      if (usuario) {
        setCurrentUser(usuario);
        
        // Redirigir según rol
        if (usuario.rol === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate('/mozo');
        }
      } else {
        alert('Usuario no encontrado');
      }
    } catch (error) {
      console.error('Error login:', error);
      alert('Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold text-center mb-6">
          Sistema de Comandas
        </h1>
        
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="admin@bar.com"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? 'Cargando...' : 'Ingresar'}
          </button>
        </form>
        
        <div className="mt-4 text-sm text-gray-600">
          <p>Usuarios de prueba:</p>
          <p>• admin@bar.com (Admin)</p>
          <p>• juan@bar.com (Mozo)</p>
        </div>
      </div>
    </div>
  );
}

export default Login;