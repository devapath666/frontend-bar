import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set) => ({
      // Usuario actual
      currentUser: null,
      setCurrentUser: (user) => set({ currentUser: user }),
      logout: () => set({ currentUser: null }),
      
      // Mesas
      mesas: [],
      setMesas: (mesas) => set({ mesas }),
      
      // Productos
      productos: [],
      setProductos: (productos) => set({ productos }),
      
      // Comandas
      comandas: [],
      setComandas: (comandas) => set({ comandas }),
    }),
    {
      name: 'bar-storage',
      partialize: (state) => ({ currentUser: state.currentUser })
    }
  )
);

export default useStore;