import React, { useEffect, useState } from "react";
import axios from "../api/axiosInstance";

export default function AddStoreModal({ onClose }) {
  const [negozi, setNegozi] = useState([
    {
      id: Date.now(),
      nome: "",
      citta: "",
      via: "",
      numeroVia: "",
      descrizione: "",
      online: false
    }
  ]);
  const [result, setResult] = useState([]);

  const handleChange = (id, field, value) => {
    setNegozi(prev => prev.map(n => n.id === id ? { ...n, [field]: value } : n));
  };

  const handleAddForm = () => {
    setNegozi(prev => [...prev, {
      id: Date.now(), nome: "", citta: "", via: "", numeroVia: "", descrizione: "", online: false
    }]);
  };

  const handleRemove = (id) => {
    setNegozi(prev => prev.filter(n => n.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const tempResults = [];

    for (const n of negozi) {
      if (!n.nome.trim()) {
        tempResults.push({ id: n.id, nome: n.nome, status: "errore", messaggio: "Nome obbligatorio" });
        continue;
      }

      try {
        await axios.post("/negozi/add", {
          nome: n.nome,
          citta: n.citta,
          via: n.via,
          numeroVia: n.numeroVia,
          descrizione: n.descrizione,
          online: n.online
        });
        tempResults.push({ id: n.id, nome: n.nome, status: "ok" });
      } catch (err) {
        const msg = err.response?.data?.message || "Errore salvataggio";
        tempResults.push({ id: n.id, nome: n.nome, status: "errore", messaggio: msg });
      }
    }

    setResult(tempResults);

    const idsConErrore = tempResults.filter(r => r.status !== "ok").map(r => r.id);

    if (idsConErrore.length === 0) {
      setNegozi([{ id: Date.now(), nome: "", citta: "", via: "", numeroVia: "", descrizione: "", online: false }]);
    } else {
      setNegozi(prev => prev.filter(n => idsConErrore.includes(n.id)));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-2xl text-white space-y-4 overflow-y-auto max-h-screen">
        <h3 className="text-xl mb-4">Aggiungi Negozi</h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          {negozi.map((n, i) => (
            <div key={n.id} className="space-y-4 border-b border-gray-700 pb-4">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-semibold">Negozio {i + 1}</h4>
                {negozi.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemove(n.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ✖ Rimuovi
                  </button>
                )}
              </div>

              <input
                type="text"
                placeholder="Nome negozio"
                value={n.nome}
                onChange={(e) => handleChange(n.id, "nome", e.target.value)}
                className="w-full p-2 rounded bg-gray-800 text-white"
                required
              />

              <input
                type="text"
                placeholder="Città (opzionale)"
                value={n.citta}
                onChange={(e) => handleChange(n.id, "citta", e.target.value)}
                className="w-full p-2 rounded bg-gray-800 text-white"
              />

              <input
                type="text"
                placeholder="Via (opzionale)"
                value={n.via}
                onChange={(e) => handleChange(n.id, "via", e.target.value)}
                className="w-full p-2 rounded bg-gray-800 text-white"
              />

              <input
                type="text"
                placeholder="Numero civico (opzionale)"
                value={n.numeroVia}
                onChange={(e) => handleChange(n.id, "numeroVia", e.target.value)}
                className="w-full p-2 rounded bg-gray-800 text-white"
              />

              <textarea
                placeholder="Descrizione (opzionale)"
                value={n.descrizione}
                onChange={(e) => handleChange(n.id, "descrizione", e.target.value)}
                className="w-full p-2 rounded bg-gray-800 text-white"
              />

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={n.online}
                  onChange={(e) => handleChange(n.id, "online", e.target.checked)}
                />
                <label>Negozio Online</label>
              </div>
            </div>
          ))}

          <button type="button" onClick={handleAddForm} className="w-full bg-gray-700 rounded p-2">
            + Aggiungi un altro negozio
          </button>

          <div className="flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-700 rounded">
              Chiudi
            </button>
            <button type="submit" className="px-4 py-2 bg-accent rounded">
              Salva tutti
            </button>
          </div>
        </form>

        {result.length > 0 && (
          <div className="mt-6">
            <h4 className="text-lg font-semibold mb-2">Riepilogo:</h4>
            <ul className="space-y-1">
              {result.map((r, i) => (
                <li key={i} className={`p-2 rounded ${r.status === 'ok' ? 'bg-green-700' : 'bg-red-700'}`}>
                  {r.nome || "(senza nome)"}: {r.status === 'ok' ? "Salvato correttamente" : r.messaggio}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
