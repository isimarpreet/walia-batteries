import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
// ...existing imports...
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import CustomersPage from './pages/CustomersPage';

const App = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <CustomersPage />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
