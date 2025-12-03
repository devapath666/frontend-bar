import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { getHistorial } from '../services/api';

function HistorialComandas() {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistorial();
  }, []);

  const fetchHistorial = async () => {
    try {
      const res = await getHistorial();
      setHistorial(res.data);
    } catch (error) {
      Swal.fire('Error', 'No se pudo cargar el historial de ventas', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-500">
        Cargando historial...
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Historial de Ventas</h2>

      {historial.length === 0 && (
        <div className="text-gray-500 text-center py-10">
          No hay ventas registradas aún
        </div>
      )}

      {historial.map((comanda) => (
        <div key={comanda.id} className="bg-white border p-4 rounded-lg">
          <div className="flex justify-between mb-1">
            <p className="font-bold">Mesa {comanda.mesa.numero}</p>
            <p className="text-sm text-gray-600">
              {new Date(comanda.createdAt).toLocaleString('es-UY')}
            </p>
          </div>

          <p className="text-xs text-gray-600">
            Atendido por: {comanda.usuario?.nombre} — {comanda.usuarioEmail}
          </p>

          <div className="mt-2 space-y-1">
            {comanda.items.map((item) => (
              <p key={item.id} className="text-sm">
                {item.cantidad}x {item.producto.nombre}
                {item.observaciones && (
                  <span className="text-xs text-gray-500"> ({item.observaciones})</span>
                )}
              </p>
            ))}
          </div>

          <p className="font-bold mt-2">Total: ${comanda.total}</p>
        </div>
      ))}
    </div>
  );
}

export default HistorialComandas;
