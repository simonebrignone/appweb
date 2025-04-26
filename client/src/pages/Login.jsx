import React from 'react';
import { useState } from 'react';
import axios from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      login(res.data.token);
      alert('Login effettuato!');
      navigate('/dashboard'); // <-- Puoi mettere la pagina che preferisci dopo login
    } catch (error) {
      console.error(error);
      alert('Errore nel login');
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
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
        <button type="submit">Login</button>
      </form>

      <p>
        Password dimenticata? <a href="/forgot-password">Reset Password</a>
      </p>
    </div>
  );
}

export default Login;
