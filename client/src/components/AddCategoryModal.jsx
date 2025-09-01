import React, { useState } from "react";
import axios from "../api/axiosInstance";

export default function AddCategoryModal({ onClose }) {
  const [categorie, setCategorie] = useState([
    { id: Date.now(), nome: "", descrizione: "", macroGruppo: "", entrata: false }
  ]);
  const [result, setResult] = useState([]);

  const handleChangeCategoria = (id, field, value) => {
    setCategorie(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const handleAddNuovoForm = () => {
    setCategorie(prev => [...prev, { id: Date.now(), nome: "", descrizione: "", macroGruppo: "", entrata: false }]);
  };

  const handleRemoveCategoria = (id) => {
    setCategorie(prev => prev.filter(c => c.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const tempResults = [];

    for (const categoria of categorie) {
      if (!categoria.nome.trim()) {
        tempResults.push({ id: categoria.id, nome: categoria.nome, status: "errore", messaggio: "Nome obbligatorio" });
        continue;
      }

      try {
        await axios.post("/categorie/add", {
          nome: categoria.nome,
          descrizione: categoria.descrizione,
          macroGruppo: categoria.macroGruppo,
          entrata: categoria.entrata
        });
        tempResults.push({ id: categoria.id, nome: categoria.nome, status: "ok" });
      } catch (err) {
        const msg = err.response?.data?.message || "Errore salvataggio";
        tempResults.push({ id: categoria.id, nome: categoria.nome, status: "errore", messaggio: msg });
      }
    }

    setResult(tempResults);

    const idsConErrore = tempResults.filter(r => r.status !== "ok").map(r => r.id);

    if (idsConErrore.length === 0) {
      setCategorie([{ id: Date.now(), nome: "", descrizione: "", macroGruppo: "", entrata: false }]);
    } else {
      setCategorie(prev => prev.filter(c => idsConErrore.includes(c.id)));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-2xl text-white space-y-4 overflow-y-auto max-h-screen">
        <h3 className="text-xl mb-4">Aggiungi Categorie</h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          {categorie.map((c, idx) => (
            <div key={c.id} className="space-y-4 border-b border-gray-700 pb-4">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-semibold">Categoria {idx + 1}</h4>
                {categorie.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveCategoria(c.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ✖ Rimuovi
                  </button>
                )}
              </div>

              <input
                type="text"
                placeholder="Nome categoria"
                value={c.nome}
                onChange={(e) => handleChangeCategoria(c.id, "nome", e.target.value)}
                className="w-full p-2 rounded bg-gray-800 text-white"
                required
              />

              <textarea
                placeholder="Descrizione (opzionale)"
                value={c.descrizione}
                onChange={(e) => handleChangeCategoria(c.id, "descrizione", e.target.value)}
                className="w-full p-2 rounded bg-gray-800 text-white"
              />

              <input
                type="text"
                placeholder="Macro Gruppo (opzionale)"
                value={c.macroGruppo}
                onChange={(e) => handleChangeCategoria(c.id, "macroGruppo", e.target.value)}
                className="w-full p-2 rounded bg-gray-800 text-white"
              />

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={c.entrata}
                  onChange={(e) => handleChangeCategoria(c.id, "entrata", e.target.checked)}
                />
                <label>Categoria di Entrata</label>
              </div>
            </div>
          ))}

          <button type="button" onClick={handleAddNuovoForm} className="w-full bg-gray-700 rounded p-2">
            + Aggiungi un'altra categoria
          </button>

          <div className="flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-700 rounded">
              Chiudi
            </button>
            <button type="submit" className="px-4 py-2 bg-accent rounded">
              Salva tutte
            </button>
          </div>
        </form>

        {result.length > 0 && (
          <div className="mt-6">
            <h4 className="text-lg font-semibold mb-2">Riepilogo:</h4>
            <ul className="space-y-1">
              {result.map((r, i) => (
                <li key={i} className={`p-2 rounded ${r.status === 'ok' ? 'bg-green-700' : 'bg-red-700'}`}>
                  {r.nome || "(senza nome)"}: {r.status === 'ok' ? "Salvata correttamente" : r.messaggio}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
