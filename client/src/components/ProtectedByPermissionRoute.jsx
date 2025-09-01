import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedByPermissionRoute = ({ permission, children }) => {
  const { hasPermission, loading } = useAuth();
  const location = useLocation();

  // Se sta caricando → puoi mostrare un loader o nulla
  if (loading) return null;

  // Se NON ha il permesso → redirect a /unauthorized
  if (!hasPermission(permission)) {
    return <Navigate to="/unauthorized" replace state={{ from: location }} />;
  }

  // Se ha il permesso → renderizza i children (la pagina protetta)
  return children;
};

export default ProtectedByPermissionRoute;
