import React, { useState } from "react";
import axios from "../api/axiosInstance";

export default function AddGroupModal({ onClose }) {
  const [nome, setNome] = useState("");
  const [descrizione, setDescrizione] = useState("");
  const [utenti, setUtenti] = useState([{ id: Date.now(), identificatore: "", userId: null, admin: false, valido: null, suggerimenti: [] }]);
  const [result, setResult] = useState(null);

  const handleChangeUtente = (id, field, value) => {
    setUtenti(prev => prev.map(u => u.id === id ? { ...u, [field]: value } : u));
  };

  const handleAutocomplete = async (id, query) => {
    if (!query || query.trim().length < 2) return;
    try {
      const res = await axios.get(`/utenti/suggerimenti?query=${encodeURIComponent(query)}`);
      setUtenti(prev => prev.map(u => u.id === id ? { ...u, suggerimenti: res.data } : u));
    } catch {
      setUtenti(prev => prev.map(u => u.id === id ? { ...u, suggerimenti: [] } : u));
    }
  };

  const handleSelectSuggerimento = (id, identificatore, userId) => {
    setUtenti(prev =>
      prev.map(u => u.id === id
        ? { ...u, identificatore, userId, valido: true, suggerimenti: [] }
        : u
      )
    );
  };

  const handleCheckUtente = async (id) => {
    const utente = utenti.find(u => u.id === id);
    if (!utente || !utente.identificatore.trim()) return;
    try {
      const res = await axios.get(`/utenti/verifica?identificatore=${encodeURIComponent(utente.identificatore)}`);
      handleChangeUtente(id, "valido", res.data.valido);
      if (res.data.valido && res.data.userId) {
        handleChangeUtente(id, "userId", res.data.userId);
      }
    } catch {
      handleChangeUtente(id, "valido", false);
    }
  };

  const handleAddUtente = () => {
    setUtenti(prev => [...prev, { id: Date.now(), identificatore: "", userId: null, admin: false, valido: null, suggerimenti: [] }]);
  };

  const handleRemoveUtente = (id) => {
    setUtenti(prev => prev.filter(u => u.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResult(null);

    if (!nome.trim()) {
      setResult({ status: "errore", messaggio: "Il nome del gruppo è obbligatorio" });
      return;
    }

    try {
      const res = await axios.post("/gruppi-spesa/create", { nome, descrizione });
      const gruppoId = res.data.gruppoId;

      for (const u of utenti) {
        if (u.userId && u.valido) {
          await axios.post("/gruppi-spesa/add_user", {
            gruppoId,
            userId: u.userId,
            admin: u.admin
          });
        }
      }

      setResult({ status: "ok", messaggio: "Gruppo creato correttamente" });
      setNome("");
      setDescrizione("");
      setUtenti([{ id: Date.now(), identificatore: "", userId: null, admin: false, valido: null, suggerimenti: [] }]);
    } catch (err) {
      const msg = err.response?.data?.message || "Errore durante la creazione del gruppo";
      setResult({ status: "errore", messaggio: msg });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-2xl text-white space-y-4 overflow-y-auto max-h-screen">
        <h3 className="text-xl mb-4">Crea Gruppo Spesa</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Nome gruppo"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 text-white"
            required
          />

          <textarea
            placeholder="Descrizione (opzionale)"
            value={descrizione}
            onChange={(e) => setDescrizione(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 text-white"
          />

          <h4 className="font-semibold">Utenti da aggiungere</h4>
          {utenti.map((u, i) => (
            <div key={u.id} className="space-y-1 border-b border-gray-600 pb-3">
              <div className="flex items-center space-x-2 relative">
                <input
                  type="text"
                  placeholder="Username o email"
                  value={u.identificatore}
                  onChange={(e) => {
                    handleChangeUtente(u.id, "identificatore", e.target.value);
                    handleAutocomplete(u.id, e.target.value);
                  }}
                  onBlur={() => handleCheckUtente(u.id)}
                  className="flex-1 p-2 rounded bg-gray-800 text-white"
                />
                <input
                  type="checkbox"
                  checked={u.admin}
                  onChange={(e) => handleChangeUtente(u.id, "admin", e.target.checked)}
                />
                <label>Admin</label>
                <button
                  type="button"
                  onClick={() => handleRemoveUtente(u.id)}
                  className="text-red-500 hover:text-red-700"
                >✖</button>
              </div>
              {u.suggerimenti.length > 0 && (
                <ul className="bg-gray-800 rounded mt-1 text-sm">
                  {u.suggerimenti.map(s => (
                    <li
                      key={s.id}
                      className="p-2 hover:bg-gray-700 cursor-pointer"
                      onMouseDown={() => handleSelectSuggerimento(u.id, s.email || s.username, s.id)}
                    >
                      {s.username} ({s.email})
                    </li>
                  ))}
                </ul>
              )}
              {u.valido === true && <p className="text-green-400 text-sm">Utente valido</p>}
              {u.valido === false && <p className="text-red-400 text-sm">Utente non trovato</p>}
            </div>
          ))}

          <button type="button" onClick={handleAddUtente} className="w-full bg-gray-700 rounded p-2">
            + Aggiungi un altro utente
          </button>

          <div className="flex justify-end space-x-2 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-700 rounded">
              Chiudi
            </button>
            <button type="submit" className="px-4 py-2 bg-accent rounded">
              Crea gruppo
            </button>
          </div>
        </form>

        {result && (
          <div className={`mt-4 p-2 rounded ${result.status === 'ok' ? 'bg-green-700' : 'bg-red-700'}`}>
            {result.messaggio}
          </div>
        )}
      </div>
    </div>
  );
}