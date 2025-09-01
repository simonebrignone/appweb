import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const IfHasPermission = ({ permission, children }) => {
  const { hasPermission, loading } = useAuth();

  // Se sta caricando l'autenticazione → non mostra nulla (opzionale, puoi anche mettere un loader)
  if (loading) return null;

  // Se non ha il permesso → non mostra nulla
  if (!hasPermission(permission)) return null;

  // Se ha il permesso → mostra i figli
  return <>{children}</>;
};

export default IfHasPermission;
