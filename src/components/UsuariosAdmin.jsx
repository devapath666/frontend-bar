import { useState, useEffect } from 'react';
import { getUsuarios, createUsuario, updateUsuario, deleteUsuario } from '../services/api';
import Swal from 'sweetalert2';

function UsuariosAdmin() {
  const [usuarios, setUsuarios] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [rolFiltro, setRolFiltro] = useState('TODOS');
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'MOZO'
  });

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const response = await getUsuarios();
      const usuariosOrdenados = response.data.sort((a, b) => 
        a.nombre.localeCompare(b.nombre)
      );
      setUsuarios(usuariosOrdenados);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los usuarios',
        background: '#1f2937',
        color: '#f3f4f6'
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editando) {
        const dataToUpdate = { ...formData };
        if (!dataToUpdate.password) {
          delete dataToUpdate.password;
        }
        await updateUsuario(editando.id, dataToUpdate);
        
        Swal.fire({
          title: '¡Actualizado!',
          text: 'Usuario actualizado',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          background: '#1f2937',
          color: '#f3f4f6'
        });
      } else {
        await createUsuario(formData);
        
        Swal.fire({
          title: '¡Creado!',
          text: 'Usuario creado',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          background: '#1f2937',
          color: '#f3f4f6'
        });
      }
      
      resetForm();
      fetchUsuarios();
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'No se pudo guardar el usuario',
        icon: 'error',
        confirmButtonColor: '#3b82f6',
        background: '#1f2937',
        color: '#f3f4f6'
      });
    }
  };

  const handleEdit = (usuario) => {
    setEditando(usuario);
    setFormData({
      nombre: usuario.nombre,
      email: usuario.email,
      password: '',
      rol: usuario.rol
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: '¿Eliminar usuario?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      background: '#1f2937',
      color: '#f3f4f6'
    });

    if (!result.isConfirmed) return;

    try {
      await deleteUsuario(id);
      
      Swal.fire({
        title: '¡Eliminado!',
        text: 'Usuario eliminado',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        background: '#1f2937',
        color: '#f3f4f6'
      });
      
      fetchUsuarios();
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'No se pudo eliminar',
        icon: 'error',
        confirmButtonColor: '#3b82f6',
        background: '#1f2937',
        color: '#f3f4f6'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      email: '',
      password: '',
      rol: 'MOZO'
    });
    setEditando(null);
    setShowForm(false);
  };

  const getRolConfig = (rol) => {
    switch (rol) {
      case 'ADMIN': 
        return {
          color: 'text-red-400 bg-red-900 border-red-500',
          icon: '👑',
          nombre: 'Admin'
        };
      case 'MOZO': 
        return {
          color: 'text-blue-400 bg-blue-900 border-blue-500',
          icon: '🍽️',
          nombre: 'Mozo'
        };
      case 'COCINA': 
        return {
          color: 'text-green-400 bg-green-900 border-green-500',
          icon: '👨‍🍳',
          nombre: 'Cocina'
        };
      default: 
        return {
          color: 'text-gray-400 bg-gray-700 border-gray-500',
          icon: '👤',
          nombre: rol
        };
    }
  };

  const usuariosPorRol = {
    ADMIN: usuarios.filter(u => u.rol === 'ADMIN'),
    MOZO: usuarios.filter(u => u.rol === 'MOZO'),
    COCINA: usuarios.filter(u => u.rol === 'COCINA')
  };

  const usuariosFiltrados = rolFiltro === 'TODOS' 
    ? usuarios 
    : usuariosPorRol[rolFiltro];

  return (
    <div className="min-h-screen bg-gray-800 p-4">
      
      {/* HEADER */}
      <div className="bg-gray-700 rounded-lg p-4 mb-6 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Gestión de Usuarios</h2>
            <p className="text-gray-400 text-sm">
              {usuarios.length} usuarios registrados
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition"
          >
            {showForm ? 'Cancelar' : '+ Nuevo Usuario'}
          </button>
        </div>

        {/* FILTROS */}
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setRolFiltro('TODOS')}
            className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
              rolFiltro === 'TODOS'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
            }`}
          >
            Todos ({usuarios.length})
          </button>
          <button
            onClick={() => setRolFiltro('ADMIN')}
            className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
              rolFiltro === 'ADMIN'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
            }`}
          >
            👑 Admins ({usuariosPorRol.ADMIN.length})
          </button>
          <button
            onClick={() => setRolFiltro('MOZO')}
            className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
              rolFiltro === 'MOZO'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
            }`}
          >
            🍽️ Mozos ({usuariosPorRol.MOZO.length})
          </button>
          <button
            onClick={() => setRolFiltro('COCINA')}
            className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
              rolFiltro === 'COCINA'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
            }`}
          >
            👨‍🍳 Cocina ({usuariosPorRol.COCINA.length})
          </button>
        </div>
      </div>

      {/* FORMULARIO */}
      {showForm && (
        <div className="bg-gray-700 p-6 rounded-lg border border-gray-600 mb-6 shadow-lg">
          <h3 className="font-bold text-xl text-white mb-4">
            {editando ? 'Editar Usuario' : 'Nuevo Usuario'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Nombre</label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full bg-gray-600 border border-gray-500 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-gray-600 border border-gray-500 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Contraseña {editando && '(dejar vacío para no cambiar)'}
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-gray-600 border border-gray-500 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required={!editando}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Rol</label>
              <select
                value={formData.rol}
                onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                className="w-full bg-gray-600 border border-gray-500 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="MOZO">🍽️ Mozo</option>
                <option value="ADMIN">👑 Admin</option>
                <option value="COCINA">👨‍🍳 Cocina</option>
              </select>
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

      {/* USUARIOS */}
      {usuariosFiltrados.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          No hay usuarios registrados
        </div>
      ) : (
        <div className="bg-gray-700 rounded-lg p-4 shadow-lg">
          <h3 className="text-lg font-bold text-white mb-4 border-b border-gray-600 pb-2">
            {rolFiltro === 'TODOS' ? 'Todos los Usuarios' : `Usuarios - ${getRolConfig(rolFiltro).nombre}`}
            <span className="text-sm font-normal text-gray-400 ml-2">
              ({usuariosFiltrados.length})
            </span>
          </h3>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {usuariosFiltrados.map((usuario) => {
              const rolConfig = getRolConfig(usuario.rol);
              return (
                <div
                  key={usuario.id}
                  className="bg-gray-600 rounded-lg border border-gray-500 hover:border-blue-500 transition shadow-md hover:shadow-xl overflow-hidden"
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <p className="font-bold text-white text-lg mb-1">{usuario.nombre}</p>
                        <p className="text-sm text-gray-400 mb-2">{usuario.email}</p>
                      </div>
                      <span className="text-2xl">{rolConfig.icon}</span>
                    </div>
                    
                    <span className={`inline-block px-3 py-1 text-xs rounded font-semibold border ${rolConfig.color} mb-3`}>
                      {rolConfig.nombre}
                    </span>

                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleEdit(usuario)}
                        className="flex-1 text-blue-400 text-sm border border-blue-400 px-3 py-1.5 rounded hover:bg-blue-400 hover:text-white transition font-medium"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(usuario.id)}
                        className="flex-1 text-red-400 text-sm border border-red-400 px-3 py-1.5 rounded hover:bg-red-400 hover:text-white transition font-medium"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default UsuariosAdmin;