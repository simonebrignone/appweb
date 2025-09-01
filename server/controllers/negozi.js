const prisma = require("../lib/prisma");
const { buildReadableInclude } = require('../utils/prismaIncludeBuilder');

// ✅ Recupera i negozi dell’utente
async function getMieiNegozi(req, res) {
  const userId = req.user.id;
  try {
    const negozi = await prisma.negozio.findMany({
      where: { userId },
      include: buildReadableInclude("negozio")
    });
    res.json(negozi);
  } catch (err) {
    console.error("Errore nel recupero dei negozi:", err);
    res.status(500).json({ message: "Errore nel recupero dei negozi" });
  }
}

// ✅ Aggiunge un nuovo negozio
async function creaNegozio(req, res) {
  const { nome, citta, via, numeroVia, descrizione, online } = req.body;
  const userId = req.user.id;

  if (!nome || !nome.trim()) {
    return res.status(400).json({ message: "Nome obbligatorio" });
  }

  try {
    // Controllo unicità simulato
    if (online) {
      const esisteOnline = await prisma.negozio.findFirst({
        where: { userId, nome: nome.trim(), online: true }
      });
      if (esisteOnline) {
        return res.status(409).json({ message: "Negozio online con questo nome già esistente" });
      }
    } else {
      const esisteFisico = await prisma.negozio.findFirst({
        where: {
          userId,
          nome: nome.trim(),
          citta,
          via,
          numeroVia,
          online: false
        }
      });
      if (esisteFisico) {
        return res.status(409).json({ message: "Negozio fisico già esistente con questi dati" });
      }
    }

    const negozio = await prisma.negozio.create({
      data: {
        nome: nome.trim(),
        citta,
        via,
        numeroVia,
        descrizione,
        online: !!online,
        userId
      }
    });

    res.status(201).json({ id: negozio.id });
  } catch (err) {
    console.error("Errore durante la creazione del negozio:", err);
    res.status(500).json({ message: "Errore interno" });
  }
}

// 📌 Placeholder per future funzioni
async function updateNegozio(req, res) {
  const { id } = req.params;
  const { nome, citta, via, numeroVia, descrizione, online } = req.body;
  const userId = req.user?.id;

  try {
    const negozio = await prisma.negozio.findUnique({ where: { id: parseInt(id) } });
    if (!negozio || negozio.userId !== userId) return res.status(404).json({ message: 'Negozio non trovato' });

    const aggiornato = await prisma.negozio.update({
      where: { id: parseInt(id) },
      data: { nome, citta, via, numeroVia, descrizione, online },
    });

    res.json(aggiornato);
  } catch (err) {
    console.error('Errore updateNegozio:', err);
    res.status(500).json({ message: 'Errore aggiornamento negozio' });
  }
}

async function deleteNegozio(req, res) {
  const { id } = req.params;
  const userId = req.user?.id;

  try {
    const negozio = await prisma.negozio.findUnique({ where: { id: parseInt(id) } });
    if (!negozio) return res.status(404).json({ message: 'Negozio non trovato' });
    if (negozio.userId !== userId) return res.status(403).json({ message: 'Accesso negato: non puoi eliminare questo negozio' });

    await prisma.negozio.delete({ where: { id: parseInt(id) } });
    res.status(204).end();
  } catch (err) {
    console.error('Errore deleteNegozio:', err);
    res.status(500).json({ message: 'Errore durante l\'eliminazione del negozio', error: err.message });
  }
}

// ✅ Esportazione
module.exports = {
  getMieiNegozi,
  creaNegozio,
  updateNegozio,
  deleteNegozio
};
