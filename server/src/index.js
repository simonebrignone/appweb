require('dotenv').config();
if (typeof crypto === 'undefined') {
  global.crypto = require('crypto').webcrypto;
}

const express = require('express');
const cors = require('cors');

const pino = require('pino');
const pinoHttp = require('pino-http');
const fs = require('fs');
const cookieParser = require('cookie-parser');


// File log (es. logs/app.log)
const logFolder = './logs';

if (!fs.existsSync(logFolder)) {
  fs.mkdirSync(logFolder, { recursive: true });
}

const logStream = fs.createWriteStream(`${logFolder}/app.log`, { flags: 'a' });
const logger = pino({}, logStream);

// Job automatico pagamenti ricorrenti
const cron = require('node-cron');
const { applicaPagamentiRicorrenti } = require('../utils/pagamentiRicorrenti');

/*
Spiegazione tempistiche cron:
  0: minuto (00)

  2: ora (02:00 di notte)

  * * *: ogni giorno, ogni mese, ogni giorno della settimana
*/

cron.schedule('0 2 * * *', async () => {
  logger.info('⏱️ Avvio processo di pagamenti ricorrenti...');

  try {
    await applicaPagamentiRicorrenti();
    logger.info('✅ Pagamenti ricorrenti completati con successo.');
  } catch (err) {
    logger.error({ err }, '❌ Errore nei pagamenti ricorrenti');
  }
});

const app = express(); // DEVE ESSERE PRIMA di usare app!
const allowedOrigins = [
  'http://localhost:5173',
  'http://192.168.1.61:5173',
  'https://192.168.1.61',
  'https://spbapp.click'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Log automatico di tutte le richieste
app.use(pinoHttp({ logger }));

app.use(express.json());


app.use(express.json());
app.use(cookieParser());



// Endpoint di test
app.get('/api/ping', (req, res) => {
  res.json({ message: 'pong' });
});

if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Backend avviato su http://0.0.0.0:${PORT}`);
  });
}
// Utenti
app.use('/api/auth', require("../routes/authRoutes"));

// Applicazione Spese
// Prodotti
app.use("/api/prodotti", require("../routes/prodottiRoutes"));

// Categorie
app.use("/api/categorie", require("../routes/categorieRoutes"));

// Negozi
app.use("/api/negozi", require("../routes/negoziRoutes"));

// Gruppi Spesa
app.use("/api/gruppi-spesa", require("../routes/gruppiSpesaRoutes"));

// Spese
app.use("/api/spese", require("../routes/speseRoutes"));

// Pagamenti
app.use("/api/pagamenti-ricorrenti", require("../routes/pagamentiRoutes"));


// Utenti general
app.use("/api/utenti", require("../routes/utentiRoutes"));


module.exports = app;

