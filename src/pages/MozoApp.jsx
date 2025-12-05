import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMesas, getProductos, createComanda, getComandasActivas, updateEstadoComanda } from '../services/api';
import useStore from '../store/useStore';
import useSocket from '../hooks/useSocket';
import Swal from 'sweetalert2';

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
  const [enviando, setEnviando] = useState(false);

  // Fetch comandas listas
  const fetchComandasListas = useCallback(async () => {
    try {
      const response = await getComandasActivas();
      const listos = response.data.filter(c => c.estado === 'LISTO');
      setComandasListas(listos);
    } catch (error) {
      console.error('Error al cargar comandas listas:', error);
    }
  }, []);

  // Fetch comandas entregadas
  const fetchComandasEntregadas = useCallback(async () => {
    try {
      const response = await getComandasActivas();
      const entregadas = response.data.filter(c => c.estado === 'ENTREGADO');
      setComandasEntregadas(entregadas);
    } catch (error) {
      console.error('Error al cargar comandas entregadas:', error);
    }
  }, []);

  // Fetch data inicial
  const fetchData = useCallback(async () => {
    try {
      const [mesasRes, productosRes] = await Promise.all([
        getMesas(),
        getProductos()
      ]);
      
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

  // WebSocket listeners
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

  // Seleccionar mesa
  const seleccionarMesa = (mesa) => {
    if (mesa.estado === 'DISPONIBLE') {
      setMesaSeleccionada(mesa);
      setCarrito([]);
      setVista('menu');
    }
  };

  // Agregar al carrito
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

  // Quitar del carrito
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

  // Calcular total
  const calcularTotal = () => {
    return carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  };

  // Enviar comanda
  const enviarComanda = async () => {
    if (carrito.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Atención',
        text: 'Agregá productos al pedido',
        background: '#1f2937',
        color: '#f3f4f6'
      });
      return;
    }

    if (!currentUser || !currentUser.id) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Sesión inválida, iniciá sesión nuevamente',
        background: '#1f2937',
        color: '#f3f4f6'
      });
      logout();
      navigate('/');
      return;
    }

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

    try {
      Swal.fire({
        title: 'Enviando pedido...',
        text: 'Por favor esperá',
        allowOutsideClick: false,
        allowEscapeKey: false,
        background: '#1f2937',
        color: '#f3f4f6',
        didOpen: () => {
          Swal.showLoading();
        }
      });

      await createComanda(comandaData);

      Swal.fire({
        icon: 'success',
        title: 'Pedido enviado',
        timer: 1500,
        showConfirmButton: false,
        background: '#1f2937',
        color: '#f3f4f6'
      });

      setMesaSeleccionada(null);
      setCarrito([]);
      setVista('mesas');
    } catch (error) {
      console.error('Error al enviar comanda:', error);

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.error || 'No se pudo enviar el pedido',
        background: '#1f2937',
        color: '#f3f4f6'
      });
    }
  };

  // Marcar como entregado
  const marcarComoEntregado = async (comandaId) => {
    const result = await Swal.fire({
      title: '¿Marcar como entregado?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#6b7280',
      background: '#1f2937',
      color: '#f3f4f6'
    });

    if (!result.isConfirmed) return;

    try {
      Swal.fire({
        title: 'Actualizando...',
        allowOutsideClick: false,
        background: '#1f2937',
        color: '#f3f4f6',
        didOpen: () => Swal.showLoading()
      });

      await updateEstadoComanda(comandaId, 'ENTREGADO');

      Swal.fire({
        icon: 'success',
        title: 'Pedido entregado',
        timer: 1200,
        showConfirmButton: false,
        background: '#1f2937',
        color: '#f3f4f6'
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar',
        background: '#1f2937',
        color: '#f3f4f6'
      });
    }
  };

  // Marcar como pagado
  const marcarComoPagado = async (comandaId) => {
    const result = await Swal.fire({
      title: '¿Confirmar pago?',
      text: 'Se liberará la mesa automáticamente',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, confirmar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#6b7280',
      background: '#1f2937',
      color: '#f3f4f6'
    });

    if (!result.isConfirmed) return;

    try {
      Swal.fire({
        title: 'Registrando pago...',
        allowOutsideClick: false,
        background: '#1f2937',
        color: '#f3f4f6',
        didOpen: () => Swal.showLoading()
      });

      await updateEstadoComanda(comandaId, 'PAGADO');

      Swal.fire({
        icon: 'success',
        title: 'Pago registrado',
        text: 'Mesa liberada',
        timer: 1400,
        showConfirmButton: false,
        background: '#1f2937',
        color: '#f3f4f6'
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo registrar el pago',
        background: '#1f2937',
        color: '#f3f4f6'
      });
    }
  };

  // Logout
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-white">Cargando...</p>
      </div>
    );
  }

  // ========== VISTA: PEDIDOS POR COBRAR ==========
  if (vista === 'cobrar') {
    return (
      <div className="min-h-screen bg-gray-900 p-4">
        <div className="mb-6">
          <button
            onClick={() => setVista('mesas')}
            className="text-blue-400 text-sm mb-2 hover:text-blue-300"
          >
            ← Volver
          </button>
          <h1 className="text-2xl font-bold text-white">Pedidos por Cobrar</h1>
          <p className="text-gray-400">Comandas entregadas pendientes de pago</p>
        </div>

        {comandasEntregadas.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            No hay pedidos por cobrar
          </div>
        ) : (
          <div className="space-y-4">
            {comandasEntregadas.map((comanda) => (
              <div
                key={comanda.id}
                className="bg-purple-900 border-2 border-purple-500 rounded-lg p-4 shadow-lg"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold text-lg text-white">{comanda.mesa.numero}</p>
                    <p className="text-xs text-gray-400">
                      #{comanda.usuarioEmail}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">
                      {new Date(comanda.createdAt).toLocaleTimeString('es-AR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    <p className="text-xs font-semibold text-purple-400">ENTREGADO</p>
                  </div>
                </div>

                <div className="mb-3 space-y-1 border-t border-purple-700 pt-3">
                  {comanda.items.map((item) => (
                    <div key={item.id} className="text-sm text-gray-300">
                      <span className="font-medium">{item.cantidad}x {item.producto.nombre}</span>
                      {item.observaciones && (
                        <span className="text-xs text-gray-400 italic ml-2 bg-gray-800 px-2 py-1 rounded">
                          {item.observaciones}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center mb-3 pt-2 border-t border-purple-700">
                  <span className="font-bold text-lg text-white">Total a cobrar:</span>
                  <span className="font-bold text-2xl text-purple-400">${comanda.total}</span>
                </div>

                <button
                  onClick={() => marcarComoPagado(comanda.id)}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-bold transition shadow-md"
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

  // ========== VISTA: PEDIDOS LISTOS ==========
  if (vista === 'listos') {
    return (
      <div className="min-h-screen bg-gray-900 p-4">
        <div className="mb-6">
          <button
            onClick={() => setVista('mesas')}
            className="text-blue-400 text-sm mb-2 hover:text-blue-300"
          >
            ← Volver
          </button>
          <h1 className="text-2xl font-bold text-white">Pedidos Listos</h1>
          <p className="text-gray-400">Para entregar a las mesas</p>
        </div>

        {comandasListas.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            No hay pedidos listos
          </div>
        ) : (
          <div className="space-y-4">
            {comandasListas.map((comanda) => (
              <div
                key={comanda.id}
                className="bg-green-900 border-2 border-green-500 rounded-lg p-4 shadow-lg"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold text-lg text-white">{comanda.mesa.numero}</p>
                    <p className="text-xs text-gray-400">
                      #{comanda.usuarioEmail}
                    </p>
                  </div>
                  <p className="text-xs text-gray-400">
                    {new Date(comanda.createdAt).toLocaleTimeString('es-AR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                <div className="mb-3 space-y-1 border-t border-green-700 pt-3">
                  {comanda.items.map((item) => (
                    <div key={item.id} className="text-sm text-gray-300">
                      <span className="font-medium">{item.cantidad}x {item.producto.nombre}</span>
                      {item.observaciones && (
                        <span className="text-xs text-gray-400 italic ml-2 bg-gray-800 px-2 py-1 rounded">
                          {item.observaciones}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => marcarComoEntregado(comanda.id)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition shadow-md"
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

  // ========== VISTA: SELECCIÓN DE MESAS ==========
  if (vista === 'mesas') {
    return (
      <div className="min-h-screen bg-gray-900 p-4 pb-24">
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-white">App Mozo</h1>
            <p className="text-gray-400">🍽️ {currentUser?.nombre}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-red-400 border border-red-500 px-3 py-1 rounded hover:bg-red-500 hover:text-white transition"
          >
            Salir
          </button>
        </div>

        {/* Botón pedidos listos */}
        {comandasListas.length > 0 && (
          <button
            onClick={() => setVista('listos')}
            className="w-full bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg mb-3 font-bold flex justify-between items-center shadow-lg transition"
          >
            <span>🔔 Pedidos Listos para Entregar</span>
            <span className="bg-white text-green-600 rounded-full w-8 h-8 flex items-center justify-center font-bold">
              {comandasListas.length}
            </span>
          </button>
        )}

        {/* Botón comandas entregadas */}
        {comandasEntregadas.length > 0 && (
          <button
            onClick={() => setVista('cobrar')}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg mb-4 font-bold flex justify-between items-center shadow-lg transition"
          >
            <span>💰 Pedidos por Cobrar</span>
            <span className="bg-white text-purple-600 rounded-full w-8 h-8 flex items-center justify-center font-bold">
              {comandasEntregadas.length}
            </span>
          </button>
        )}

        <h2 className="font-bold mb-3 text-white">Seleccionar Mesa</h2>
        <div className="grid grid-cols-2 gap-3">
          {mesas.map((mesa) => (
            <button
              key={mesa.id}
              onClick={() => seleccionarMesa(mesa)}
              disabled={mesa.estado !== 'DISPONIBLE'}
              className={`p-6 rounded-lg border-2 font-bold text-lg transition shadow-md ${
                mesa.estado === 'DISPONIBLE'
                  ? 'bg-green-900 border-green-500 text-white hover:bg-green-800 active:bg-green-700'
                  : 'bg-gray-700 border-gray-600 text-gray-400 cursor-not-allowed'
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

  // ========== VISTA: TOMAR PEDIDO (MENÚ) ==========
  return (
    <div className="min-h-screen bg-gray-900 pb-32">
      {/* Header sticky */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 sticky top-0 z-10 shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <button
              onClick={() => {
                setMesaSeleccionada(null);
                setVista('mesas');
              }}
              className="text-blue-400 text-sm mb-1 hover:text-blue-300"
            >
              ← Volver
            </button>
            <h2 className="text-xl font-bold text-white">{mesaSeleccionada.numero}</h2>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Productos: {carrito.length}</p>
            <p className="text-lg font-bold text-green-400">${calcularTotal()}</p>
          </div>
        </div>
      </div>

      {/* Menú de productos */}
      <div className="p-4">
        <h3 className="font-bold mb-3 text-white">Menú</h3>
        <div className="space-y-2">
          {productos.map((producto) => (
            <button
              key={producto.id}
              onClick={() => agregarAlCarrito(producto)}
              className="w-full bg-gray-800 border border-gray-700 p-4 rounded-lg flex justify-between items-center hover:border-blue-500 active:bg-gray-700 transition shadow-md"
            >
              <div className="text-left">
                <p className="font-semibold text-white">{producto.nombre}</p>
                <p className="text-xs text-gray-400">{producto.categoria}</p>
              </div>
              <p className="font-bold text-green-400">${producto.precio}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Carrito flotante */}
      {carrito.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 p-4 space-y-3 shadow-2xl">
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {carrito.map((item) => (
              <div key={item.productoId} className="flex flex-col bg-gray-700 p-2 rounded border border-gray-600">
                
                {/* Nombre + cantidad */}
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="font-semibold text-white">{item.nombre}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => quitarDelCarrito(item.productoId)}
                      className="w-6 h-6 bg-gray-600 text-white rounded hover:bg-gray-500"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-white font-bold">{item.cantidad}</span>
                    <button
                      onClick={() =>
                        agregarAlCarrito({
                          id: item.productoId,
                          nombre: item.nombre,
                          precio: item.precio
                        })
                      }
                      className="w-6 h-6 bg-gray-600 text-white rounded hover:bg-gray-500"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Observaciones */}
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
                  className="w-full p-2 text-xs bg-gray-600 border border-gray-500 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>

          <button
            disabled={enviando}
            onClick={async () => {
              setEnviando(true);
              await enviarComanda();
              setEnviando(false);
            }}
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition shadow-lg ${
              enviando ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {enviando ? 'Enviando...' : `Enviar Pedido - $${calcularTotal()}`}
          </button>
        </div>
      )}
    </div>
  );
}

export default MozoApp;