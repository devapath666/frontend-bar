import { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import { getComandasActivas, updateEstadoComanda } from '../services/api';
import useSocket from '../hooks/useSocket';

function ComandasAdmin() {
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
      didOpen: () => Swal.showLoading()
    });

    try {
      await updateEstadoComanda(comandaId, nuevoEstado);

      Swal.fire({
        icon: 'success',
        title: 'Estado actualizado',
        text: `La comanda pasó a "${nuevoEstado}".`,
        timer: 1200,
        showConfirmButton: false
      });

      fetchComandas();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cambiar el estado'
      });
    }
  };

  /** 🎨 ESTILOS UI */
  const estadoConfig = {
    PENDIENTE: {
      color: 'bg-yellow-50 border-yellow-400',
      titulo: 'Pendientes',
      headerBg: 'bg-yellow-500'
    },
    EN_PREPARACION: {
      color: 'bg-blue-50 border-blue-400',
      titulo: 'En Preparación',
      headerBg: 'bg-blue-500'
    },
    LISTO: {
      color: 'bg-green-50 border-green-400',
      titulo: 'Listos',
      headerBg: 'bg-green-500'
    },
    ENTREGADO: {
      color: 'bg-purple-50 border-purple-400',
      titulo: 'Entregados',
      headerBg: 'bg-purple-500'
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

  // Agrupar comandas por estado
  const comandasAgrupadas = {
    PENDIENTE: comandas.filter(c => c.estado === 'PENDIENTE'),
    EN_PREPARACION: comandas.filter(c => c.estado === 'EN_PREPARACION'),
    LISTO: comandas.filter(c => c.estado === 'LISTO'),
    ENTREGADO: comandas.filter(c => c.estado === 'ENTREGADO')
  };

  /** 🌀 LOADING */
  if (loading) {
    return (
      <div className="h-40 flex items-center justify-center text-gray-500">
        Cargando comandas...
      </div>
    );
  }

  /** 🖥️ RENDER */
  return (
    <div className="p-4 h-screen overflow-hidden">
      {/* COLUMNAS DE ESTADOS */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-full">
        {Object.entries(estadoConfig).map(([estado, config]) => (
          <div key={estado} className="flex flex-col h-full">
            {/* HEADER COLUMNA */}
            <div className={`${config.headerBg} text-white p-4 rounded-t-lg`}>
              <h2 className="text-xl font-bold">{config.titulo}</h2>
              <p className="text-sm opacity-90">
                {comandasAgrupadas[estado].length} comanda{comandasAgrupadas[estado].length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* LISTA COMANDAS */}
            <div className="flex-1 bg-gray-100 p-3 rounded-b-lg overflow-y-auto space-y-3">
              {comandasAgrupadas[estado].length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  Sin comandas
                </div>
              ) : (
                comandasAgrupadas[estado].map((comanda) => (
                  <div
                    key={comanda.id}
                    className={`border rounded-lg p-4 shadow-sm ${config.color} bg-white`}
                  >
                    {/* HEADER CARD */}
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-bold text-2xl">
                          Mesa {comanda.mesa.numero}
                        </p>
                        <p className="text-xs text-gray-500">
                          #{comanda.id.slice(0, 6)}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {new Date(comanda.createdAt).toLocaleTimeString('es-AR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>

                    {/* ITEMS */}
                    <div className="space-y-2 border-t pt-3 mb-3 text-sm">
                      {comanda.items.map((item) => (
                        <div key={item.id} className="flex justify-between">
                          <span className="font-medium">{item.cantidad}x {item.producto.nombre}</span>
                          {item.observaciones && (
                            <span className="text-xs italic text-gray-600">
                              ({item.observaciones})
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* TOTAL */}
                    <div className="flex justify-between border-t pt-3 mb-3 font-semibold">
                      <span>Total:</span>
                      <span>${comanda.total}</span>
                    </div>

                    {/* BOTON */}
                    {getSiguienteEstado(comanda.estado) && (
                      <button
                        onClick={() =>
                          handleCambiarEstado(comanda.id, getSiguienteEstado(comanda.estado))
                        }
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition"
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
  );
}

export default ComandasAdmin;