import React from 'react';
import Header from "../components/Header";
import IfHasPermission from "../components/IfHasPermission";
import { ShoppingCart, Utensils } from "lucide-react";

export default function Home() {

  const Block = ({ title, icon, link }) => (
    <a
      href={link}
      className="group relative bg-gradient-to-br from-gray-800 to-gray-900 hover:from-accent hover:to-accent/70 text-white rounded-2xl p-10 flex flex-col items-center justify-center transition duration-300 shadow-xl hover:scale-105"
    >
      <div className="mb-4">{icon}</div>
      <h2 className="text-2xl font-semibold group-hover:underline">{title}</h2>
    </a>
  );

  return (
    <>
      <Header />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white font-orbitron pt-40">
        <div className="text-center w-full max-w-4xl px-6">
          <h1 className="text-4xl mb-8">Benvenuto nella SPB APP</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            <IfHasPermission permission="expense_standard">
              <Block
                title="Gestione Spesa"
                icon={<ShoppingCart size={48} className="text-accent" />}
                link="/spese"
              />
            </IfHasPermission>

            <IfHasPermission permission="pantry_standard">
              <Block
                title="Gestione Dispensa"
                icon={<Utensils size={48} className="text-accent" />}
                link="/dispensa"
              />
            </IfHasPermission>

          </div>

        </div>
      </div>
    </>
  );
}

