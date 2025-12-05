import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import ComandasAdmin from '../components/ComandasAdmin';

function CocinaView() {
  const { currentUser, logout } = useStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* HEADER SIMPLE PARA COCINA */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Panel de Cocina</h1>
            <p className="text-gray-400">👨‍🍳 {currentUser?.nombre}</p>
          </div>

          <button
            onClick={handleLogout}
            className="text-sm text-red-400 border border-red-500 px-4 py-2 rounded hover:bg-red-500 hover:text-white transition"
          >
            Salir
          </button>
        </div>
      </div>

      {/* COMANDAS KANBAN BOARD */}
      <ComandasAdmin />
    </div>
  );
}

export default CocinaView;