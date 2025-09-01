const prisma = require("../lib/prisma");

// ✅ Verifica esistenza utente tramite email o username
async function verificaUtente(req, res) {
  const { identificatore } = req.query;

  if (!identificatore || !identificatore.trim()) {
    return res.status(400).json({ message: "Identificatore mancante" });
  }

  try {
    const utente = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identificatore.trim() },
          { username: identificatore.trim() }
        ]
      },
      select: { id: true }
    });

    if (utente) {
      return res.json({ valido: true, userId: utente.id });
    } else {
      return res.json({ valido: false });
    }
  } catch (err) {
    console.error("Errore verifica utente:", err);
    res.status(500).json({ message: "Errore interno" });
  }
}

// ✅ Suggerimenti (autocomplete) utenti per nome o email
async function suggerimentiUtenti(req, res) {
  const { query } = req.query;

  if (!query || query.trim().length < 2) {
    return res.status(400).json({ message: "Query troppo corta" });
  }

  try {
    const utenti = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: query, mode: "insensitive" } },
          { username: { contains: query, mode: "insensitive" } }
        ]
      },
      select: {
        id: true,
        email: true,
        username: true
      },
      take: 10
    });

    res.json(utenti);
  } catch (err) {
    console.error("Errore durante l'autocomplete utenti:", err);
    res.status(500).json({ message: "Errore interno" });
  }
}

// 📌 Placeholder per future funzionalità
async function getUtente(req, res) {
  res.json({ id: req.user.id, username: req.user.username });
}

async function updateUtente(req, res) {
  res.status(501).json({ message: "Funzione non ancora implementata" });
}

async function deleteUtente(req, res) {
  res.status(501).json({ message: "Funzione non ancora implementata" });
}

module.exports = {
  verificaUtente,
  suggerimentiUtenti,
  getUtente,
  updateUtente,
  deleteUtente
};
