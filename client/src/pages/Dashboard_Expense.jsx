import React, { useState } from "react";
import DataTable from "../components/DataTable"; // ✅ aggiorna il path se serve

const RESOURCE_ENDPOINTS = {
  prodotti: "/prodotti/miei",
  negozi: "/negozi/miei",
  categorie: "/categorie/miei",
  spese: "/spese/miei",
  ricorrenti: "/pagamenti-ricorrenti/miei",
  gruppi: "/gruppi-spesa/miei"
};

const RESOURCE_BASE = {
  prodotti: "/prodotti",
  negozi: "/negozi",
  categorie: "/categorie",
  spese: "/spese",
  ricorrenti: "/pagamenti-ricorrenti",
  gruppi: "/gruppi-spesa"
};


const RELATION_FIELDS = {
  prodotti: { categoria: "nome", user: "username" },
  negozi: { user: "username" },
  categorie: { user: "username" },
  spese: { prodotto: "nome", negozio: "nome", gruppo: "nome", utente: "username" },
  ricorrenti: { prodotto: "nome", negozio: "nome", user: "username" },
  gruppi: { creatoDa: "fullname" }
};

export default function VisualizzaDatiUtente() {
  const [risorsa, setRisorsa] = useState("prodotti");

  return (
    <div className="p-6 text-white">
      <h2 className="text-2xl font-bold mb-6">Visualizza Dati Utente</h2>

      <div className="flex gap-4 mb-6">
        <label>Seleziona risorsa:</label>
        <select
          value={risorsa}
          onChange={e => setRisorsa(e.target.value)}
          className="bg-gray-800 p-2 rounded"
        >
          {Object.keys(RESOURCE_ENDPOINTS).map(k => (
            <option key={k} value={k}>{k.charAt(0).toUpperCase() + k.slice(1)}</option>
          ))}
        </select>
      </div>

      <DataTable
        titolo={risorsa.charAt(0).toUpperCase() + risorsa.slice(1)}
        endpoint={RESOURCE_ENDPOINTS[risorsa]}
        endpointBase={RESOURCE_BASE[risorsa]}
        mappaRelazioni={RELATION_FIELDS[risorsa] || {}}
      />
    </div>
  );
}
