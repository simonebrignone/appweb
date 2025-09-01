import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useAxios } from "../api/useAxios";

function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const { logout } = useAuth();
  const navigate = useNavigate();
  const axiosInstance = useAxios();

  const handleChangePassword = async (e) => {
    e.preventDefault();

    try {
      await axiosInstance.post("/auth/change-password", {
        currentPassword,
        newPassword,
      });

      setMessage("Password cambiata con successo. Effettua di nuovo il login.");
      
      // Logout → torna alla login
      logout();
      navigate("/login");
    } catch (err) {
      setMessage(err.response?.data?.message || "Errore durante il cambio password.");
    }
  };

  return (
    <form onSubmit={handleChangePassword}>
      <h2>Cambia Password</h2>
      {message && <p>{message}</p>}

      <input
        type="password"
        placeholder="Password attuale"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        required
      />

      <input
        type="password"
        placeholder="Nuova password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        required
      />

      <button type="submit">Cambia Password</button>
    </form>
  );
}

export default ChangePassword;
