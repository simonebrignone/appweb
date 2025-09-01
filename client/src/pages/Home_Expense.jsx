import React, { useState } from "react";
import Header from "../components/Header";
import IfHasPermission from "../components/IfHasPermission";
import { PlusCircle, Package, Tag, Store, Users, List } from "lucide-react";
import AddProductModal from "../components/AddProductModal";
import AddCategoryModal from "../components/AddCategoryModal";
import AddStoreModal from "../components/AddStoreModal";
import AddExpenseGroupModal from "../components/AddExpenseGroupModal";
import AddExpenseModal from "../components/AddExpenseModal";
import SpeseGruppoView from "../components/SpeseGruppoView";




export default function SpesaDashboard() {
  const [activeModal, setActiveModal] = useState(null);

  const actions = [
    { title: "Aggiungi Spesa", icon: <PlusCircle size={48} />, modal: "spesa" },
    { title: "Aggiungi Prodotto", icon: <Package size={48} />, modal: "prodotto" },
    { title: "Aggiungi Categoria", icon: <Tag size={48} />, modal: "categoria" },
    { title: "Aggiungi Negozio", icon: <Store size={48} />, modal: "negozio" },
    { title: "Aggiungi Gruppo Spesa", icon: <Users size={48} />, modal: "gruppo" },
    { title: "Visualizza Spese", icon: <List size={48} />, link: "/spese/dashboard" },
    { title: "Spese Gruppi", icon: <Users size={48} />, modal: "speseGruppi" },
  ];

  const handleAction = (action) => {
    if (action.modal) {
      setActiveModal(action.modal);
    } else if (action.link) {
      window.location.href = action.link;
    }
  };

  return (
    <>
      <Header />
      <div className="p-6 min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white">
        <h1 className="text-3xl font-bold mb-8">Gestione Spesa</h1>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {actions.map((action) => (
            <IfHasPermission key={action.title} permission="expense_standard">
              <button
                onClick={() => handleAction(action)}
                className="group bg-gray-800 hover:bg-accent text-white rounded-2xl p-8 flex flex-col items-center justify-center transition duration-300 shadow-xl hover:scale-105"
              >
                <div className="mb-4 text-accent">{action.icon}</div>
                <h2 className="text-xl font-semibold group-hover:underline">{action.title}</h2>
              </button>
            </IfHasPermission>
          ))}
        </div>

        {/* Modali */}
        {activeModal === "prodotto" && (
          <AddProductModal onClose={() => setActiveModal(null)} />
        )}
        {activeModal === "categoria" && (
          <AddCategoryModal  onClose={() => setActiveModal(null)} />
        )}
        {activeModal === "negozio" && (
          <AddStoreModal  onClose={() => setActiveModal(null)} />
        )}
        {activeModal === "gruppo" && (
          <AddExpenseGroupModal  onClose={() => setActiveModal(null)} />
        )}
        {activeModal === "spesa" && (
          <AddExpenseModal  onClose={() => setActiveModal(null)} />
        )}
        {activeModal === "speseGruppi" && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 overflow-y-auto">
            <div className="bg-gray-900 rounded-lg p-6 max-w-6xl w-full">
              <SpeseGruppoView />
              <div className="flex justify-end mt-4">
                <button onClick={() => setActiveModal(null)} className="bg-red-600 px-4 py-2 rounded">
                  Chiudi
                </button>
              </div>
            </div>
          </div>
        )}
        {activeModal && activeModal !== "prodotto" && activeModal !== "categoria" && activeModal !== "negozio" && activeModal !== "gruppo" && activeModal !== "spesa" && activeModal !== "speseGruppi" && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-900 rounded-lg p-6 w-96">
              <h3 className="text-xl mb-4">Modal: {activeModal}</h3>
              <p>Qui puoi implementare il form per {activeModal}.</p>
              <button onClick={() => setActiveModal(null)} className="mt-4 bg-accent px-4 py-2 rounded">
                Chiudi
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
