import React, { useState, useEffect } from 'react';
import { fetchWithTimeout } from '../utils/fetchWithTimeout';
import { useAuth } from '../contexts/AuthContext';
import PasswordChangeModal from "./PasswordChangeModal";

export default function AuthForm() {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [fullname, setFullname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [forcePasswordChangeMode, setForcePasswordChangeMode] = useState(false);
  const [passwordChangeToken, setPasswordChangeToken] = useState(null);

  const apiBaseUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const validateForm = () => {
    if (forgotPasswordMode) return email ? null : "Email obbligatoria.";
    if (!isLogin) {
      if (!email || !username || !fullname || !password || password !== confirmPassword)
        return "Compila tutti i campi correttamente.";
    }
    if (isLogin && (!email && !username || !password)) return "Email/Username e Password obbligatori.";
    return null;
  };

  const submitForcedPasswordChange = async (e) => {
    e.preventDefault();
  
    if (!password || !confirmPassword || password !== confirmPassword) {
      setError("Compila correttamente i campi.");
      return;
    }
  
    setLoading(true);
  
    try {
      const endpoint = `${apiBaseUrl}/api/auth/change-password-forced`;
  
      const { response, data } = await fetchWithTimeout(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: passwordChangeToken,
          newPassword: password,
          confirmPassword
        }),
        credentials: "include"
      }, 5000);
  
      if (!response.ok) {
        setError(data?.message || "Errore durante il cambio password.");
        return;
      }
  
      // Successo → login automatico
      await login(data.accessToken, data.user);
      if (user?.mustChangePassword) return; // rimani nel modale
      window.location.href = "/home";

    } catch (err) {
      setError(err.message || "Errore di rete.");
    } finally {
      setLoading(false);
    }
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    const endpoint = forgotPasswordMode
      ? `${apiBaseUrl}/api/auth/forgot-password`
      : isLogin
      ? `${apiBaseUrl}/api/auth/login`
      : `${apiBaseUrl}/api/auth/signup`;

    const body = forgotPasswordMode
      ? { email }
      : isLogin
      ? { emailOrUsername: email || username, password }
      : { email, username, fullname, password };

    try {
      const { response, data } = await fetchWithTimeout(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include"
      }, 5000);

      if (!response.ok) {

        if (data?.message === "FORCE_PASSWORD_CHANGE") {
          setForcePasswordChangeMode(true);
          setPasswordChangeToken(data?.passwordChangeToken);
          setError(data?.reason || "Cambio password richiesto");
          return;
        }
      
        setError(data?.message || "Errore durante l'operazione.");
        return;
      }

      if (forgotPasswordMode) {
        setSuccess("Email inviata!");
      } else if (isLogin) {
          await login(data.accessToken, data.user);
          if (user?.mustChangePassword) return; // rimani nel modale
          window.location.href = "/home";
        } else {
        setSuccess("Registrazione completata.");
        setTimeout(() => window.location.href = "/login", 1500);
      }
    } catch (err) {
      setError(err.message || "Errore di rete.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-primary bg-opacity-80 rounded-2xl shadow-2xl text-white font-orbitron border border-accent relative">
      {(error || success) && (
        <div className={`absolute top-0 left-0 right-0 mt-2 mx-auto p-2 rounded text-sm ${error ? "bg-red-700" : "bg-green-700"}`}>
          {error || success}
        </div>
      )}
  
      <h2 className="text-3xl font-bold mb-6 text-center text-accent">
        {forgotPasswordMode ? "Recupera Password" : isLogin ? "Accedi" : "Registrati"}
      </h2>
  
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {!forgotPasswordMode && (
          <>
            {!isLogin && (
              <>
                <input type="text" placeholder="Email" className="input-futuristic" value={email} onChange={e => setEmail(e.target.value)} />
                <input type="text" placeholder="Username" className="input-futuristic" value={username} onChange={e => setUsername(e.target.value)} />
                <input type="text" placeholder="Nome e Cognome" className="input-futuristic" value={fullname} onChange={e => setFullname(e.target.value)} />
              </>
            )}
            {isLogin && (
              <input type="text" placeholder="Email o Username" className="input-futuristic" value={email} onChange={e => setEmail(e.target.value)} />
            )}
            <input type="password" placeholder="Password" className="input-futuristic" value={password} onChange={e => setPassword(e.target.value)} />
            {!isLogin && (
              <input type="password" placeholder="Conferma Password" className="input-futuristic" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
            )}
          </>
        )}
  
        {forgotPasswordMode && (
          <input type="email" placeholder="Email" className="input-futuristic" value={email} onChange={e => setEmail(e.target.value)} />
        )}
  
        <button type="submit" disabled={loading} className="w-full py-3 bg-accent rounded disabled:opacity-50">
          {loading ? "Attendere..." : forgotPasswordMode ? "Invia reset" : isLogin ? "Login" : "Registrati"}
        </button>
      </form>
  
      {!loading && (
        <>
          {isLogin && !forgotPasswordMode && (
            <button onClick={() => setForgotPasswordMode(true)} className="block mt-6 text-accent hover:underline text-sm">
              Password dimenticata?
              </button>
          )}
          {forgotPasswordMode && (
            <button onClick={() => setForgotPasswordMode(false)} className="block mt-6 text-accent hover:underline text-sm">
              Torna al login
              </button>
          )}
          <button onClick={() => { setIsLogin(!isLogin); setForgotPasswordMode(false); }} className="block mt-2 text-accent hover:underline text-sm">
            {isLogin ? "Registrati" : "Accedi"}
          </button>
        </>
      )}
  
      {forcePasswordChangeMode && (
        <PasswordChangeModal
          forced={true}
          passwordChangeToken={passwordChangeToken}
          onClose={() => setForcePasswordChangeMode(false)}
          onSuccess={(accessToken, user) => {
            login(accessToken, user);
            window.location.href = "/home";
          }}
        />
      )}
    </div>
  );  
}
