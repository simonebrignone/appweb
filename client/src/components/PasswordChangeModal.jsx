import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function PasswordChangeModal({ forced = false, passwordChangeToken = null, onClose, onSuccess }) {
    const { token, login } = useAuth();
    const navigate = useNavigate();

    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");

    const apiBaseUrl = import.meta.env.VITE_API_URL;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");

        if ((!forced && !oldPassword) || !newPassword || !confirmPassword) {
            setMessage("Compila tutti i campi.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setMessage("Le password non coincidono.");
            return;
        }

        try {
            const endpoint = forced ? `${apiBaseUrl}/api/auth/change-password-forced` : `${apiBaseUrl}/api/auth/change-password`;

            const payload = forced
                ? { token: passwordChangeToken, newPassword, confirmPassword }
                : { oldPassword, newPassword, confirmPassword };

            const headers = forced ? {} : { Authorization: `Bearer ${token}` };

            const res = await axios.post(endpoint, payload, { headers, withCredentials: true });

            setMessage("Password cambiata con successo!");

            // LOGIN SUBITO → importantissimo
            await login(res.data.accessToken, res.data.user);

            // Dopo un pochino → naviga
            setTimeout(() => {
                if (onSuccess) onSuccess();
                onClose();
                navigate("/home", { replace: true });
            }, 1500);

        } catch (err) {
            const errorMessage = err.response?.data?.message || "Errore durante il cambio password.";
            setMessage(errorMessage);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
            <form onSubmit={handleSubmit} className="bg-gray-900 p-6 rounded-lg space-y-4 w-80 text-white">
                <h2 className="text-xl font-bold">{forced ? "Cambio Password Obbligatorio" : "Cambia Password"}</h2>

                {message && <p className="text-center text-sm">{message}</p>}

                {!forced && (
                    <input
                        type="password"
                        placeholder="Vecchia Password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className="input-futuristic"
                    />
                )}
                <input
                    type="password"
                    placeholder="Nuova Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input-futuristic"
                />
                <input
                    type="password"
                    placeholder="Conferma Nuova Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-futuristic"
                />

                <button type="submit" className="w-full py-2 bg-accent rounded hover:bg-blue-400">
                    Conferma
                </button>
                {!forced && (
                    <button type="button" onClick={onClose} className="w-full py-2 mt-2 bg-gray-700 rounded">
                        Annulla
                    </button>
                )}
            </form>
        </div>
    );
}
