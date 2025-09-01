import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Register from './pages/Register';
import Home from './pages/Home';
import Home_Pantry from './pages/Home_Pantry';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ChangePassword from './pages/ChangePassword';
import UserManagement from './pages/UserManagement';
import Home_Expense from "./pages/Home_Expense";
import Dashboard_Expense from "./pages/Dashboard_Expense";
import ProtectedRoute from './components/ProtectedRoute';
import ProtectedByPermissionRoute from './components/ProtectedByPermissionRoute';
import Unauthorized from './pages/Unauthorized';
import LoginModal from './components/LoginModal';
import { useAuth } from './contexts/AuthContext';
import RootRedirect from './components/RootRedirect';




function App() {
  const { showLoginModal } = useAuth();
  return (
    <div >
      {/* Navigation (opzionale, puoi metterla qui o in una Layout component) */}
      {showLoginModal && <LoginModal />}

      <Routes>
        {/* Pagine pubbliche */}
        <Route path="/" element={<RootRedirect />} />
        <Route path="/spbapp" element={<LandingPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<LandingPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/change-password" element={<ChangePassword />} />

        {/* Pagine protette */}
        <Route element={<ProtectedRoutesWrapper />}>
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/home" element={<Home />} />
        </Route>

        {/* Rotta di fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

        {/* Pagine protette da permessi */}

        <Route path="/spese" element={
          <ProtectedByPermissionRoute permission="expense_standard">
            <Home_Expense />
          </ProtectedByPermissionRoute>
        } />

        <Route path="/spese/dashboard" element={
          <ProtectedByPermissionRoute permission="expense_standard">
            <Dashboard_Expense />
          </ProtectedByPermissionRoute>
        } />

        <Route path="/pantry" element={
          <ProtectedByPermissionRoute permission="pantry_standard">
            <Home_Pantry />
          </ProtectedByPermissionRoute>
        } />



        {/* Rotta di mancato permesso */}
        <Route path="/unauthorized" element={<Unauthorized />} />

      </Routes>
    </div>
  );
}

// Wrapper che protegge tutte le rotte figlie
function ProtectedRoutesWrapper() {
  return (
    <ProtectedRoute>
      <Outlet />
    </ProtectedRoute>
  );
}

export default App;