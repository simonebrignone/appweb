import React, { useState, useEffect } from 'react';

function ServerStatus() {
  const [online, setOnline] = useState(false);

  useEffect(() => {
    const checkServer = () => {
      fetch(import.meta.env.VITE_API_URL + "/api/ping")
        .then((res) => {
          if (res.ok) {
            setOnline(true);
          } else {
            setOnline(false);
          }
        })
        .catch(() => setOnline(false));
    };

    checkServer(); // Check subito
    const interval = setInterval(checkServer, 900000); // Check ogni 15 minuti

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute top-4 right-4 flex items-center space-x-2">
      <div className={`w-3 h-3 rounded-full ${online ? "bg-green-500" : "bg-red-500"}`} />
      <span className="text-white text-sm">Server</span>
    </div>
  );
}

export default ServerStatus;
