import React, { useEffect, useState } from "react";
import axios from "../api/axiosInstance";
import DataTable from "./DataTable";

export default function SpeseGruppoView() {
  const [gruppi, setGruppi] = useState([]);
  const [gruppoSelezionato, setGruppoSelezionato] = useState(null);
  const [spese, setSpese] = useState([]);
  const [statistiche, setStatistiche] = useState(null);
  const [numeroUtenti, setNumeroUtenti] = useState(null);
  const [userIdCorrente, setUserIdCorrente] = useState(null);

  // 🔐 Recupera l'utente loggato
  useEffect(() => {
    axios.get("/utenti/myself")
      .then(res => setUserIdCorrente(res.data.id))
      .catch(() => alert("Errore nel recupero dell'utente autenticato"));
  }, []);

  // Carica i gruppi dell'utente
  useEffect(() => {
    axios.get("/gruppi-spesa/miei")
      .then(res => setGruppi(res.data))
      .catch(() => alert("Errore nel recupero dei gruppi"));
  }, []);

  // Al cambio gruppo selezionato e solo se userIdCorrente è noto
  useEffect(() => {
    if (!gruppoSelezionato || userIdCorrente == null) return;

    axios.get(`/spese/spese-gruppo/${gruppoSelezionato.id}`)
      .then(res => {
        setSpese(res.data);
      })
      .catch(() => alert("Errore nel recupero delle spese del gruppo"));

    axios.get(`/gruppi-spesa/${gruppoSelezionato.id}/utenti-count`)
      .then(res => setNumeroUtenti(res.data.numeroUtenti))
      .catch(() => alert("Errore nel recupero del numero di utenti del gruppo"));
  }, [gruppoSelezionato, userIdCorrente]);

  // Quando spese e numero utenti sono disponibili, calcola le statistiche
  useEffect(() => {
    if (spese.length > 0 && numeroUtenti != null) {
      calcolaStatistiche(spese, numeroUtenti);
    }
  }, [spese, numeroUtenti]);

  // Calcolo statistiche gruppo
  const calcolaStatistiche = (spese, numUtenti) => {
    const totale = spese.reduce((acc, s) => acc + parseFloat(s.prezzo), 0);
    const target = totale / numUtenti;

    const mappaUtenteSpese = {};

    spese.forEach(s => {
      const uid = s.userId;
      if (!mappaUtenteSpese[uid]) {
        mappaUtenteSpese[uid] = {
          uid,
          username: s.user?.username || `ID ${uid}`,
          speso: 0
        };
      }
      mappaUtenteSpese[uid].speso += parseFloat(s.prezzo);
    });

    // Aggiungi l'utente corrente anche se non ha spese
    if (!mappaUtenteSpese[userIdCorrente]) {
      mappaUtenteSpese[userIdCorrente] = {
        uid: userIdCorrente,
        username: "(tu)",
        speso: 0
      };
    }

    const dettagli = Object.values(mappaUtenteSpese).map(u => ({
      ...u,
      differenza: u.speso - target
    }));

    setStatistiche({ totale, target, dettagli });
  };


  const datiUtente = statistiche?.dettagli.find(d => d.uid === userIdCorrente);

  return (
    <div className="text-white">
      <h2 className="text-2xl font-bold mb-4">Spese per Gruppo</h2>

      {!userIdCorrente ? (
        <p>Caricamento dati utente in corso...</p>
      ) : (
        <>
          <label className="block mb-2 text-gray-300">Seleziona un gruppo:</label>
          <select
            className="mb-6 p-2 rounded bg-gray-800 text-white"
            value={gruppoSelezionato?.id || ""}
            onChange={e => {
              const gruppo = gruppi.find(g => g.id === parseInt(e.target.value));
              setGruppoSelezionato(gruppo || null);
            }}
          >
            <option value="">-- Seleziona --</option>
            {gruppi.map(gr => (
              <option key={gr.id} value={gr.id}>{gr.nome}</option>
            ))}
          </select>

          {statistiche && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-700 p-4 rounded">
                Totale spese del gruppo: <b>{statistiche.totale.toFixed(2)} €</b>
              </div>
              <div className="bg-gray-700 p-4 rounded">
                Target per utente (su {numeroUtenti} utenti): <b>{statistiche.target.toFixed(2)} €</b>
              </div>
            </div>
          )}

          {statistiche && datiUtente && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-700 p-4 rounded">
                <b>Spese dell’utente:</b><br />
                {datiUtente.speso.toFixed(2)} €
              </div>
              <div className="bg-gray-700 p-4 rounded">
                <b>Totale spese gruppo:</b><br />
                {statistiche.totale.toFixed(2)} €
              </div>
              <div className="bg-gray-700 p-4 rounded">
                <b>Target medio:</b><br />
                {statistiche.target.toFixed(2)} €
              </div>
              <div className={`p-4 rounded ${datiUtente.differenza >= 0 ? "bg-green-700" : "bg-red-700"}`}>
                <b>Differenza:</b><br />
                {datiUtente.differenza.toFixed(2)} €
              </div>
            </div>
          )}

          {statistiche && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {statistiche.dettagli.map((u) => (
                <div
                  key={u.uid}
                  className={`p-4 rounded ${u.differenza >= 0 ? "bg-green-700" : "bg-red-700"} ${
                    u.uid === userIdCorrente ? "border-2 border-white" : ""
                  }`}
                >
                  <b>{u.username}{u.uid === userIdCorrente ? " (tu)" : ""}</b><br />
                  Speso: {u.speso.toFixed(2)} €<br />
                  Differenza: {u.differenza.toFixed(2)} €
                </div>
              ))}
            </div>
          )}

          {gruppoSelezionato && (
            <DataTable
              titolo={`Spese del gruppo "${gruppoSelezionato.nome}"`}
              endpoint={`/spese/spese-gruppo/${gruppoSelezionato.id}`}
              endpointBase="/spese"
              mappaRelazioni={{ user: "username", prodotto: "nome", negozio: "nome" }}
              dropdowns={{ prodotto: "/prodotti", negozio: "/negozi" }}
            />
          )}
        </>
      )}
    </div>
  );
}
