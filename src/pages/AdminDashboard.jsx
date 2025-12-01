import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getComandasActivas, updateEstadoComanda } from '../services/api';
import useStore from '../store/useStore';
import useSocket from '../hooks/useSocket';
import ProductosAdmin from '../components/ProductosAdmin';
import MesasAdmin from '../components/MesasAdmin';
import UsuariosAdmin from '../components/UsuariosAdmin';
import HistorialComandas from '../components/HistorialComandas';


function AdminDashboard() {
  const [tab, setTab] = useState('comandas'); // 'comandas' | 'productos' | 'mesas'
  const [comandas, setComandas] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser, logout } = useStore();
  const navigate = useNavigate();
  

  const fetchComandas = useCallback(async () => {
    try {
      const response = await getComandasActivas();
      setComandas(response.data);
    } catch (error) {
      console.error('Error al cargar comandas:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComandas();
  }, [fetchComandas]);

  useSocket('comanda_creada', useCallback(() => {
    console.log('Nueva comanda recibida');
    fetchComandas();
  }, [fetchComandas]));

  useSocket('comanda_actualizada', useCallback(() => {
    console.log('Comanda actualizada');
    fetchComandas();
  }, [fetchComandas]));

  const handleCambiarEstado = async (comandaId, nuevoEstado) => {
    try {
      await updateEstadoComanda(comandaId, nuevoEstado);
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      alert('Error al cambiar estado');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'PENDIENTE': return 'bg-yellow-100 border-yellow-400';
      case 'EN_PREPARACION': return 'bg-blue-100 border-blue-400';
      case 'LISTO': return 'bg-green-100 border-green-400';
      case 'ENTREGADO': return 'bg-purple-100 border-purple-400';
      default: return 'bg-gray-100 border-gray-400';
    }
  };

  const getSiguienteEstado = (estadoActual) => {
    switch (estadoActual) {
      case 'PENDIENTE': return 'EN_PREPARACION';
      case 'EN_PREPARACION': return 'LISTO';
      case 'ENTREGADO': return 'PAGADO';
      default: return null;
    }
  };

  const getBotonTexto = (estadoActual) => {
    switch (estadoActual) {
      case 'PENDIENTE': return 'Iniciar';
      case 'EN_PREPARACION': return 'Marcar Listo';
      case 'ENTREGADO': return 'Marcar Pagado';
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setTab('comandas')}
            className={`px-4 py-2 rounded-t whitespace-nowrap ${
              tab === 'comandas'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Comandas
          </button>
          <button
            onClick={() => setTab('productos')}
            className={`px-4 py-2 rounded-t whitespace-nowrap ${
              tab === 'productos'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Productos
          </button>
          <button
            onClick={() => setTab('mesas')}
            className={`px-4 py-2 rounded-t whitespace-nowrap ${
              tab === 'mesas'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Mesas
          </button>
          <button
            onClick={() => setTab('usuarios')}
            className={`px-4 py-2 rounded-t whitespace-nowrap ${
              tab === 'usuarios'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Usuarios
          </button>
<button
  onClick={() => setTab('historial')}
  className={`px-4 py-2 rounded-t whitespace-nowrap ${
    tab === 'historial'
      ? 'bg-blue-500 text-white'
      : 'bg-gray-200 text-gray-700'
  }`}
>
  Historial
</button>


        </div>
      </div>

      {/* Contenido según tab */}
      {tab === 'historial' ? (
  <HistorialComandas />
) : tab === 'usuarios' ? (
  <UsuariosAdmin />
) : tab === 'mesas' ? (
  <MesasAdmin />
) : tab === 'productos' ? (
  <ProductosAdmin />
) : (
        <div className="p-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            <div className="bg-yellow-100 p-3 rounded">
              <p className="text-xs text-gray-600">Pendientes</p>
              <p className="text-xl font-bold">
                {comandas.filter(c => c.estado === 'PENDIENTE').length}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded">
              <p className="text-xs text-gray-600">En Prep.</p>
              <p className="text-xl font-bold">
                {comandas.filter(c => c.estado === 'EN_PREPARACION').length}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded">
              <p className="text-xs text-gray-600">Listos</p>
              <p className="text-xl font-bold">
                {comandas.filter(c => c.estado === 'LISTO').length}
              </p>
            </div>
          </div>

          {/* Comandas */}
          {comandas.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No hay comandas activas
            </div>
          ) : (
            <div className="space-y-4">
              {comandas.map((comanda) => (
                <div
                  key={comanda.id}
                  className={`border-2 rounded-lg p-4 ${getEstadoColor(comanda.estado)}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold text-lg">{comanda.mesa.numero}</p>
<p className="text-xs text-gray-600">
  Pedido #{comanda.id.slice(0, 8)}
</p>
<p className="text-xs text-blue-600 mt-1">
  👤 {comanda.usuarioEmail}
</p>

                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600">
                        {new Date(comanda.createdAt).toLocaleTimeString('es-AR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <p className="text-xs font-semibold">{comanda.estado}</p>
                    </div>
                  </div>

                  <div className="mb-3 space-y-1">
                    {comanda.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>
                          {item.cantidad}x {item.producto.nombre}
                        </span>
                        {item.observaciones && (
                          <span className="text-xs text-gray-600 italic">
                            ({item.observaciones})
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center mb-3 pt-2 border-t border-gray-300">
                    <span className="font-bold">Total:</span>
                    <span className="font-bold">${comanda.total}</span>
                  </div>

                  {getSiguienteEstado(comanda.estado) && (
                    <button
                      onClick={() =>
                        handleCambiarEstado(comanda.id, getSiguienteEstado(comanda.estado))
                      }
                      className="w-full bg-blue-500 text-white py-2 rounded font-semibold"
                    >
                      {getBotonTexto(comanda.estado)}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;