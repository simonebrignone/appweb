// utils/auth.js

// Legge il token dal localStorage
export function getToken() {
    return localStorage.getItem('token');
  }
  
  // Scrive il token nel localStorage
  export function setToken(token) {
    localStorage.setItem('token', token);
  }
  
  // Rimuove il token dal localStorage e fa il redirect al login
  export function logoutUser() {
    localStorage.removeItem('token');
    window.location.href = '/login'; // Redirect immediato
  }
  