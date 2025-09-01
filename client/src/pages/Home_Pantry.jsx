import React from 'react';
import Header from "../components/Header";
import IfHasPermission from "../components/IfHasPermission";

export default function Home() {

  return (
    <>
      <Header />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white font-orbitron pt-40">
        <div className="text-center">
          <h1 className="text-4xl mb-4">Benvenuto nella SPB APP</h1>
          <p className="text-gray-400">Qui appariranno le tue funzionalità e i tuoi contenuti.</p>
          <IfHasPermission permission="expense_standard">
            <button className="btn">Aggiungi Spesa</button>
          </IfHasPermission>

          <IfHasPermission permission="pantry_standard">
            <div>Gestione dispensa visibile solo a chi ha pantry_standard</div>
          </IfHasPermission>
        </div>
      </div>
    </>
  );
}