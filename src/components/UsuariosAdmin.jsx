import { useState, useEffect } from 'react';
import { getUsuarios, createUsuario, updateUsuario, deleteUsuario } from '../services/api';
import Swal from 'sweetalert2';

function UsuariosAdmin() {
  const [usuarios, setUsuarios] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState(null);
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
      setUsuarios(response.data);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
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
          text: 'Usuario actualizado correctamente',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        await createUsuario(formData);
        
        Swal.fire({
          title: '¡Creado!',
          text: 'Usuario creado correctamente',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      }
      
      resetForm();
      fetchUsuarios();
    } catch (error) {
      console.error('Error:', error);
      
      Swal.fire({
        title: 'Error',
        text: 'No se pudo guardar el usuario',
        icon: 'error',
        confirmButtonColor: '#3b82f6'
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
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    try {
      await deleteUsuario(id);
      
      Swal.fire({
        title: '¡Eliminado!',
        text: 'Usuario eliminado correctamente',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
      
      fetchUsuarios();
    } catch (error) {
      console.error('Error:', error);
      
      Swal.fire({
        title: 'Error',
        text: 'No se pudo eliminar el usuario',
        icon: 'error',
        confirmButtonColor: '#3b82f6'
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

  const getRolColor = (rol) => {
    switch (rol) {
      case 'ADMIN': return 'text-red-600 bg-red-100';
      case 'MOZO': return 'text-blue-600 bg-blue-100';
      case 'COCINA': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Gestión de Usuarios</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {showForm ? 'Cancelar' : '+ Nuevo Usuario'}
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-white p-4 rounded-lg border mb-4">
          <h3 className="font-bold mb-3">
            {editando ? 'Editar Usuario' : 'Nuevo Usuario'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm mb-1">Nombre</label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Rol</label>
              <select
                value={formData.rol}
                onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                className="w-full border rounded px-3 py-2"
                required
              >
                <option value="MOZO">Mozo</option>
                <option value="ADMIN">Admin</option>
                <option value="COCINA">Cocina</option>
              </select>
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

      {/* Lista de usuarios */}
      <div className="space-y-2">
        {usuarios.map((usuario) => (
          <div
            key={usuario.id}
            className="bg-white p-4 rounded-lg border flex justify-between items-center"
          >
            <div className="flex-1">
              <p className="font-semibold">{usuario.nombre}</p>
              <p className="text-sm text-gray-600">{usuario.email}</p>
              <span className={`inline-block mt-1 px-2 py-1 text-xs rounded ${getRolColor(usuario.rol)}`}>
                {usuario.rol}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(usuario)}
                className="text-blue-500 text-sm border border-blue-500 px-3 py-1 rounded"
              >
                Editar
              </button>
              <button
                onClick={() => handleDelete(usuario.id)}
                className="text-red-500 text-sm border border-red-500 px-3 py-1 rounded"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {usuarios.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No hay usuarios creados
        </div>
      )}
    </div>
  );
}

export default UsuariosAdmin;