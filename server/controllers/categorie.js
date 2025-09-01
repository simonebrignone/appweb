const prisma = require("../lib/prisma");
const { buildReadableInclude } = require('../utils/prismaIncludeBuilder');

// ✅ Recupera categorie dell'utente
async function getMieCategorie(req, res) {
  try {
    const categorie = await prisma.categoria.findMany({
      where: { userId: req.user.id },
      orderBy: { nome: "asc" },
      include: buildReadableInclude("categoria")
    });
    res.json(categorie);
  } catch (err) {
    console.error("Errore nel recupero delle categorie:", err);
    res.status(500).json({ message: "Errore nel recupero delle categorie" });
  }
}

// ✅ Crea nuova categoria
async function creaCategoria(req, res) {
  const { nome, descrizione, macroGruppo, entrata } = req.body;

  if (!nome || !nome.trim()) {
    return res.status(400).json({ message: "Il nome della categoria è obbligatorio" });
  }

  try {
    const userId = req.user.id;

    const esiste = await prisma.categoria.findFirst({
      where: { userId, nome: nome.trim() }
    });

    if (esiste) {
      return res.status(409).json({ message: "Categoria già esistente con questo nome" });
    }

    const categoria = await prisma.categoria.create({
      data: {
        userId,
        nome: nome.trim(),
        descrizione: descrizione?.trim() || null,
        macroGruppo: macroGruppo?.trim() || null,
        entrata: entrata === true
      }
    });

    res.status(201).json({ message: "Categoria creata con successo", categoriaId: categoria.id });
  } catch (err) {
    console.error("Errore durante la creazione della categoria:", err);
    res.status(500).json({ message: "Errore interno del server", error: err.message });
  }
}

async function updateCategoria(req, res) {
  const { id } = req.params;
  const { nome, descrizione, macroGruppo, entrata } = req.body;
  const userId = req.user?.id;

  try {
    const categoria = await prisma.categoria.findUnique({ where: { id: parseInt(id) } });
    if (!categoria || categoria.userId !== userId) {
      return res.status(404).json({ message: 'Categoria non trovata o accesso negato' });
    }

    const aggiornata = await prisma.categoria.update({
      where: { id: parseInt(id) },
      data: { nome, descrizione, macroGruppo, entrata },
    });

    res.status(200).json(aggiornata);
  } catch (err) {
    console.error('Errore updateCategoria:', err);
    res.status(500).json({ message: 'Errore aggiornamento categoria' });
  }
}


async function deleteCategoria(req, res) {
  const { id } = req.params;
  const userId = req.user?.id;

  try {
    const categoria = await prisma.categoria.findUnique({
      where: { id: parseInt(id) }
    });

    if (!categoria) {
      return res.status(404).json({ message: 'Categoria non trovata' });
    }

    if (categoria.userId !== userId) {
      return res.status(403).json({ message: 'Accesso negato: non puoi eliminare questa categoria' });
    }

    await prisma.categoria.delete({ where: { id: parseInt(id) } });
    res.status(204).end();
  } catch (err) {
    console.error('Errore deleteCategoria:', err);
    res.status(500).json({ message: 'Errore durante l\'eliminazione della categoria', error: err.message });
  }
}

module.exports = {
  getMieCategorie,
  creaCategoria,
  updateCategoria,
  deleteCategoria
};
