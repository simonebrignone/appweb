import React, { useState, useEffect } from 'react';
import ServerStatus from './ServerStatus';
import UserMenu from './UserMenu';
import axios from '../api/axiosInstance';
import MessageModal from './MessageModal';
import { Bell } from "lucide-react";
import VoiceCommand from './VoiceCommand';
import AddExpenseModal from './AddExpenseModal';

export default function Header() {
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [hasMessages, setHasMessages] = useState(false);
  const [modalSpesaAperto, setModalSpesaAperto] = useState(false);
  const [valoriPrecompilati, setValoriPrecompilati] = useState(null);


  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      const username = localStorage.getItem("username");
      if (username) {
        setUser({ username });
      }
    }
  }, []);

  useEffect(() => {
    const checkMessages = async () => {
      try {
        const res = await axios.get("/gruppi-spesa/messaggi");
        setHasMessages(Array.isArray(res.data) && res.data.length > 0);
      } catch (err) {
        console.error("Errore controllo messaggi", err);
      }
    };

    checkMessages();
  }, []);

  const toggleUserMenu = () => setShowUserMenu(!showUserMenu);
  const toggleMessages = () => setShowMessages(!showMessages);

  const handleComandoVocale = (comando) => {
    if (comando.tipo === "spesa") {
        console.log("📦 Prepopola:", comando.dati);
      setValoriPrecompilati(comando.dati);
      setModalSpesaAperto(true);
    }
  };

  return (
    <header className="w-full bg-black bg-opacity-70 border-b border-gray-800 p-4 flex justify-between items-center fixed top-0 left-0 z-50">
      {/* Logo */}
      <div className="flex-1 text-center">
        <img src="/logo_spbapp.png" alt="Logo SPB" className="w-16 mx-auto" />
      </div>

      {/* Right side → Server status + Icons */}
      <div className="flex items-center space-x-6">
        <ServerStatus />
        {user && <VoiceCommand onComando={handleComandoVocale} />}

        {/* Messaggi */}
        {user && (
          <div className="relative">
            <img
              src="/bell_icon.png"
              alt="Messaggi"
              className="w-8 h-8 cursor-pointer hover:opacity-80"
              onClick={toggleMessages}
            />
            {hasMessages && (
              <span className="absolute top-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white bg-red-600"></span>
            )}
            {showMessages && <MessageModal onClose={() => setShowMessages(false)} />}
          </div>
        )}

        {/* User menu */}
        {user && (
          <div className="relative">
            <img
              src="/user_icon.png"
              alt="User"
              className="w-10 h-10 rounded-full border-4 border-accent shadow-lg cursor-pointer hover:opacity-80"
              onClick={toggleUserMenu}
            />
            {showUserMenu && <UserMenu user={user} />}
          </div>
        )}
      </div>

      {modalSpesaAperto && (
        <AddExpenseModal onClose={() => setModalSpesaAperto(false)} prepopola={valoriPrecompilati} />
      )}
    </header>
  );
}
