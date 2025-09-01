import React, { useState } from 'react';
import axios from '../api/axiosInstance';
const API_URL = import.meta.env.BACKEND_API_URL;

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setStatusMessage(''); // Reset messaggio

    try {
      const res = await axios.post('${API_URL}/api/auth/forgot-password', { email });
      const data = res.data;

      // Mostra il messaggio ricevuto dal backend
      setStatusMessage(data.message);
    } catch (error) {
      console.error('Errore richiesta forgot-password:', error);

      if (error.response) {
        // Il server ha risposto con uno status fuori dal range 2xx
        setStatusMessage('Errore server: ' + error.response.data.message || 'Errore sconosciuto');
      } else if (error.request) {
        // La richiesta è stata fatta ma non è arrivata risposta
        setStatusMessage('Nessuna risposta dal server. Controlla la connessione.');
      } else {
        // Altro errore
        setStatusMessage('Errore durante l\'invio della richiesta.');
      }
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

      {statusMessage && (
        <p style={{ marginTop: '20px', color: 'blue' }}>
          {statusMessage}
        </p>
      )}
    </div>
  );
}

export default ForgotPassword;

