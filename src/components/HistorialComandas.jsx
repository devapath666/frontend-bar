import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { getHistorial } from '../services/api';

function HistorialComandas() {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mesSeleccionado, setMesSeleccionado] = useState('TODOS');

  useEffect(() => {
    fetchHistorial();
  }, []);

  const fetchHistorial = async () => {
    try {
      const res = await getHistorial();
      setHistorial(res.data);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cargar el historial',
        background: '#1f2937',
        color: '#f3f4f6'
      });
    } finally {
      setLoading(false);
    }
  };

  // Agrupar comandas por mes/año
  const agruparPorMes = () => {
    const grupos = {};
    
    historial.forEach(comanda => {
      const fecha = new Date(comanda.createdAt);
      const mes = fecha.getMonth();
      const año = fecha.getFullYear();
      const key = `${año}-${mes}`;
      
      if (!grupos[key]) {
        grupos[key] = {
          mes,
          año,
          comandas: [],
          total: 0,
          cantidad: 0
        };
      }
      
      grupos[key].comandas.push(comanda);
      grupos[key].total += comanda.total;
      grupos[key].cantidad += 1;
    });

    // Convertir a array y ordenar por fecha (más reciente primero)
    return Object.values(grupos).sort((a, b) => {
      if (a.año !== b.año) return b.año - a.año;
      return b.mes - a.mes;
    });
  };

  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const getNombreMes = (mes, año) => {
    return `${meses[mes]} ${año}`;
  };

  const comandasPorMes = agruparPorMes();
  const totalGeneral = historial.reduce((sum, c) => sum + c.total, 0);

  const comandasFiltradas = mesSeleccionado === 'TODOS' 
    ? historial 
    : comandasPorMes.find(g => `${g.año}-${g.mes}` === mesSeleccionado)?.comandas || [];

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-300">
        Cargando historial...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-800 p-4">
      
      {/* HEADER CON ESTADÍSTICAS */}
      <div className="bg-gray-700 rounded-lg p-4 mb-6 shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-4">Historial de Ventas</h2>
        
        {/* Stats generales */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
          <div className="bg-gray-600 p-4 rounded-lg">
            <p className="text-gray-400 text-sm">Total Vendido</p>
            <p className="text-2xl font-bold text-green-400">${totalGeneral}</p>
          </div>
          <div className="bg-gray-600 p-4 rounded-lg">
            <p className="text-gray-400 text-sm">Comandas</p>
            <p className="text-2xl font-bold text-blue-400">{historial.length}</p>
          </div>
          <div className="bg-gray-600 p-4 rounded-lg">
            <p className="text-gray-400 text-sm">Promedio</p>
            <p className="text-2xl font-bold text-purple-400">
              ${historial.length > 0 ? (totalGeneral / historial.length).toFixed(0) : 0}
            </p>
          </div>
        </div>

        {/* Filtro por mes */}
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setMesSeleccionado('TODOS')}
            className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
              mesSeleccionado === 'TODOS'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
            }`}
          >
            Todos ({historial.length})
          </button>
          {comandasPorMes.map(grupo => {
            const key = `${grupo.año}-${grupo.mes}`;
            return (
              <button
                key={key}
                onClick={() => setMesSeleccionado(key)}
                className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                  mesSeleccionado === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}
              >
                {getNombreMes(grupo.mes, grupo.año)} ({grupo.cantidad})
              </button>
            );
          })}
        </div>
      </div>

      {/* RESUMEN POR MES */}
      {mesSeleccionado === 'TODOS' && comandasPorMes.length > 0 && (
        <div className="bg-gray-700 rounded-lg p-4 mb-6 shadow-lg">
          <h3 className="text-lg font-bold text-white mb-4 border-b border-gray-600 pb-2">
            Resumen Mensual
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {comandasPorMes.map(grupo => {
              const key = `${grupo.año}-${grupo.mes}`;
              return (
                <div
                  key={key}
                  className="bg-gray-600 rounded-lg p-4 border border-gray-500 hover:border-blue-500 transition cursor-pointer"
                  onClick={() => setMesSeleccionado(key)}
                >
                  <p className="text-white font-bold text-lg mb-2">
                    {getNombreMes(grupo.mes, grupo.año)}
                  </p>
                  <div className="space-y-1">
                    <p className="text-gray-400 text-sm">
                      📊 {grupo.cantidad} comandas
                    </p>
                    <p className="text-green-400 text-2xl font-bold">
                      ${grupo.total}
                    </p>
                    <p className="text-gray-400 text-xs">
                      Promedio: ${(grupo.total / grupo.cantidad).toFixed(0)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DETALLE DE COMANDAS */}
      <div className="bg-gray-700 rounded-lg p-4 shadow-lg">
        <div className="flex justify-between items-center mb-4 border-b border-gray-600 pb-2">
          <h3 className="text-lg font-bold text-white">
            {mesSeleccionado === 'TODOS' 
              ? 'Todas las Comandas' 
              : `Comandas de ${getNombreMes(
                  comandasPorMes.find(g => `${g.año}-${g.mes}` === mesSeleccionado)?.mes,
                  comandasPorMes.find(g => `${g.año}-${g.mes}` === mesSeleccionado)?.año
                )}`
            }
          </h3>
          {mesSeleccionado !== 'TODOS' && (
            <p className="text-green-400 font-bold text-xl">
              Total: ${comandasPorMes.find(g => `${g.año}-${g.mes}` === mesSeleccionado)?.total}
            </p>
          )}
        </div>

        {comandasFiltradas.length === 0 ? (
          <div className="text-gray-400 text-center py-10">
            No hay ventas registradas
          </div>
        ) : (
          <div className="space-y-3">
            {comandasFiltradas
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map((comanda) => (
                <div key={comanda.id} className="bg-gray-600 border border-gray-500 p-4 rounded-lg hover:border-blue-500 transition">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold text-white text-lg">Mesa {comanda.mesa.numero}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(comanda.createdAt).toLocaleString('es-UY', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <p className="text-xs text-gray-400">
                        👤 {comanda.usuario?.nombre || comanda.usuarioEmail}
                      </p>
                    </div>
                    <p className="text-2xl font-bold text-green-400">${comanda.total}</p>
                  </div>

                  <div className="mt-3 space-y-1 border-t border-gray-500 pt-3">
                    {comanda.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm text-gray-300">
                        <span className="font-medium">
                          {item.cantidad}x {item.producto.nombre}
                        </span>
                        {item.observaciones && (
                          <span className="text-xs italic text-gray-400 bg-gray-700 px-2 py-1 rounded">
                            {item.observaciones}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default HistorialComandas;