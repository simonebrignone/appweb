import React, { useEffect, useState } from "react";
import axios from "../api/axiosInstance";

export default function MessageModal({ onClose }) {
  const [inviti, setInviti] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInviti = async () => {
      try {
        const res = await axios.get("/gruppi-spesa/messaggi");
        setInviti(res.data);
      } catch (err) {
        console.error("Errore recupero inviti:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInviti();
  }, []);

  const handleConferma = async (gruppoId) => {
    try {
      await axios.post("/gruppi-spesa/conferma", { gruppoId });
      setInviti(prev => prev.filter(i => i.gruppo.id !== gruppoId));
    } catch (err) {
      console.error("Errore conferma invito:", err);
    }
  };

  const handleRifiuta = async (gruppoId) => {
    try {
      await axios.delete("/gruppi-spesa/rifiuta", { data: { gruppoId } });
      setInviti(prev => prev.filter(i => i.gruppo.id !== gruppoId));
    } catch (err) {
      console.error("Errore rifiuto invito:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-xl text-white space-y-6">
        <div className="flex justify-between items-center border-b border-gray-700 pb-2">
          <h3 className="text-lg font-semibold">Messaggi</h3>
          <button onClick={onClose} className="text-red-500 hover:text-red-700">✖</button>
        </div>

        {loading ? (
          <p className="text-center text-gray-400">Caricamento...</p>
        ) : (
          <div className="space-y-6">
            {/* Inviti Gruppi Spesa */}
            <div>
              <h4 className="text-md font-bold border-b border-gray-600 mb-2 pb-1">Inviti Gruppi Spesa</h4>
              {inviti.length === 0 ? (
                <p className="text-sm text-gray-500">Nessun invito attivo.</p>
              ) : (
                <ul className="space-y-4">
                  {inviti.map((i) => (
                    <li key={i.gruppo.id} className="bg-gray-800 p-4 rounded shadow">
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <p className="font-semibold">{i.gruppo.nome}</p>
                          <p className="text-sm text-gray-400">Admin: {i.gruppo.creatoDa.username || i.gruppo.creatoDa.email}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleConferma(i.gruppo.id)}
                            className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded"
                          >Accetta</button>
                          <button
                            onClick={() => handleRifiuta(i.gruppo.id)}
                            className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
                          >Rifiuta</button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Altri messaggi */}
            <div>
              <h4 className="text-md font-bold border-b border-gray-600 mb-2 pb-1">Altro</h4>
              <p className="text-sm text-gray-400">Qui compariranno altri tipi di messaggi in futuro.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}