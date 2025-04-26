import { useAuth } from '../contexts/AuthContext';
import React from 'react';

function Dashboard() {
  const { logout } = useAuth();

  return (
    <div>
      <h2>Dashboard Privata</h2>
      <p>Benvenuto nella tua dashboard!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

export default Dashboard;
