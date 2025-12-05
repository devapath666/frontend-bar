import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { getMesas, createMesa, updateMesa, deleteMesa, toggleDisponibilidadMesa } from '../services/api';

function MesasAdmin() {
  const [mesas, setMesas] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({
    numero: '',
    capacidad: 4
  });

  useEffect(() => {
    fetchMesas();
  }, []);

  const fetchMesas = async () => {
    try {
      const response = await getMesas();
      const mesasOrdenadas = response.data.sort((a, b) => {
        const numA = parseInt(a.numero.replace(/\D/g, ''));
        const numB = parseInt(b.numero.replace(/\D/g, ''));
        return numA - numB;
      });
      setMesas(mesasOrdenadas);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar las mesas',
        background: '#1f2937',
        color: '#f3f4f6'
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editando) {
        await updateMesa(editando.id, formData);
        Swal.fire({
          icon: 'success',
          title: 'Mesa actualizada',
          timer: 1500,
          showConfirmButton: false,
          background: '#1f2937',
          color: '#f3f4f6'
        });
      } else {
        await createMesa(formData);
        Swal.fire({
          icon: 'success',
          title: 'Mesa creada',
          timer: 1500,
          showConfirmButton: false,
          background: '#1f2937',
          color: '#f3f4f6'
        });
      }

      resetForm();
      fetchMesas();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al guardar',
        background: '#1f2937',
        color: '#f3f4f6'
      });
    }
  };

  const handleEdit = (mesa) => {
    setEditando(mesa);
    setFormData({
      numero: mesa.numero,
      capacidad: mesa.capacidad
    });
    setShowForm(true);
  };

  const handleToggleDisponibilidad = async (id) => {
    try {
      await toggleDisponibilidadMesa(id);
      fetchMesas();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.error || 'No se pudo cambiar la disponibilidad',
        background: '#1f2937',
        color: '#f3f4f6'
      });
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: '¿Eliminar mesa?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      background: '#1f2937',
      color: '#f3f4f6'
    });

    if (!result.isConfirmed) return;

    try {
      await deleteMesa(id);
      Swal.fire({
        icon: 'success',
        title: 'Mesa eliminada',
        timer: 1500,
        showConfirmButton: false,
        background: '#1f2937',
        color: '#f3f4f6'
      });
      fetchMesas();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.error || 'No se pudo eliminar',
        background: '#1f2937',
        color: '#f3f4f6'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      numero: '',
      capacidad: 4
    });
    setEditando(null);
    setShowForm(false);
  };

  const getEstadoInfo = (estado) => {
    switch (estado) {
      case 'DISPONIBLE':
        return {
          color: 'text-green-400 bg-green-900 border-green-500',
          texto: 'DISPONIBLE',
          disponible: true
        };
      case 'OCUPADA':
        return {
          color: 'text-red-400 bg-red-900 border-red-500',
          texto: 'OCUPADA',
          disponible: true
        };
      case 'ESPERANDO_PAGO':
        return {
          color: 'text-gray-400 bg-gray-700 border-gray-500',
          texto: 'INACTIVA',
          disponible: false
        };
      default:
        return {
          color: 'text-gray-400 bg-gray-700 border-gray-500',
          texto: estado,
          disponible: true
        };
    }
  };

  const mesasActivas = mesas.filter(m => m.estado !== 'ESPERANDO_PAGO');
  const mesasInactivas = mesas.filter(m => m.estado === 'ESPERANDO_PAGO');

  return (
    <div className="min-h-screen bg-gray-800 p-4">
      
      {/* HEADER */}
      <div className="bg-gray-700 rounded-lg p-4 mb-6 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Gestión de Mesas</h2>
            <p className="text-gray-400 text-sm">
              {mesasActivas.length} activas • {mesasInactivas.length} inactivas
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition"
          >
            {showForm ? 'Cancelar' : '+ Nueva Mesa'}
          </button>
        </div>
      </div>

      {/* FORMULARIO */}
      {showForm && (
        <div className="bg-gray-700 p-6 rounded-lg border border-gray-600 mb-6 shadow-lg">
          <h3 className="font-bold text-xl text-white mb-4">
            {editando ? 'Editar Mesa' : 'Nueva Mesa'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Número de Mesa</label>
              <input
                type="text"
                value={formData.numero}
                onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                className="w-full bg-gray-600 border border-gray-500 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Mesa 1"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Capacidad (personas)</label>
              <input
                type="number"
                value={formData.capacidad}
                onChange={(e) => setFormData({ ...formData, capacidad: parseInt(e.target.value) })}
                className="w-full bg-gray-600 border border-gray-500 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                max="20"
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex-1 font-semibold transition"
              >
                {editando ? 'Actualizar' : 'Crear'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-2 rounded-lg font-semibold transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MESAS ACTIVAS */}
      {mesasActivas.length > 0 && (
        <div className="bg-gray-700 rounded-lg p-4 mb-6 shadow-lg">
          <h3 className="text-lg font-bold text-white mb-4 border-b border-gray-600 pb-2">
            Mesas Activas ({mesasActivas.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {mesasActivas.map((mesa) => {
              const estadoInfo = getEstadoInfo(mesa.estado);
              return (
                <div
                  key={mesa.id}
                  className="bg-gray-600 rounded-lg border border-gray-500 hover:border-blue-500 transition shadow-md hover:shadow-xl overflow-hidden"
                >
                  <div className="p-4">
                    <p className="font-bold text-white text-xl mb-1">{mesa.numero}</p>
                    <p className="text-sm text-gray-400 mb-2">
                      👥 {mesa.capacidad} personas
                    </p>
                    <span className={`inline-block px-2 py-1 text-xs rounded font-semibold border ${estadoInfo.color} mb-3`}>
                      {estadoInfo.texto}
                    </span>

                    <div className="space-y-2">
                      {/* Toggle disponibilidad */}
                      <button
                        onClick={() => handleToggleDisponibilidad(mesa.id)}
                        disabled={mesa.estado === 'OCUPADA'}
                        className={`w-full text-xs px-3 py-2 rounded-lg font-semibold transition ${
                          mesa.estado === 'OCUPADA'
                            ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                            : estadoInfo.disponible
                            ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                      >
                        {mesa.estado === 'OCUPADA'
                          ? 'En uso'
                          : estadoInfo.disponible
                          ? 'Desactivar'
                          : 'Activar'}
                      </button>

                      {/* Editar y Eliminar */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(mesa)}
                          className="flex-1 text-blue-400 text-xs border border-blue-400 px-2 py-1.5 rounded hover:bg-blue-400 hover:text-white transition font-medium"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(mesa.id)}
                          className="flex-1 text-red-400 text-xs border border-red-400 px-2 py-1.5 rounded hover:bg-red-400 hover:text-white transition font-medium"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MESAS INACTIVAS */}
      {mesasInactivas.length > 0 && (
        <details className="bg-gray-700 rounded-lg p-4 shadow-lg">
          <summary className="cursor-pointer text-gray-300 font-semibold hover:text-white transition">
            🔒 Mesas Inactivas ({mesasInactivas.length})
          </summary>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {mesasInactivas.map((mesa) => {
              const estadoInfo = getEstadoInfo(mesa.estado);
              return (
                <div
                  key={mesa.id}
                  className="bg-gray-600 rounded-lg border border-gray-500 opacity-60 hover:opacity-80 transition shadow-md overflow-hidden"
                >
                  <div className="p-4">
                    <p className="font-bold text-white text-xl mb-1">{mesa.numero}</p>
                    <p className="text-sm text-gray-400 mb-2">
                      👥 {mesa.capacidad} personas
                    </p>
                    <span className={`inline-block px-2 py-1 text-xs rounded font-semibold border ${estadoInfo.color} mb-3`}>
                      {estadoInfo.texto}
                    </span>

                    <div className="space-y-2">
                      <button
                        onClick={() => handleToggleDisponibilidad(mesa.id)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-2 rounded-lg font-semibold transition"
                      >
                        Activar
                      </button>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(mesa)}
                          className="flex-1 text-blue-400 text-xs border border-blue-400 px-2 py-1.5 rounded hover:bg-blue-400 hover:text-white transition font-medium"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(mesa.id)}
                          className="flex-1 text-red-400 text-xs border border-red-400 px-2 py-1.5 rounded hover:bg-red-400 hover:text-white transition font-medium"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </details>
      )}

      {mesas.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          No hay mesas creadas
        </div>
      )}
    </div>
  );
}

export default MesasAdmin;