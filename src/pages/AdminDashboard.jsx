import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <div className="bg-white border-b p-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold">Dashboard Admin</h1>
            <p className="text-gray-600">{currentUser?.nombre}</p>
          </div>

          <button
            onClick={handleLogout}
            className="text-sm text-red-500 border border-red-500 px-3 py-1 rounded"
          >
            Salir
          </button>
        </div>

        {/* TABS */}
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setTab('comandas')}
            className={`px-4 py-2 rounded-t ${tab === 'comandas' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Comandas
          </button>

          <button
            onClick={() => setTab('productos')}
            className={`px-4 py-2 rounded-t ${tab === 'productos' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Productos
          </button>

          <button
            onClick={() => setTab('mesas')}
            className={`px-4 py-2 rounded-t ${tab === 'mesas' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Mesas
          </button>

          <button
            onClick={() => setTab('usuarios')}
            className={`px-4 py-2 rounded-t ${tab === 'usuarios' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Usuarios
          </button>

          <button
            onClick={() => setTab('historial')}
            className={`px-4 py-2 rounded-t ${tab === 'historial' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
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
