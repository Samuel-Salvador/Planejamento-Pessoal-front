import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, PublicOnlyRoute } from './ProtectedRoute';
import { LoginPage } from '../pages/Login';
import { RegisterPage } from '../pages/Register';
import { DashboardPage } from '../pages/Dashboard';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Rotas públicas apenas para usuários não autenticados */}
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Rotas protegidas (apenas usuários autenticados) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<DashboardPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
