import React, { useEffect, useState } from "react";
import axios from "../api/axiosInstance";

export default function AddExpenseModal({ onClose, prepopola }) {
  const [spese, setSpese] = useState([
    {
      id: Date.now(),
      prodottoId: "",
      nuovoProdotto: prepopola?.nuovoProdotto || "",
      negozioId: "",
      nuovoNegozio: prepopola?.nuovoNegozio || "",
      gruppoId: "",
      prezzo: prepopola?.prezzo || "",
      data: prepopola?.data ? new Date(prepopola.data).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      ricorrente: false,
      frequenza: "mensile"
    }
  ]);

  const [prodotti, setProdotti] = useState([]);
  const [negozi, setNegozi] = useState([]);
  const [gruppi, setGruppi] = useState([]);
  const [result, setResult] = useState([]);

  useEffect(() => {
    axios.get("/prodotti/miei").then(res => setProdotti(res.data)).catch(err => console.error(err));
    axios.get("/negozi/miei").then(res => setNegozi(res.data)).catch(err => console.error(err));
    axios.get("/gruppi-spesa/miei").then(res => setGruppi(res.data)).catch(err => console.error(err));
  }, []);

  const handleChange = (id, field, value) => {
    setSpese(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleAddSpesa = () => {
    setSpese(prev => [...prev, {
      id: Date.now(), prodottoId: "", nuovoProdotto: "", negozioId: "", nuovoNegozio: "", gruppoId: "", prezzo: "", data: new Date().toISOString().split("T")[0], ricorrente: false, frequenza: "mensile"
    }]);
  };

  const handleRemoveSpesa = (id) => {
    setSpese(prev => prev.filter(s => s.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const tempResults = [];
    const failedIds = [];
    const successfulIds = [];

    for (const spesa of spese) {
      let prodottoFinale = spesa.prodottoId;
      let negozioFinale = spesa.negozioId;
      let gruppoFinale = spesa.gruppoId;

      if (spesa.prodottoId === "__new__" && !spesa.nuovoProdotto.trim()) {
        tempResults.push({ id: spesa.id, status: "errore", messaggio: "Nome nuovo prodotto obbligatorio" });
        failedIds.push(spesa.id);
        continue;
      }

      if (spesa.negozioId === "__new__" && !spesa.nuovoNegozio.trim()) {
        tempResults.push({ id: spesa.id, status: "errore", messaggio: "Nome nuovo negozio obbligatorio" });
        failedIds.push(spesa.id);
        continue;
      }

      try {
        if (spesa.prodottoId === "__new__") {
          const res = await axios.post("/prodotti/add", { nome: spesa.nuovoProdotto });
          prodottoFinale = res.data.prodottoId;
          setProdotti(prev => [{ id: prodottoFinale, nome: spesa.nuovoProdotto }, ...prev]);
        }

        if (spesa.negozioId === "__new__") {
          const res = await axios.post("/negozi/add", { nome: spesa.nuovoNegozio });
          negozioFinale = res.data.id;
          setNegozi(prev => [{ id: negozioFinale, nome: spesa.nuovoNegozio }, ...prev]);
        }

        const payload = {
          prodottoId: parseInt(prodottoFinale),
          negozioId: negozioFinale ? parseInt(negozioFinale) : null,
          gruppoId: gruppoFinale ? parseInt(gruppoFinale) : null,
          prezzo: parseFloat(spesa.prezzo),
          data: spesa.data,
          ricorrente: spesa.ricorrente,
          frequenza: spesa.ricorrente ? spesa.frequenza : null
        };

        const response = await axios.post("/spese/add", payload);
        tempResults.push({ id: spesa.id, status: "ok", messaggio: `Spesa salvata con ID ${response.data.id}` });
        successfulIds.push(spesa.id);
      } catch (err) {
        const msg = err.response?.data?.message || "Errore salvataggio";
        tempResults.push({ id: spesa.id, status: "errore", messaggio: msg });
        failedIds.push(spesa.id);
      }
    }

    setResult(tempResults);

    if (failedIds.length === 0) {
      setSpese([
        {
          id: Date.now(),
          prodottoId: "",
          nuovoProdotto: "",
          negozioId: "",
          nuovoNegozio: "",
          gruppoId: "",
          prezzo: "",
          data: new Date().toISOString().split("T")[0],
          ricorrente: false,
          frequenza: "mensile"
        }
      ]);
    } else {
      setSpese(prev => prev.filter(s => failedIds.includes(s.id)));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-3xl text-white space-y-4 overflow-y-auto max-h-screen">
        <h3 className="text-xl mb-4">Aggiungi Spese</h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          {spese.map((s, idx) => (
            <div key={s.id} className="space-y-4 border-b border-gray-700 pb-4">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-semibold">Spesa {idx + 1}</h4>
                {spese.length > 1 && (
                  <button type="button" onClick={() => handleRemoveSpesa(s.id)} className="text-red-500 hover:text-red-700">✖ Rimuovi</button>
                )}
              </div>

              <select value={s.prodottoId} onChange={(e) => handleChange(s.id, "prodottoId", e.target.value)} className="w-full p-2 rounded bg-gray-800 text-white" required>
                <option value="__new__">+ Nuovo prodotto</option>
                <option value="">Seleziona prodotto</option>
                {prodotti.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
              {s.prodottoId === "__new__" && (
                <input type="text" value={s.nuovoProdotto} onChange={(e) => handleChange(s.id, "nuovoProdotto", e.target.value)} placeholder="Nome nuovo prodotto" className="w-full p-2 rounded bg-gray-800 text-white" required />
              )}

              <select value={s.negozioId} onChange={(e) => handleChange(s.id, "negozioId", e.target.value)} className="w-full p-2 rounded bg-gray-800 text-white">
                <option value="__new__">+ Nuovo negozio</option>
                <option value="">Senza negozio</option>
                {negozi.map(n => <option key={n.id} value={n.id}>{n.nome}</option>)}
              </select>
              {s.negozioId === "__new__" && (
                <input type="text" value={s.nuovoNegozio} onChange={(e) => handleChange(s.id, "nuovoNegozio", e.target.value)} placeholder="Nome nuovo negozio" className="w-full p-2 rounded bg-gray-800 text-white" required />
              )}

              <select value={s.gruppoId} onChange={(e) => handleChange(s.id, "gruppoId", e.target.value)} className="w-full p-2 rounded bg-gray-800 text-white">
                <option value="">Senza gruppo</option>
                {gruppi.map(g => <option key={g.id} value={g.id}>{g.nome}</option>)}
              </select>

              <input type="number" min="0" step="0.01" placeholder="Prezzo €" value={s.prezzo} onChange={(e) => handleChange(s.id, "prezzo", e.target.value)} className="w-full p-2 rounded bg-gray-800 text-white" required />

              <input type="date" value={s.data} onChange={(e) => handleChange(s.id, "data", e.target.value)} className="w-full p-2 rounded bg-gray-800 text-white" required />

              <div className="flex items-center space-x-2">
                <input type="checkbox" checked={s.ricorrente} onChange={(e) => handleChange(s.id, "ricorrente", e.target.checked)} />
                <label>Pagamento ricorrente</label>
              </div>

              {s.ricorrente && (
                <select value={s.frequenza} onChange={(e) => handleChange(s.id, "frequenza", e.target.value)} className="w-full p-2 rounded bg-gray-800 text-white">
                  <option value="giornaliero">Giornaliero</option>
                  <option value="settimanale">Settimanale</option>
                  <option value="mensile">Mensile</option>
                  <option value="annuale">Annuale</option>
                </select>
              )}
            </div>
          ))}

          <button type="button" onClick={handleAddSpesa} className="w-full bg-gray-700 rounded p-2">
            + Aggiungi un'altra spesa
          </button>

          <div className="flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-700 rounded">Chiudi</button>
            <button type="submit" className="px-4 py-2 bg-accent rounded">Salva tutte</button>
          </div>
        </form>

        {result.length > 0 && (
          <div className="mt-6">
            <h4 className="text-lg font-semibold mb-2">Riepilogo:</h4>
            <ul className="space-y-1">
              {result.map((r, i) => (
                <li key={i} className={`p-2 rounded ${r.status === 'ok' ? 'bg-green-700' : 'bg-red-700'}`}>
                  {r.messaggio}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
