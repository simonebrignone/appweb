import React from 'react';
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axiosInstance';

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:5000/api/auth/reset-password/${token}`, { newPassword });
      alert('Password aggiornata con successo!');
      navigate('/login');
    } catch (error) {
      console.error(error);
      alert('Errore durante il reset della password');
    }
  };

  return (
    <div>
      <h2>Reset Password</h2>
      <form onSubmit={handleResetPassword}>
        <input 
          type="password" 
          placeholder="Nuova password" 
          value={newPassword} 
          onChange={(e) => setNewPassword(e.target.value)} 
          required
        /><br/>
        <button type="submit">Aggiorna Password</button>
      </form>
    </div>
  );
}

export default ResetPassword;
