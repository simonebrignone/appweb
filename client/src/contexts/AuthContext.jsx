import React from 'react';
import { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axiosInstance';
import { logoutUser } from '../utils/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);
  const [loading, setLoading] = useState(true); // <-- Importante

  useEffect(() => {
    const checkRefreshToken = async () => {
      try {
        const res = await axios.post('/refresh-token');
        localStorage.setItem('token', res.data.accessToken);
        setToken(res.data.accessToken);
        setIsAuthenticated(true);
      } catch (error) {
        logoutUser(); // Refresh fallito -> logout
      } finally {
        setLoading(false); // Caricamento finito in ogni caso
      }
    };

    if (!token) {
      checkRefreshToken();
    } else {
      setLoading(false); // Se token già presente, no need
    }
  }, []);

  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setIsAuthenticated(false);
    axios.post('/logout'); // cancella cookie server side
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ token, isAuthenticated, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
