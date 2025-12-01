import { useState, useEffect } from 'react';
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
      const mesasOrdenadas = response.data.sort((a, b) => a.id - b.id);
      setMesas(mesasOrdenadas);
    } catch (error) {
      console.error('Error al cargar mesas:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editando) {
        await updateMesa(editando.id, formData);
        alert('Mesa actualizada');
      } else {
        await createMesa(formData);
        alert('Mesa creada');
      }
      
      resetForm();
      fetchMesas();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar mesa');
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
      console.error('Error:', error);
      const errorMsg = error.response?.data?.error || 'Error al cambiar disponibilidad';
      alert(errorMsg);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta mesa?')) return;

    try {
      await deleteMesa(id);
      alert('Mesa eliminada correctamente');
      fetchMesas();
    } catch (error) {
      console.error('Error:', error);
      const errorMsg = error.response?.data?.error || 'Error al eliminar mesa';
      alert(errorMsg);
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
          color: 'text-green-600 bg-green-100',
          texto: 'ACTIVA',
          disponible: true
        };
      case 'OCUPADA':
        return {
          color: 'text-red-600 bg-red-100',
          texto: 'OCUPADA',
          disponible: true
        };
      case 'ESPERANDO_PAGO':
        return {
          color: 'text-gray-600 bg-gray-100',
          texto: 'INACTIVA',
          disponible: false
        };
      default:
        return {
          color: 'text-gray-600 bg-gray-100',
          texto: estado,
          disponible: true
        };
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Gestión de Mesas</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {showForm ? 'Cancelar' : '+ Nueva Mesa'}
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-white p-4 rounded-lg border mb-4">
          <h3 className="font-bold mb-3">
            {editando ? 'Editar Mesa' : 'Nueva Mesa'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm mb-1">Número de Mesa</label>
              <input
                type="text"
                value={formData.numero}
                onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                className="w-full border rounded px-3 py-2"
                placeholder="Ej: Mesa 1"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Capacidad (personas)</label>
              <input
                type="number"
                value={formData.capacidad}
                onChange={(e) => setFormData({ ...formData, capacidad: parseInt(e.target.value) })}
                className="w-full border rounded px-3 py-2"
                min="1"
                max="20"
                required
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded flex-1"
              >
                {editando ? 'Actualizar' : 'Crear'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de mesas */}
      <div className="grid grid-cols-2 gap-3">
        {mesas.map((mesa) => {
          const estadoInfo = getEstadoInfo(mesa.estado);
          return (
            <div
              key={mesa.id}
              className="bg-white p-4 rounded-lg border"
            >
              <div className="mb-3">
                <p className="font-bold text-lg">{mesa.numero}</p>
                <p className="text-sm text-gray-600">
                  Capacidad: {mesa.capacidad} personas
                </p>
                <span className={`inline-block mt-2 px-2 py-1 text-xs rounded ${estadoInfo.color}`}>
                  {estadoInfo.texto}
                </span>
              </div>

              <div className="space-y-2">
                {/* Toggle disponibilidad */}
                <button
                  onClick={() => handleToggleDisponibilidad(mesa.id)}
                  disabled={mesa.estado === 'OCUPADA'}
                  className={`w-full text-sm px-3 py-2 rounded font-semibold ${
                    mesa.estado === 'OCUPADA'
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : estadoInfo.disponible
                      ? 'bg-yellow-100 text-yellow-700 border border-yellow-400'
                      : 'bg-green-100 text-green-700 border border-green-400'
                  }`}
                >
                  {mesa.estado === 'OCUPADA'
                    ? 'Mesa en uso'
                    : estadoInfo.disponible
                    ? 'Desactivar'
                    : 'Activar'}
                </button>

                {/* Editar y Eliminar */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(mesa)}
                    className="text-blue-500 text-sm border border-blue-500 px-3 py-1 rounded flex-1"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(mesa.id)}
                    className="text-red-500 text-sm border border-red-500 px-3 py-1 rounded flex-1"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {mesas.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No hay mesas creadas
        </div>
      )}
    </div>
  );
}

export default MesasAdmin;