const prisma = require("../lib/prisma");
const { buildReadableInclude } = require('../utils/prismaIncludeBuilder');

async function getMieiProdotti(req, res) {
  try {
    const prodotti = await prisma.prodotto.findMany({
      where: { userId: req.user.id },
      orderBy: { nome: "asc" },
      include: buildReadableInclude("prodotto")
    });
    res.json(prodotti);
  } catch (err) {
    console.error("Errore nel recupero dei prodotti:", err);
    res.status(500).json({ message: "Errore nel recupero dei prodotti" });
  }
}
// ✅ CREA Prodotto
async function creaProdotto(req, res) {
  const { nome, descrizione, categoriaId, barcode } = req.body;
  const categoriaIdParsed = categoriaId ? parseInt(categoriaId) : null;

  if (!nome || !nome.trim()) {
    return res.status(400).json({ message: "Nome obbligatorio" });
  }

  try {
    const userId = req.user.id;

    // Verifica categoria
    if (categoriaIdParsed) {
      const categoria = await prisma.categoria.findFirst({
        where: { id: categoriaIdParsed, userId }
      });

      if (!categoria) {
        return res.status(400).json({ message: "Categoria non valida" });
      }
    }

    // Verifica duplicati
    const esistente = await prisma.prodotto.findFirst({
      where: { userId, nome: nome.trim() }
    });

    if (esistente) {
      return res.status(409).json({ message: "Prodotto già esistente con questo nome" });
    }

    // Crea prodotto
    const prodotto = await prisma.prodotto.create({
      data: {
        nome: nome.trim(),
        descrizione: descrizione?.trim() || null,
        userId,
        categoriaId: categoriaIdParsed
      }
    });

    // Barcode (uno o più)
    if (Array.isArray(barcode)) {
      for (const code of barcode) {
        if (typeof code === "string" && code.trim().length > 0) {
          await prisma.barcodeProdotto.create({
            data: {
              userId,
              prodottoId: prodotto.id,
              barcode: code.trim()
            }
          });
        }
      }
    } else if (typeof barcode === "string" && barcode.trim().length > 0) {
      await prisma.barcodeProdotto.create({
        data: {
          userId,
          prodottoId: prodotto.id,
          barcode: barcode.trim()
        }
      });
    }

    res.status(201).json({ message: "Prodotto creato con successo", prodottoId: prodotto.id });
  } catch (err) {
    console.error("Errore durante la creazione del prodotto:", err);
    res.status(500).json({ message: "Errore interno del server", error: err.message });
  }
}

async function updateProdotto(req, res) {
  const { id } = req.params;
  const { nome, descrizione, categoriaId, disabilitato } = req.body;
  const userId = req.user?.id; // assumendo che il middleware auth aggiunga req.user

  try {
    const prodotto = await prisma.prodotto.findUnique({
      where: { id: parseInt(id) },
    });

    if (!prodotto || prodotto.userId !== userId) {
      return res.status(404).json({ message: 'Prodotto non trovato o accesso negato' });
    }

    const prodottoAggiornato = await prisma.prodotto.update({
      where: { id: parseInt(id) },
      data: {
        nome,
        descrizione,
        disabilitato,
        categoriaId: categoriaId || null, // consente anche di rimuovere la categoria
      },
    });

    res.status(200).json(prodottoAggiornato);
  } catch (error) {
    console.error('Errore updateProdotto:', error);
    res.status(500).json({ message: 'Errore durante l\'aggiornamento del prodotto' });
  }
}

async function deleteProdotto(req, res) {
  const { id } = req.params;
  const userId = req.user?.id;

  try {
    const prodotto = await prisma.prodotto.findUnique({
      where: { id: parseInt(id) },
    });

    if (!prodotto) {
      return res.status(404).json({ message: 'Prodotto non trovato' });
    }

    if (prodotto.userId !== userId) {
      return res.status(403).json({ message: 'Accesso negato: non puoi eliminare questo prodotto' });
    }

    await prisma.prodotto.delete({
      where: { id: parseInt(id) },
    });

    res.status(204).end();
  } catch (error) {
    console.error('Errore deleteProdotto:', error);
    res.status(500).json({ message: 'Errore durante l\'eliminazione del prodotto', error: error.message });
  }
}

// ✅ Export tutte le funzioni
module.exports = {
  getMieiProdotti,
  creaProdotto,
  updateProdotto,
  deleteProdotto
};

