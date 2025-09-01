import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';
import AuthForm from './AuthForm';
import ServerStatus from './ServerStatus';

export default function LandingPage() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800">
        <h1 className="text-3xl text-blue-400 font-orbitron">Caricamento...</h1>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800">
        <h1 className="text-3xl text-blue-400 font-orbitron mb-4">Benvenuto nella SPB App!</h1>
        <ServerStatus />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex flex-col items-center justify-center p-4 text-gray-200 font-orbitron relative">
      <ServerStatus />
      <Logo className="w-24 sm:w-40 mb-6 drop-shadow-lg" />
      <AuthForm />
    </div>
  );
}

