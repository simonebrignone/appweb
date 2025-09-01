const prisma = require("../lib/prisma");
const { buildReadableInclude } = require('../utils/prismaIncludeBuilder');

function calcolaProssimaData(current, frequenza) {
  const d = new Date(current);
  switch (frequenza) {
    case "giornaliero": d.setDate(d.getDate() + 1); break;
    case "settimanale": d.setDate(d.getDate() + 7); break;
    case "mensile": d.setMonth(d.getMonth() + 1); break;
    case "annuale": d.setFullYear(d.getFullYear() + 1); break;
    default: throw new Error("Frequenza non valida");
  }
  return d;
}

async function getMieSpese(req, res) {
  const userId = req.user.id;
  try {
    const spese = await prisma.spesa.findMany({
      where: { userId },
      include: buildReadableInclude("spesa")
    });
    res.json(spese);
  } catch (err) {
    console.error("Errore nel recupero delle spese:", err);
    res.status(500).json({ message: "Errore nel recupero deelle spese" });
  }
}


async function creaSpesa(req, res) {
  const userId = req.user.id;
  const { prodottoId, negozioId, gruppoId, prezzo, data, ricorrente, frequenza } = req.body;

  if (!prodottoId || !prezzo || isNaN(prezzo)) {
    return res.status(400).json({ message: "Prodotto e prezzo sono obbligatori" });
  }

  try {
    const spesa = await prisma.spesa.create({
      data: {
        userId,
        prodottoId: parseInt(prodottoId),
        negozioId: negozioId ? parseInt(negozioId) : null,
        gruppoId: gruppoId ? parseInt(gruppoId) : null,
        prezzo: parseFloat(prezzo),
        data: new Date(data)
      }
    });

    // 🔁 Aggiorna o crea StoricoPrezzi
    if (negozioId) {
      await prisma.storicoPrezzi.upsert({
        where: {
          prodottoId_negozioId_userId: {
            prodottoId: parseInt(prodottoId),
            negozioId: parseInt(negozioId),
            userId,
          },
        },
        update: {
          prezzo: parseFloat(prezzo),
          data: new Date(data),
        },
        create: {
          prodottoId: parseInt(prodottoId),
          negozioId: parseInt(negozioId),
          userId,
          prezzo: parseFloat(prezzo),
          data: new Date(data),
        },
      });
    }

    // ➕ Inserisce pagamento ricorrente se richiesto
    if (ricorrente && frequenza) {
      await prisma.pagamentoRicorrente.upsert({
        where: {
          userId_prodottoId_negozioId: {
            userId,
            prodottoId: parseInt(prodottoId),
            negozioId: negozioId ? parseInt(negozioId) : 0
          }
        },
        update: {
          dataUltimoPagamento: new Date(data),
          dataProssimoPagamento: calcolaProssimaData(data, frequenza),
          deltaFrequenza: frequenza
        },
        create: {
          userId,
          prodottoId: parseInt(prodottoId),
          negozioId: negozioId ? parseInt(negozioId) : null,
          prezzo: parseFloat(prezzo),
          dataUltimoPagamento: new Date(data),
          dataProssimoPagamento: calcolaProssimaData(data, frequenza),
          deltaFrequenza: frequenza
        }
      });
    }

    res.status(201).json(spesa);
  } catch (err) {
    console.error("❌ Errore durante la creazione della spesa:", err);
    res.status(500).json({ message: "Errore interno", error: err.message });
  }
}


async function updateSpesa(req, res) {
  const { id } = req.params;
  const { prodottoId, negozioId, gruppoId, prezzo, data } = req.body;
  const userId = req.user?.id;

  try {
    const spesa = await prisma.spesa.findUnique({ where: { id: parseInt(id) } });
    if (!spesa || spesa.userId !== userId) return res.status(404).json({ message: 'Spesa non trovata' });

    const aggiornata = await prisma.spesa.update({
      where: { id: parseInt(id) },
      data: {
        prodottoId,
        negozioId,
        gruppoId,
        prezzo,
        data: new Date(data),
      },
    });

    // 🔁 Aggiorna o crea storico prezzi
    if (negozioId) {
      await prisma.storicoPrezzi.upsert({
        where: {
          prodottoId_negozioId_userId: {
            prodottoId: parseInt(prodottoId),
            negozioId: parseInt(negozioId),
            userId,
          },
        },
        update: {
          prezzo: parseFloat(prezzo),
          data: new Date(data),
        },
        create: {
          prodottoId: parseInt(prodottoId),
          negozioId: parseInt(negozioId),
          userId,
          prezzo: parseFloat(prezzo),
          data: new Date(data),
        },
      });
    }

    res.json(aggiornata);
  } catch (err) {
    console.error('Errore updateSpesa:', err);
    res.status(500).json({ message: 'Errore aggiornamento spesa' });
  }
}


async function deleteSpesa(req, res) {
  const { id } = req.params;
  const userId = req.user?.id;

  try {
    const spesa = await prisma.spesa.findUnique({ where: { id: parseInt(id) } });
    if (!spesa || spesa.userId !== userId) return res.status(404).json({ message: 'Spesa non trovata' });

    await prisma.spesa.delete({ where: { id: parseInt(id) } });
    res.status(204).end();
  } catch (err) {
    console.error('Errore deleteSpesa:', err);
    res.status(500).json({ message: 'Errore eliminazione spesa' });
  }
}

async function getSpeseByGruppo(req, res) {
  const userId = req.user?.id;
  const gruppoId = parseInt(req.params.id);

  if (isNaN(gruppoId)) {
    return res.status(400).json({ message: "ID gruppo non valido" });
  }

  try {
    // ✅ Verifica se l'utente appartiene al gruppo (evita accessi non autorizzati)
    const associazione = await prisma.associazioneUtenteGruppoSpesa.findUnique({
      where: {
        userId_gruppoId: { userId, gruppoId }
      }
    });

    if (!associazione || !associazione.active) {
      return res.status(403).json({ message: "Accesso non autorizzato a questo gruppo" });
    }

    // ✅ Recupera tutte le spese di quel gruppo
    const spese = await prisma.spesa.findMany({
      where: { gruppoId },
      include: buildReadableInclude("spesa")
    });

    res.json(spese);
  } catch (err) {
    console.error("❌ Errore nel recupero delle spese del gruppo:", err);
    res.status(500).json({ message: "Errore interno" });
  }
}

async function getSpeseMieByGruppo(req, res) {
  const userId = req.user?.id;
  const gruppoId = parseInt(req.params.id);

  if (isNaN(gruppoId)) {
    return res.status(400).json({ message: "ID gruppo non valido" });
  }

  try {
    // ✅ Verifica se l'utente appartiene al gruppo
    const associazione = await prisma.associazioneUtenteGruppoSpesa.findUnique({
      where: {
        userId_gruppoId: { userId, gruppoId }
      }
    });

    if (!associazione || !associazione.active) {
      return res.status(403).json({ message: "Accesso non autorizzato a questo gruppo" });
    }

    // ✅ Recupera solo le spese dell'utente per il gruppo
    const speseUtente = await prisma.spesa.findMany({
      where: {
        gruppoId,
        userId
      },
      include: buildReadableInclude("spesa")
    });

    res.json(speseUtente);
  } catch (err) {
    console.error("❌ Errore nel recupero delle spese utente per il gruppo:", err);
    res.status(500).json({ message: "Errore interno" });
  }
}


module.exports = { creaSpesa, getMieSpese,getSpeseByGruppo,getSpeseMieByGruppo,updateSpesa, deleteSpesa };
