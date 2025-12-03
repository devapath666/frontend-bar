import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { getProductos, createProducto, updateProducto, deleteProducto } from '../services/api';

function ProductosAdmin() {
  const [showArchivados, setShowArchivados] = useState(false);
  const [productos, setProductos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    categoria: '',
    precio: '',
    disponible: true
  });

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    try {
      const response = await getProductos();
      setProductos(response.data);
    } catch (error) {
      Swal.fire('Error', 'No se pudieron cargar los productos', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editando) {
        await updateProducto(editando.id, formData);
        Swal.fire({
          icon: 'success',
          title: 'Producto actualizado correctamente',
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        await createProducto(formData);
        Swal.fire({
          icon: 'success',
          title: 'Producto creado correctamente',
          timer: 1500,
          showConfirmButton: false
        });
      }

      resetForm();
      fetchProductos();
    } catch (error) {
      Swal.fire('Error', 'Hubo un problema al guardar el producto', 'error');
    }
  };

  const handleEdit = (producto) => {
    setEditando(producto);
    setFormData({
      nombre: producto.nombre,
      categoria: producto.categoria,
      precio: producto.precio,
      disponible: producto.disponible
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: '¿Eliminar producto?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    try {
      await deleteProducto(id);
      Swal.fire({
        icon: 'success',
        title: 'Producto eliminado',
        timer: 1500,
        showConfirmButton: false
      });
      fetchProductos();
    } catch (error) {
      Swal.fire(
        'Error',
        error.response?.data?.error || 'No se pudo eliminar el producto',
        'error'
      );
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      categoria: '',
      precio: '',
      disponible: true
    });
    setEditando(null);
    setShowForm(false);
  };

  const categorias = ['BEBIDAS', 'COMIDAS', 'POSTRES', 'PANIFICADOS'];

  const activos = productos.filter(p => p.disponible);
  const archivados = productos.filter(p => !p.disponible);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Gestión de Productos</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {showForm ? 'Cancelar' : '+ Nuevo Producto'}
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-white p-4 rounded-lg border mb-4">
          <h3 className="font-bold mb-3">
            {editando ? 'Editar Producto' : 'Nuevo Producto'}
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
              <label className="block text-sm mb-1">Categoría</label>
              <select
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                className="w-full border rounded px-3 py-2"
                required
              >
                <option value="">Seleccionar...</option>
                {categorias.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm mb-1">Precio</label>
              <input
                type="number"
                value={formData.precio}
                onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                className="w-full border rounded px-3 py-2"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.disponible}
                onChange={(e) => setFormData({ ...formData, disponible: e.target.checked })}
                id="disponible"
              />
              <label htmlFor="disponible" className="text-sm">Disponible</label>
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

      {/* Lista de productos activos */}
      <div className="space-y-2">
        {activos.map((producto) => (
          <div
            key={producto.id}
            className="bg-white p-4 rounded-lg border flex justify-between items-center"
          >
            <div className="flex-1">
              <p className="font-semibold">{producto.nombre}</p>
              <p className="text-sm text-gray-600">
                {producto.categoria} • ${producto.precio}
              </p>
              <p className="text-xs text-gray-500">
                {producto.disponible ? '✓ Disponible' : '✗ No disponible'}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(producto)}
                className="text-blue-500 text-sm border border-blue-500 px-3 py-1 rounded"
              >
                Editar
              </button>
              <button
                onClick={() => handleDelete(producto.id)}
                className="text-red-500 text-sm border border-red-500 px-3 py-1 rounded"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Sección de archivados */}
      <div className="mt-6">
        <button
          onClick={() => setShowArchivados(!showArchivados)}
          className="text-sm text-gray-600 underline"
        >
          Archivados ({archivados.length})
        </button>

        {showArchivados && (
          <div className="mt-3 space-y-2">
            {archivados.length === 0 && (
              <p className="text-xs text-gray-500">No hay productos archivados</p>
            )}

            {archivados.map((producto) => (
              <div
                key={producto.id}
                className="bg-gray-100 p-4 rounded-lg border flex justify-between items-center opacity-70"
              >
                <div className="flex-1">
                  <p className="font-semibold">{producto.nombre}</p>
                  <p className="text-sm text-gray-600">
                    {producto.categoria} • ${producto.precio}
                  </p>
                  <p className="text-xs text-red-600 font-semibold">
                    Archivado (No disponible)
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(producto)}
                    className="text-blue-500 text-sm border border-blue-500 px-3 py-1 rounded"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(producto.id)}
                    className="text-red-500 text-sm border border-red-500 px-3 py-1 rounded"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductosAdmin;
