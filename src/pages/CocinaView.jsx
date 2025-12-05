import { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { getComandasActivas, updateEstadoComanda } from '../services/api';
import useSocket from '../hooks/useSocket';
import useStore from '../store/useStore';

function CocinaView() {
  const { currentUser, logout } = useStore();
  const navigate = useNavigate();
  const [comandas, setComandas] = useState([]);
  const [loading, setLoading] = useState(true);

  /** 🔥 CARGA DE COMANDAS */
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

  /** ⏳ CARGA INICIAL */
  useEffect(() => {
    fetchComandas();
  }, [fetchComandas]);

  /** 🔌 SOCKETS */
  useSocket('comanda_creada', useCallback(fetchComandas, [fetchComandas]));
  useSocket('comanda_actualizada', useCallback(fetchComandas, [fetchComandas]));

  /** 🔥 CAMBIAR ESTADO */
  const handleCambiarEstado = async (comandaId, nuevoEstado) => {
    Swal.fire({
      title: 'Actualizando...',
      text: `Cambiando a "${nuevoEstado}"`,
      allowOutsideClick: false,
      background: '#1f2937',
      color: '#f3f4f6',
      didOpen: () => Swal.showLoading()
    });

    try {
      await updateEstadoComanda(comandaId, nuevoEstado);

      Swal.fire({
        icon: 'success',
        title: 'Estado actualizado',
        text: `La comanda pasó a "${nuevoEstado}".`,
        timer: 1200,
        showConfirmButton: false,
        background: '#1f2937',
        color: '#f3f4f6'
      });

      fetchComandas();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cambiar el estado',
        background: '#1f2937',
        color: '#f3f4f6'
      });
    }
  };

  const handleLogout = () => {
    Swal.fire({
      title: '¿Cerrar sesión?',
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
      }
    });
  };

  /** 🎨 ESTILOS UI - SOLO 3 COLUMNAS PARA COCINA */
  const estadoConfig = {
    PENDIENTE: {
      color: 'bg-yellow-100 border-yellow-500',
      titulo: 'Pendientes',
      headerBg: 'bg-yellow-500',
      columnBg: 'bg-gray-700'
    },
    EN_PREPARACION: {
      color: 'bg-blue-100 border-blue-500',
      titulo: 'En Preparación',
      headerBg: 'bg-blue-500',
      columnBg: 'bg-gray-700'
    },
    LISTO: {
      color: 'bg-green-100 border-green-500',
      titulo: 'Listos',
      headerBg: 'bg-green-500',
      columnBg: 'bg-gray-700'
    }
  };

  const getSiguienteEstado = (estadoActual) => {
    switch (estadoActual) {
      case 'PENDIENTE': return 'EN_PREPARACION';
      case 'EN_PREPARACION': return 'LISTO';
      default: return null;
    }
  };

  const getBotonTexto = (estadoActual) => {
    switch (estadoActual) {
      case 'PENDIENTE': return 'Iniciar';
      case 'EN_PREPARACION': return 'Marcar Listo';
      default: return null;
    }
  };

  // Agrupar comandas por estado (solo 3 estados para cocina)
  const comandasAgrupadas = {
    PENDIENTE: comandas.filter(c => c.estado === 'PENDIENTE'),
    EN_PREPARACION: comandas.filter(c => c.estado === 'EN_PREPARACION'),
    LISTO: comandas.filter(c => c.estado === 'LISTO')
  };

  /** 🌀 LOADING */
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-gray-300">Cargando comandas...</p>
      </div>
    );
  }

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

      {/* COMANDAS KANBAN BOARD - 3 COLUMNAS */}
      <div className="p-4 h-screen overflow-hidden bg-gray-800">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
          {Object.entries(estadoConfig).map(([estado, config]) => (
            <div key={estado} className="flex flex-col h-full">
              {/* HEADER COLUMNA */}
              <div className={`${config.headerBg} text-white p-4 rounded-t-lg shadow-lg`}>
                <h2 className="text-xl font-bold">{config.titulo}</h2>
                <p className="text-sm opacity-90">
                  {comandasAgrupadas[estado].length} comanda{comandasAgrupadas[estado].length !== 1 ? 's' : ''}
                </p>
              </div>

              {/* LISTA COMANDAS */}
              <div className={`flex-1 ${config.columnBg} p-3 rounded-b-lg overflow-y-auto space-y-3`}>
                {comandasAgrupadas[estado].length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    Sin comandas
                  </div>
                ) : (
                  comandasAgrupadas[estado].map((comanda) => (
                    <div
                      key={comanda.id}
                      className={`border-2 rounded-lg p-4 shadow-lg ${config.color} bg-white`}
                    >
                      {/* HEADER CARD */}
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-bold text-3xl text-gray-800">
                            Mesa {comanda.mesa.numero}
                          </p>
                          <p className="text-xs text-gray-600">
                            #{comanda.id.slice(0, 6)}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-700">
                            {new Date(comanda.createdAt).toLocaleTimeString('es-AR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>

                      {/* ITEMS */}
                      <div className="space-y-2 border-t-2 border-gray-300 pt-3 mb-3 text-sm">
                        {comanda.items.map((item) => (
                          <div key={item.id} className="flex flex-col gap-1">
                            <span className="font-bold text-gray-800 text-base">
                              {item.cantidad}x {item.producto.nombre}
                            </span>
                            {item.observaciones && (
                              <span className="text-xs font-semibold text-red-600 bg-red-100 px-2 py-1 rounded">
                                ⚠️ {item.observaciones}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* BOTON */}
                      {getSiguienteEstado(comanda.estado) && (
                        <button
                          onClick={() =>
                            handleCambiarEstado(comanda.id, getSiguienteEstado(comanda.estado))
                          }
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold text-base transition shadow-md"
                        >
                          {getBotonTexto(comanda.estado)}
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CocinaView;