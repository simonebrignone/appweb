// backend/server.js

const express = require('express');
const app = express();
const PORT = 5000;
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/userRoutes');


// Middleware per abilitare il parsing del corpo JSON delle richieste
app.use(express.json());

// Endpoint di test
app.get('/api/ping', (req, res) => {
  res.json({ message: 'pong' });
});

app.use(cookieParser());

// Avvio del server
app.listen(PORT, () => {
  console.log(`✅ Backend avviato su http://localhost:${PORT}`);
});

app.use('/api', userRoutes);

