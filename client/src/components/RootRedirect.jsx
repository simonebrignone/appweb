import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export default function RootRedirect() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null; // oppure un loader

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  } else {
    return <Navigate to="/spbapp" replace />;
  }
}
