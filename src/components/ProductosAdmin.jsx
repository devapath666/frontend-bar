import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { getProductos, createProducto, updateProducto, deleteProducto } from '../services/api';

function ProductosAdmin() {
  const [productos, setProductos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [categoriaFiltro, setCategoriaFiltro] = useState('TODAS');
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
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los productos',
        background: '#1f2937',
        color: '#f3f4f6'
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editando) {
        await updateProducto(editando.id, formData);
        Swal.fire({
          icon: 'success',
          title: 'Producto actualizado',
          timer: 1500,
          showConfirmButton: false,
          background: '#1f2937',
          color: '#f3f4f6'
        });
      } else {
        await createProducto(formData);
        Swal.fire({
          icon: 'success',
          title: 'Producto creado',
          timer: 1500,
          showConfirmButton: false,
          background: '#1f2937',
          color: '#f3f4f6'
        });
      }

      resetForm();
      fetchProductos();
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
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      background: '#1f2937',
      color: '#f3f4f6'
    });

    if (!result.isConfirmed) return;

    try {
      await deleteProducto(id);
      Swal.fire({
        icon: 'success',
        title: 'Producto eliminado',
        timer: 1500,
        showConfirmButton: false,
        background: '#1f2937',
        color: '#f3f4f6'
      });
      fetchProductos();
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
      nombre: '',
      categoria: '',
      precio: '',
      disponible: true
    });
    setEditando(null);
    setShowForm(false);
  };

  const categorias = ['BEBIDAS', 'COMIDAS', 'POSTRES', 'PANIFICADOS'];

  const productosActivos = productos.filter(p => p.disponible);
  const productosArchivados = productos.filter(p => !p.disponible);

  const productosFiltrados = categoriaFiltro === 'TODAS'
    ? productosActivos
    : productosActivos.filter(p => p.categoria === categoriaFiltro);

  const productosPorCategoria = categorias.reduce((acc, cat) => {
    acc[cat] = productosActivos
      .filter(p => p.categoria === cat)
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-800 p-4">
      
      {/* HEADER */}
      <div className="bg-gray-700 rounded-lg p-4 mb-6 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Gestión de Productos</h2>
            <p className="text-gray-400 text-sm">
              {productosActivos.length} activos • {productosArchivados.length} archivados
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition"
          >
            {showForm ? 'Cancelar' : '+ Nuevo Producto'}
          </button>
        </div>

        {/* FILTROS */}
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setCategoriaFiltro('TODAS')}
            className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
              categoriaFiltro === 'TODAS'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
            }`}
          >
            Todas ({productosActivos.length})
          </button>
          {categorias.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoriaFiltro(cat)}
              className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                categoriaFiltro === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
            >
              {cat} ({productosPorCategoria[cat].length})
            </button>
          ))}
        </div>
      </div>

      {/* FORMULARIO */}
      {showForm && (
        <div className="bg-gray-700 p-6 rounded-lg border border-gray-600 mb-6 shadow-lg">
          <h3 className="font-bold text-xl text-white mb-4">
            {editando ? 'Editar Producto' : 'Nuevo Producto'}
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
              <label className="block text-sm text-gray-300 mb-2">Categoría</label>
              <select
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                className="w-full bg-gray-600 border border-gray-500 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Seleccionar...</option>
                {categorias.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Precio</label>
              <input
                type="number"
                value={formData.precio}
                onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                className="w-full bg-gray-600 border border-gray-500 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-4 h-4"
              />
              <label htmlFor="disponible" className="text-sm text-gray-300">Disponible</label>
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

      {/* PRODUCTOS ACTIVOS POR CATEGORÍA */}
      {categoriaFiltro === 'TODAS' ? (
        <div className="space-y-6">
          {categorias.map(categoria => {
            const items = productosPorCategoria[categoria];
            if (items.length === 0) return null;

            return (
              <div key={categoria} className="bg-gray-700 rounded-lg p-4 shadow-lg">
                <h3 className="text-lg font-bold text-white mb-4 border-b border-gray-600 pb-2 flex items-center gap-2">
                  <span>{categoria}</span>
                  <span className="text-sm font-normal text-gray-400">({items.length})</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {items.map(producto => (
                    <div
                      key={producto.id}
                      className="bg-gray-600 rounded-lg border border-gray-500 hover:border-blue-500 transition shadow-md hover:shadow-xl overflow-hidden"
                    >
                      <div className="p-4">
                        <p className="font-bold text-white text-base mb-1 truncate" title={producto.nombre}>
                          {producto.nombre}
                        </p>
                        <p className="text-2xl font-bold text-green-400 mb-3">${producto.precio}</p>
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => handleEdit(producto)}
                            className="w-full text-blue-400 text-sm border border-blue-400 px-3 py-1.5 rounded hover:bg-blue-400 hover:text-white transition font-medium"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(producto.id)}
                            className="w-full text-red-400 text-sm border border-red-400 px-3 py-1.5 rounded hover:bg-red-400 hover:text-white transition font-medium"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-gray-700 rounded-lg p-4 shadow-lg">
          <h3 className="text-lg font-bold text-white mb-4 border-b border-gray-600 pb-2 flex items-center gap-2">
            <span>{categoriaFiltro}</span>
            <span className="text-sm font-normal text-gray-400">({productosFiltrados.length})</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {productosFiltrados.map(producto => (
              <div
                key={producto.id}
                className="bg-gray-600 rounded-lg border border-gray-500 hover:border-blue-500 transition shadow-md hover:shadow-xl overflow-hidden"
              >
                <div className="p-4">
                  <p className="font-bold text-white text-base mb-1 truncate" title={producto.nombre}>
                    {producto.nombre}
                  </p>
                  <p className="text-2xl font-bold text-green-400 mb-3">${producto.precio}</p>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleEdit(producto)}
                      className="w-full text-blue-400 text-sm border border-blue-400 px-3 py-1.5 rounded hover:bg-blue-400 hover:text-white transition font-medium"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(producto.id)}
                      className="w-full text-red-400 text-sm border border-red-400 px-3 py-1.5 rounded hover:bg-red-400 hover:text-white transition font-medium"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PRODUCTOS ARCHIVADOS */}
      {productosArchivados.length > 0 && (
        <details className="bg-gray-700 rounded-lg p-4 mt-6 shadow-lg">
          <summary className="cursor-pointer text-gray-300 font-semibold hover:text-white transition">
            📦 Productos Archivados ({productosArchivados.length})
          </summary>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {productosArchivados
              .sort((a, b) => a.nombre.localeCompare(b.nombre))
              .map(producto => (
                <div
                  key={producto.id}
                  className="bg-gray-600 rounded-lg border border-gray-500 opacity-60 hover:opacity-80 transition shadow-md overflow-hidden"
                >
                  <div className="p-4">
                    <p className="font-bold text-white text-base mb-1 truncate" title={producto.nombre}>
                      {producto.nombre}
                    </p>
                    <p className="text-xs text-red-400 font-semibold mb-2">No disponible</p>
                    <p className="text-2xl font-bold text-gray-400 mb-3">${producto.precio}</p>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleEdit(producto)}
                        className="w-full text-blue-400 text-sm border border-blue-400 px-3 py-1.5 rounded hover:bg-blue-400 hover:text-white transition font-medium"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(producto.id)}
                        className="w-full text-red-400 text-sm border border-red-400 px-3 py-1.5 rounded hover:bg-red-400 hover:text-white transition font-medium"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </details>
      )}
    </div>
  );
}

export default ProductosAdmin;