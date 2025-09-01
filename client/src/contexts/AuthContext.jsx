import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthContext = createContext();

let currentToken = null;
export const getToken = () => currentToken;

let externalShowSessionExpired = null;
export const setShowSessionExpiredHandler = (handler) => {
  externalShowSessionExpired = handler;
};

export const showSessionExpired = () => {
  if (externalShowSessionExpired) {
    externalShowSessionExpired();
  }
};

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [forcePasswordChangeMode, setForcePasswordChangeMode] = useState(false);
  const [passwordChangeToken, setPasswordChangeToken] = useState(null);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false); // volontario


  useEffect(() => {
    currentToken = token;
    setIsAuthenticated(!!token);
  }, [token]);

  const hasRole = (role) => {
    return user?.roles?.includes(role);
  };

  const hasPermission = hasRole;

  const fetchUserData = async () => {
    if (!token) {
      console.error('Token mancante, impossibile recuperare user');
      logout(false); // Utente non autenticato → redirect
      return;
    }

    try {
      const res = await axios.get('/api/user/me', {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (typeof res.data !== 'object' || res.data === null) {
        throw new Error("Invalid user data received");
      }

      const safeUser = {
        ...res.data,
        roles: res.data.roles || []
      };

      setUser(safeUser);
      localStorage.setItem('user', JSON.stringify(safeUser));
    } catch (error) {
      console.error('Errore durante il recupero utente:', error);
      logout(true, true); // Sessione scaduta → mostra LoginModal
    }
  };

  const validateSession = async () => {
    const storedToken = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get('/api/auth/refresh-token', { withCredentials: true });
      setToken(res.data.accessToken);
      await fetchUserData();
    } catch (error) {
      console.error('Sessione non valida o refresh fallito');
      logout(true, true); // Sessione scaduta → mostra LoginModal
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    validateSession();
  }, []);

  useEffect(() => {
    setShowSessionExpiredHandler(() => () => {
      logout(false, true); // mostra login con redirect
    });
  }, []);

  // 🛡️ VERSIONE MIGLIORATA
  const logout = (silent = false, sessionExpired = false) => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');

    if (sessionExpired) {
      navigate('/login', { replace: true }); // Utente non autenticato → redirect
    } else if (!silent) {
      navigate('/login', { replace: true }); // Utente non autenticato → redirect
    }
  };

  const login = async (newToken, userData, passwordChangeToken = null) => {
    const safeUserData = {
      ...userData,
      roles: userData.roles || []
    };
  
    setToken(newToken);
    setUser(safeUserData);
    setShowLoginModal(false);
    setIsAuthenticated(true);
  
    localStorage.setItem('accessToken', newToken);
    localStorage.setItem('user', JSON.stringify(safeUserData));
  
    if (safeUserData.mustChangePassword) {
      if (passwordChangeToken) {
        setPasswordChangeToken(passwordChangeToken);
        setForcePasswordChangeMode(true);
      }
      return; // non navighiamo → il modale sarà mostrato
    }
  
    const redirectPath = localStorage.getItem('redirectAfterLogin');
    if (redirectPath) {
      localStorage.removeItem('redirectAfterLogin');
      window.location.href = redirectPath;
    } else {
      navigate('/home', { replace: true });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated,
        login,
        logout,
        loading,
        showLoginModal,
        setShowLoginModal,
        setToken,
        hasPermission,
        hasRole,
        forcePasswordChangeMode,
        passwordChangeToken,
        setForcePasswordChangeMode,
        showChangePasswordModal,
        setShowChangePasswordModal
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve essere usato all\'interno di un AuthProvider');
  }
  return context;
};
