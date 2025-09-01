import React, { useState } from 'react';
import { FiLogOut, FiKey } from 'react-icons/fi';
import PasswordChangeModal from "./PasswordChangeModal";

export default function UserMenu({ user }) {
  const [showChangePassword, setShowChangePassword] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const handleChangePassword = () => {
    setShowChangePassword(true);
  };

  return (
    <div className="absolute top-10 right-0 w-48 bg-gray-900 border border-gray-700 rounded shadow-lg text-sm text-white z-50">
      <div className="p-3 border-b border-gray-700 text-center font-bold text-accent">
        @{user.username}
      </div>

      <button
        onClick={handleChangePassword}
        className="w-full text-left p-3 hover:bg-gray-800 flex items-center gap-2"
      >
        <FiKey /> Cambia Password
      </button>

      <button
        onClick={handleLogout}
        className="w-full text-left p-3 hover:bg-gray-800 flex items-center gap-2 text-red-400"
      >
        <FiLogOut /> Logout
      </button>

      {showChangePassword && (
        <PasswordChangeModal onClose={() => setShowChangePassword(false)} />
      )}
    </div>
  );
}
