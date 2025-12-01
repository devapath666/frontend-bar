import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});



// Mesas
export const getMesas = () => api.get('/mesas');
export const getMesaById = (id) => api.get(`/mesas/${id}`);
export const createMesa = (data) => api.post('/mesas', data);
export const updateMesa = (id, data) => api.patch(`/mesas/${id}`, data);
export const toggleDisponibilidadMesa = (id) => api.patch(`/mesas/${id}/disponibilidad`);
export const deleteMesa = (id) => api.delete(`/mesas/${id}`);

// Productos
export const getProductos = () => api.get('/productos');
export const getProductoById = (id) => api.get(`/productos/${id}`);
export const createProducto = (data) => api.post('/productos', data);
export const updateProducto = (id, data) => api.patch(`/productos/${id}`, data);
export const deleteProducto = (id) => api.delete(`/productos/${id}`);

// Comandas
export const getComandas = () => api.get('/comandas');
export const getComandasActivas = () => api.get('/comandas/activas');
export const createComanda = (data) => api.post('/comandas', data);
export const updateEstadoComanda = (id, estado) => 
  api.patch(`/comandas/${id}/estado`, { estado });

// Usuarios
export const getUsuarios = () => api.get('/usuarios');
export const getUsuarioById = (id) => api.get(`/usuarios/${id}`);
export const createUsuario = (data) => api.post('/usuarios', data);
export const updateUsuario = (id, data) => api.patch(`/usuarios/${id}`, data);
export const deleteUsuario = (id) => api.delete(`/usuarios/${id}`);


export const getHistorial = () => axios.get(`${API_URL}/comandas/historial`);


export default api;