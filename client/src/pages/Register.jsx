import React from 'react';
import { useState } from 'react';
import { useAxios } from '../api/useAxios';
import { useNavigate } from 'react-router-dom';
const API_URL = import.meta.env.BACKEND_API_URL;


function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const axios = useAxios();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post('${API_URL}/api/auth/signup', { email, password });
      alert('Registrazione completata!');
      navigate('/login');
    } catch (error) {
      console.error(error);
      alert('Errore nella registrazione');
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required
        /><br/>
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required
        /><br/>
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default Register;
