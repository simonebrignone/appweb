import React, { useEffect, useState } from "react";
import QrReader from "react-qr-barcode-scanner";
import axios from "../api/axiosInstance";

export default function AddProductModal({ onClose }) {
  const [categories, setCategories] = useState([]);
  const [prodotti, setProdotti] = useState([
    { id: Date.now(), nome: "", descrizione: "", categoriaId: "", nuovaCategoria: "", barcode: "" }
  ]);
  const [showScanner, setShowScanner] = useState(null);
  const [result, setResult] = useState([]);

  useEffect(() => {
    axios.get("/categorie/miei")
      .then(res => setCategories(res.data))
      .catch(err => console.error("Errore caricamento categorie", err));
  }, []);

  const handleChangeProdotto = (id, field, value) => {
    setProdotti(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleRemoveProdotto = (id) => {
    setProdotti(prev => prev.filter(p => p.id !== id));
  };

  const handleAddNuovoForm = () => {
    setProdotti(prev => [...prev, { id: Date.now(), nome: "", descrizione: "", categoriaId: "", nuovaCategoria: "", barcode: "" }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const tempResults = [];

    for (const prodotto of prodotti) {
      let categoriaFinale = prodotto.categoriaId;

      if (prodotto.categoriaId === "__new__" && prodotto.nuovaCategoria.trim()) {
        try {
          const res = await axios.post("/categorie/add", { nome: prodotto.nuovaCategoria });
          categoriaFinale = res.data.categoriaId;
        } catch (err) {
          const msg = err.response?.data?.message || "Errore creazione categoria";
          tempResults.push({ id: prodotto.id, nome: prodotto.nome, status: "errore", messaggio: msg });
          continue;
        }
      }

      try {
        await axios.post("/prodotti/add", {
          nome: prodotto.nome,
          descrizione: prodotto.descrizione,
          categoriaId: categoriaFinale || null,
          barcode: prodotto.barcode || ""
        });
        tempResults.push({ id: prodotto.id, nome: prodotto.nome, status: "ok" });
      } catch (err) {
        const msg = err.response?.data?.message || "Errore salvataggio prodotto";
        tempResults.push({ id: prodotto.id, nome: prodotto.nome, status: "errore", messaggio: msg });
      }
    }

    setResult(tempResults);

    const idsConErrore = tempResults.filter(r => r.status !== "ok").map(r => r.id);

    if (idsConErrore.length === 0) {
      setProdotti([
        { id: Date.now(), nome: "", descrizione: "", categoriaId: "", nuovaCategoria: "", barcode: "" }
      ]);
    } else {
      setProdotti(prev => prev.filter(p => idsConErrore.includes(p.id)));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-2xl text-white space-y-4 overflow-y-auto max-h-screen">
        <h3 className="text-xl mb-4">Aggiungi Prodotti</h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          {prodotti.map((p, idx) => (
            <div key={p.id} className="space-y-4 border-b border-gray-700 pb-4">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-semibold">Prodotto {idx + 1}</h4>
                {prodotti.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveProdotto(p.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ✖ Rimuovi
                  </button>
                )}
              </div>

              <input
                type="text"
                placeholder="Nome prodotto"
                value={p.nome}
                onChange={(e) => handleChangeProdotto(p.id, "nome", e.target.value)}
                className="w-full p-2 rounded bg-gray-800 text-white"
                required
              />

              <textarea
                placeholder="Descrizione (opzionale)"
                value={p.descrizione}
                onChange={(e) => handleChangeProdotto(p.id, "descrizione", e.target.value)}
                className="w-full p-2 rounded bg-gray-800 text-white"
              />

              <select
                value={p.categoriaId}
                onChange={(e) => handleChangeProdotto(p.id, "categoriaId", e.target.value)}
                className="w-full p-2 rounded bg-gray-800 text-white"
              >
                <option value="">Seleziona Categoria (opzionale)</option>
                <option value="__new__">+ Nuova Categoria</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nome}</option>
                ))}
                <option value="__new__">+ Nuova Categoria</option>
              </select>

              {p.categoriaId === "__new__" && (
                <input
                  type="text"
                  placeholder="Nome nuova categoria"
                  value={p.nuovaCategoria}
                  onChange={(e) => handleChangeProdotto(p.id, "nuovaCategoria", e.target.value)}
                  className="w-full p-2 rounded bg-gray-800 text-white"
                />
              )}

              <div>
                <h4 className="font-semibold mb-2">Barcode</h4>
                <input
                  type="text"
                  placeholder="Barcode (opzionale)"
                  value={p.barcode}
                  onChange={(e) => handleChangeProdotto(p.id, "barcode", e.target.value)}
                  className="w-full p-2 rounded bg-gray-800 text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowScanner(p.id)}
                  className="mt-2 bg-accent px-4 py-2 rounded"
                >
                  {showScanner === p.id ? "Chiudi Scanner" : "Scansiona Barcode"}
                </button>
                {showScanner === p.id && (
                  <QrReader
                    onResult={(result, error) => {
                      if (!!result) {
                        handleChangeProdotto(p.id, "barcode", result.text);
                      }
                    }}
                    style={{ width: "100%" }}
                  />
                )}
              </div>
            </div>
          ))}

          <button type="button" onClick={handleAddNuovoForm} className="w-full bg-gray-700 rounded p-2">
            + Aggiungi un altro prodotto
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