import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMesas, getProductos, createComanda, getComandasActivas, updateEstadoComanda } from '../services/api';
import useStore from '../store/useStore';
import useSocket from '../hooks/useSocket';

function MozoApp() {
  const [vista, setVista] = useState('mesas'); // 'mesas' | 'menu' | 'listos' | 'cobrar'
  const [mesas, setMesas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [comandasListas, setComandasListas] = useState([]);
  const [comandasEntregadas, setComandasEntregadas] = useState([]);
  const [mesaSeleccionada, setMesaSeleccionada] = useState(null);
  const [carrito, setCarrito] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser, logout } = useStore();
  const navigate = useNavigate();

  // Definir TODAS las funciones antes de usarlas
  const fetchComandasListas = useCallback(async () => {
    try {
      const response = await getComandasActivas();
      const listos = response.data.filter(c => c.estado === 'LISTO');
      setComandasListas(listos);
    } catch (error) {
      console.error('Error al cargar comandas listas:', error);
    }
  }, []);

  const fetchComandasEntregadas = useCallback(async () => {
    try {
      const response = await getComandasActivas();
      const entregadas = response.data.filter(c => c.estado === 'ENTREGADO');
      setComandasEntregadas(entregadas);
    } catch (error) {
      console.error('Error al cargar comandas entregadas:', error);
    }
  }, []);

const fetchData = useCallback(async () => {
  try {
    const [mesasRes, productosRes] = await Promise.all([
      getMesas(),
      getProductos()
    ]);
    
    // Ordenar mesas por ID (orden de creación)
    const mesasOrdenadas = mesasRes.data.sort((a, b) => a.id - b.id);
    
    setMesas(mesasOrdenadas);
    setProductos(productosRes.data);
    await fetchComandasListas();
    await fetchComandasEntregadas();
  } catch (error) {
    console.error('Error al cargar datos:', error);
  } finally {
    setLoading(false);
  }
}, [fetchComandasListas, fetchComandasEntregadas]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // WebSocket: Actualizar cuando hay cambios
  useSocket('comanda_actualizada', useCallback(() => {
    console.log('Comanda actualizada - actualizando mozo');
    fetchComandasListas();
    fetchComandasEntregadas();
    fetchData();
  }, [fetchComandasListas, fetchComandasEntregadas, fetchData]));

  useSocket('comanda_creada', useCallback(() => {
    console.log('Nueva comanda creada - actualizando mesas');
    fetchData();
  }, [fetchData]));

  const seleccionarMesa = (mesa) => {
    if (mesa.estado === 'DISPONIBLE') {
      setMesaSeleccionada(mesa);
      setCarrito([]);
      setVista('menu');
    }
  };

  const agregarAlCarrito = (producto) => {
    const itemExistente = carrito.find(item => item.productoId === producto.id);
    
    if (itemExistente) {
      setCarrito(carrito.map(item =>
        item.productoId === producto.id
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      ));
    } else {
      setCarrito([...carrito, {
        productoId: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        cantidad: 1,
        observaciones: ''
      }]);
    }
  };

  const quitarDelCarrito = (productoId) => {
    const item = carrito.find(i => i.productoId === productoId);
    if (item.cantidad > 1) {
      setCarrito(carrito.map(i =>
        i.productoId === productoId
          ? { ...i, cantidad: i.cantidad - 1 }
          : i
      ));
    } else {
      setCarrito(carrito.filter(i => i.productoId !== productoId));
    }
  };

  const calcularTotal = () => {
    return carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  };

  const enviarComanda = async () => {
    if (carrito.length === 0) {
      alert('Agregá productos al pedido');
      return;
    }

    if (!currentUser || !currentUser.id) {
      alert('Error de sesión. Por favor volvé a iniciar sesión.');
      logout();
      navigate('/');
      return;
    }

    try {
      const comandaData = {
        mesaId: mesaSeleccionada.id,
        usuarioId: currentUser.id,
        usuarioEmail: currentUser.email,
        items: carrito.map(item => ({
          productoId: item.productoId,
          cantidad: item.cantidad,
          observaciones: item.observaciones || null
        }))
      };

      await createComanda(comandaData);
      alert('Comanda enviada exitosamente');
      
      setMesaSeleccionada(null);
      setCarrito([]);
      setVista('mesas');
    } catch (error) {
      console.error('Error al enviar comanda:', error);
      alert('Error al enviar comanda');
    }
  };

  const marcarComoEntregado = async (comandaId) => {
    try {
      await updateEstadoComanda(comandaId, 'ENTREGADO');
      alert('Pedido marcado como entregado');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al marcar como entregado');
    }
  };

  const marcarComoPagado = async (comandaId) => {
    if (!window.confirm('¿Confirmar que el cliente pagó?')) {
      return;
    }
    
    try {
      await updateEstadoComanda(comandaId, 'PAGADO');
      alert('Pago registrado. Mesa liberada.');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al registrar pago');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  // VISTA: Pedidos para cobrar
  if (vista === 'cobrar') {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="mb-6">
          <button
            onClick={() => setVista('mesas')}
            className="text-blue-500 text-sm mb-2"
          >
            ← Volver
          </button>
          <h1 className="text-2xl font-bold">Pedidos por Cobrar</h1>
          <p className="text-gray-600">Comandas entregadas pendientes de pago</p>
        </div>

        {comandasEntregadas.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No hay pedidos por cobrar
          </div>
        ) : (
          <div className="space-y-4">
            {comandasEntregadas.map((comanda) => (
              <div
                key={comanda.id}
                className="bg-purple-100 border-2 border-purple-400 rounded-lg p-4"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold text-lg">{comanda.mesa.numero}</p>
                    <p className="text-xs text-gray-600">
                      #{comanda.usuarioEmail}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-600">
                      {new Date(comanda.createdAt).toLocaleTimeString('es-AR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    <p className="text-xs font-semibold text-purple-600">ENTREGADO</p>
                  </div>
                </div>

                <div className="mb-3 space-y-1">
                  {comanda.items.map((item) => (
                    <div key={item.id} className="text-sm">
                      {item.cantidad}x {item.producto.nombre}
                      {item.observaciones && (
                        <span className="text-xs text-gray-600 italic ml-2">
                          ({item.observaciones})
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center mb-3 pt-2 border-t border-purple-300">
                  <span className="font-bold text-lg">Total a cobrar:</span>
                  <span className="font-bold text-lg text-purple-600">${comanda.total}</span>
                </div>

                <button
                  onClick={() => marcarComoPagado(comanda.id)}
                  className="w-full bg-purple-500 text-white py-3 rounded font-bold"
                >
                  Marcar como PAGADO
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // VISTA: Pedidos listos para entregar
  if (vista === 'listos') {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="mb-6">
          <button
            onClick={() => setVista('mesas')}
            className="text-blue-500 text-sm mb-2"
          >
            ← Volver
          </button>
          <h1 className="text-2xl font-bold">Pedidos Listos</h1>
          <p className="text-gray-600">Para entregar a las mesas</p>
        </div>

        {comandasListas.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No hay pedidos listos
          </div>
        ) : (
          <div className="space-y-4">
            {comandasListas.map((comanda) => (
              <div
                key={comanda.id}
                className="bg-green-100 border-2 border-green-400 rounded-lg p-4"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold text-lg">{comanda.mesa.numero}</p>
                    <p className="text-xs text-gray-600">
                      #{comanda.usuarioEmail}
                    </p>
                  </div>
                  <p className="text-xs text-gray-600">
                    {new Date(comanda.createdAt).toLocaleTimeString('es-AR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                <div className="mb-3 space-y-1">
                  {comanda.items.map((item) => (
                    <div key={item.id} className="text-sm">
                      {item.cantidad}x {item.producto.nombre}
                      {item.observaciones && (
                        <span className="text-xs text-gray-600 italic ml-2">
                          ({item.observaciones})
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => marcarComoEntregado(comanda.id)}
                  className="w-full bg-blue-500 text-white py-2 rounded font-semibold"
                >
                  Marcar como Entregado
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // VISTA: Selección de mesa
  if (vista === 'mesas') {
    return (
      <div className="min-h-screen bg-gray-50 p-4 pb-24">
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">App Mozo</h1>
            <p className="text-gray-600">{currentUser?.nombre}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-red-500 border border-red-500 px-3 py-1 rounded"
          >
            Salir
          </button>
        </div>

        {/* Botón pedidos listos */}
        {comandasListas.length > 0 && (
          <button
            onClick={() => setVista('listos')}
            className="w-full bg-green-500 text-white p-4 rounded-lg mb-3 font-bold flex justify-between items-center"
          >
            <span>🔔 Pedidos Listos para Entregar</span>
            <span className="bg-white text-green-500 rounded-full w-8 h-8 flex items-center justify-center">
              {comandasListas.length}
            </span>
          </button>
        )}

        {/* Botón comandas entregadas (para cobrar) */}
        {comandasEntregadas.length > 0 && (
          <button
            onClick={() => setVista('cobrar')}
            className="w-full bg-purple-500 text-white p-4 rounded-lg mb-4 font-bold flex justify-between items-center"
          >
            <span>💰 Pedidos por Cobrar</span>
            <span className="bg-white text-purple-500 rounded-full w-8 h-8 flex items-center justify-center">
              {comandasEntregadas.length}
            </span>
          </button>
        )}

        <h2 className="font-bold mb-3">Seleccionar Mesa</h2>
        <div className="grid grid-cols-2 gap-3">
          {mesas.map((mesa) => (
            <button
              key={mesa.id}
              onClick={() => seleccionarMesa(mesa)}
              disabled={mesa.estado !== 'DISPONIBLE'}
              className={`p-6 rounded-lg border-2 font-bold text-lg ${
                mesa.estado === 'DISPONIBLE'
                  ? 'bg-green-100 border-green-400 active:bg-green-200'
                  : 'bg-gray-200 border-gray-400 text-gray-500'
              }`}
            >
              {mesa.numero}
              <span className="block text-xs font-normal mt-1">
                {mesa.estado === 'DISPONIBLE' ? 'Disponible' : 'Ocupada'}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // VISTA: Tomar pedido (menu)
  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <div className="bg-white border-b p-4 sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <div>
            <button
              onClick={() => {
                setMesaSeleccionada(null);
                setVista('mesas');
              }}
              className="text-blue-500 text-sm mb-1"
            >
              ← Volver
            </button>
            <h2 className="text-xl font-bold">{mesaSeleccionada.numero}</h2>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-600">Productos: {carrito.length}</p>
            <p className="text-lg font-bold">${calcularTotal()}</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-bold mb-3">Menú</h3>
        <div className="space-y-2">
          {productos.map((producto) => (
            <button
              key={producto.id}
              onClick={() => agregarAlCarrito(producto)}
              className="w-full bg-white p-4 rounded-lg border flex justify-between items-center active:bg-gray-50"
            >
              <div className="text-left">
                <p className="font-semibold">{producto.nombre}</p>
                <p className="text-xs text-gray-600">{producto.categoria}</p>
              </div>
              <p className="font-bold">${producto.precio}</p>
            </button>
          ))}
        </div>
      </div>

      {carrito.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 space-y-3">
          <div className="space-y-2 max-h-32 overflow-y-auto">
{carrito.map((item) => (
  <div key={item.productoId} className="flex flex-col bg-gray-50 p-2 rounded border">
    
    {/* Nombre + cantidad */}
    <div className="flex justify-between items-center text-sm mb-2">
      <span className="font-semibold">{item.nombre}</span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => quitarDelCarrito(item.productoId)}
          className="w-6 h-6 bg-gray-200 rounded"
        >
          -
        </button>
        <span className="w-8 text-center">{item.cantidad}</span>
        <button
          onClick={() =>
            agregarAlCarrito({
              id: item.productoId,
              nombre: item.nombre,
              precio: item.precio
            })
          }
          className="w-6 h-6 bg-gray-200 rounded"
        >
          +
        </button>
      </div>
    </div>

    {/* 🔥 Nuevo: Observaciones */}
    <input
      type="text"
      placeholder="Observaciones (opcional)"
      value={item.observaciones || ''}
      onChange={(e) => {
        const nuevasObservaciones = e.target.value;
        setCarrito((prev) =>
          prev.map((p) =>
            p.productoId === item.productoId
              ? { ...p, observaciones: nuevasObservaciones }
              : p
          )
        );
      }}
      className="w-full p-2 text-xs border rounded"
    />
  </div>
))}

          </div>

          <button
            onClick={enviarComanda}
            className="w-full bg-blue-500 text-white py-3 rounded-lg font-bold"
          >
            Enviar Pedido - ${calcularTotal()}
          </button>
        </div>
      )}
    </div>
  );
}

export default MozoApp;