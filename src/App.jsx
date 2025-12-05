import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import MozoApp from './pages/MozoApp';
import CocinaView from './pages/CocinaView';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/mozo" 
          element={
            <ProtectedRoute requiredRole="MOZO">
              <MozoApp />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/cocina" 
          element={
            <ProtectedRoute requiredRole="COCINA">
              <CocinaView />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;