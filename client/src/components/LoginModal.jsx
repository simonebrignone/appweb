import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useAxios } from '../api/useAxios';

function LoginModal() {
  const { login, setShowLoginModal } = useAuth();
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const axios = useAxios();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await axios.post("/auth/login", {
        emailOrUsername,
        password,
      });

      login(res.data.accessToken, res.data.user);
      setShowLoginModal(false); // 👈 CHIUDE IL MODALE DOPO IL LOGIN
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Errore durante il login";
      setMessage(errorMessage);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <form onSubmit={handleLogin} className="bg-gray-900 p-6 rounded-lg space-y-4 w-80 text-white">
        <h2 className="text-xl font-bold">Sessione Scaduta</h2>
        <p>Per continuare, effettua nuovamente il login.</p>
        {message && <p className="text-red-500">{message}</p>}
        <input
          type="text"
          placeholder="Email o Username"
          value={emailOrUsername}
          onChange={(e) => setEmailOrUsername(e.target.value)}
          className="input-futuristic"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-futuristic"
          required
        />
        <button type="submit" className="w-full py-2 bg-accent rounded hover:bg-blue-400">
          Login
        </button>
      </form>
    </div>
  );
}

export default LoginModal;

