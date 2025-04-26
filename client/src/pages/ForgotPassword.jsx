import React from 'react';
import { useState } from 'react';
import axios from '../api/axiosInstance';

function ForgotPassword() {
  const [email, setEmail] = useState('');

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      alert('Email di reset inviata! Controlla la tua casella di posta.');
    } catch (error) {
      console.error(error);
      alert('Errore durante l\'invio dell\'email di reset');
    }
  };

  return (
    <div>
      <h2>Forgot Password</h2>
      <form onSubmit={handleForgotPassword}>
        <input 
          type="email" 
          placeholder="Inserisci la tua email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required
        /><br/>
        <button type="submit">Invia reset password</button>
      </form>
    </div>
  );
}

export default ForgotPassword;
