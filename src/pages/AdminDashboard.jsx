import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import useStore from '../store/useStore';

import ComandasAdmin from '../components/ComandasAdmin';
import ProductosAdmin from '../components/ProductosAdmin';
import MesasAdmin from '../components/MesasAdmin';
import UsuariosAdmin from '../components/UsuariosAdmin';
import HistorialComandas from '../components/HistorialComandas';

function AdminDashboard() {
  const [tab, setTab] = useState('comandas');
  const { currentUser, logout } = useStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    Swal.fire({
      title: '¿Cerrar sesión?',
      text: '¿Estás seguro de que deseas salir?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar',
      background: '#1f2937',
      color: '#f3f4f6'
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        navigate('/');
        Swal.fire({
          icon: 'success',
          title: 'Sesión cerrada',
          text: 'Hasta pronto',
          timer: 1500,
          showConfirmButton: false,
          background: '#1f2937',
          color: '#f3f4f6'
        });
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-900">

      {/* HEADER */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 shadow-lg">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard Admin</h1>
            <p className="text-gray-400">{currentUser?.nombre}</p>
          </div>

          <button
            onClick={handleLogout}
            className="text-sm text-red-400 border border-red-500 px-3 py-1 rounded hover:bg-red-500 hover:text-white transition"
          >
            Salir
          </button>
        </div>

        {/* TABS */}
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setTab('comandas')}
            className={`px-4 py-2 rounded-t font-medium transition ${
              tab === 'comandas' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Comandas
          </button>

          <button
            onClick={() => setTab('productos')}
            className={`px-4 py-2 rounded-t font-medium transition ${
              tab === 'productos' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Productos
          </button>

          <button
            onClick={() => setTab('mesas')}
            className={`px-4 py-2 rounded-t font-medium transition ${
              tab === 'mesas' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Mesas
          </button>

          <button
            onClick={() => setTab('usuarios')}
            className={`px-4 py-2 rounded-t font-medium transition ${
              tab === 'usuarios' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Usuarios
          </button>

          <button
            onClick={() => setTab('historial')}
            className={`px-4 py-2 rounded-t font-medium transition ${
              tab === 'historial' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Historial
          </button>
        </div>
      </div>

      {/* CONTENIDO */}
      <div className="p-4">
        {tab === 'comandas' && <ComandasAdmin />}
        {tab === 'productos' && <ProductosAdmin />}
        {tab === 'mesas' && <MesasAdmin />}
        {tab === 'usuarios' && <UsuariosAdmin />}
        {tab === 'historial' && <HistorialComandas />}
      </div>

    </div>
  );
}

export default AdminDashboard;