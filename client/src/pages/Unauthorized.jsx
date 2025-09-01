import React from 'react';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white text-center p-8">
      <h1 className="text-5xl mb-6">🚫 Accesso Negato</h1>
      <p className="text-lg mb-8 text-gray-400">
        Non hai i permessi necessari per visualizzare questa pagina.
      </p>
      <div className="space-x-4">
        <button
          onClick={() => navigate(-1)}
          className="bg-accent text-white px-6 py-3 rounded-lg hover:bg-opacity-80 transition"
        >
          Torna Indietro
        </button>
        <button
          onClick={() => navigate("/")}
          className="bg-gray-700 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition"
        >
          Vai alla Home
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;
