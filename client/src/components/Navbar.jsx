import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Menu } from 'lucide-react'; // Se vuoi usare un'icona bella

export default function Navbar() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return null; // Niente navbar se non loggato

  return (
    <nav className="bg-blue-900 text-white flex justify-between items-center p-4">
      <div className="text-lg font-bold">{user?.name || 'Utente'}</div>
      <button className="p-2 hover:bg-blue-700 rounded">
        <Menu />
      </button>
    </nav>
  );
}
