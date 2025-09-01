const prisma = require("../lib/prisma");
const { buildReadableInclude } = require('../utils/prismaIncludeBuilder');

// ✅ Recupera i gruppi a cui l'utente partecipa attivamente
async function getMieiGruppi(req, res) {
  const userId = req.user.id;

  try {
    const gruppi = await prisma.associazioneUtenteGruppoSpesa.findMany({
      where: {
        userId: userId,
        active: true
      },
      include: {
        gruppo: {
          select: {
            id: true,
            nome: true,
            descrizione: true
          }
        }
      }
       // include: buildReadableInclude("associazioneUtenteGruppoSpesa")
    });

    const risultato = gruppi.map(g => g.gruppo);

    res.json(risultato);
  } catch (err) {
    console.error("Errore recupero gruppi dell'utente:", err);
    res.status(500).json({ message: "Errore interno" });
  }
}

// ✅ Crea un nuovo gruppo spesa
async function creaGruppoSpesa(req, res) {
  const { nome, descrizione } = req.body;
  const userId = req.user.id;

  if (!nome || !nome.trim()) {
    return res.status(400).json({ message: "Nome gruppo obbligatorio" });
  }

  try {
    const esiste = await prisma.gruppoSpesa.findFirst({
      where: { nome: nome.trim(), creatoDaId: userId }
    });

    if (esiste) {
      return res.status(409).json({ message: "Hai già un gruppo con questo nome" });
    }

    const gruppo = await prisma.gruppoSpesa.create({
      data: {
        nome: nome.trim(),
        descrizione: descrizione?.trim() || null,
        creatoDaId: userId,
        membri: {
          create: {
            userId: userId,
            active: true,
            admin: true
          }
        }
      }
    });

    res.status(201).json({ message: "Gruppo creato con successo", gruppoId: gruppo.id });
  } catch (err) {
    console.error("Errore creazione gruppo:", err);
    res.status(500).json({ message: "Errore interno" });
  }
}

// ✅ Aggiunge un utente a un gruppo
async function aggiungiUtenteGruppo(req, res) {
  const { gruppoId, userId, admin } = req.body;
  const richiedenteId = req.user.id;

  if (!gruppoId || !userId) {
    return res.status(400).json({ message: "ID gruppo e ID utente obbligatori" });
  }

  try {
    const gruppo = await prisma.gruppoSpesa.findUnique({ where: { id: gruppoId } });
    if (!gruppo || gruppo.creatoDaId !== richiedenteId) {
      return res.status(403).json({ message: "Non sei autorizzato ad aggiungere utenti a questo gruppo" });
    }

    await prisma.associazioneUtenteGruppoSpesa.upsert({
      where: {
        userId_gruppoId: {
          userId,
          gruppoId
        }
      },
      update: { admin: admin === true },
      create: {
        userId,
        gruppoId,
        admin: admin === true
      }
    });

    res.status(200).json({ message: "Utente aggiunto al gruppo" });
  } catch (err) {
    console.error("Errore aggiunta utente al gruppo:", err);
    res.status(500).json({ message: "Errore interno" });
  }
}

// ✅ Attiva gruppo per utente autenticato
async function attivaGruppo(req, res) {
  const { gruppoId } = req.body;
  const userId = req.user.id;

  if (!gruppoId) {
    return res.status(400).json({ message: "ID gruppo obbligatorio" });
  }

  try {
    const associazione = await prisma.associazioneUtenteGruppoSpesa.findUnique({
      where: {
        userId_gruppoId: {
          userId: userId,
          gruppoId
        }
      }
    });

    if (!associazione) {
      return res.status(404).json({ message: "Non appartieni a questo gruppo" });
    }

    await prisma.associazioneUtenteGruppoSpesa.update({
      where: {
        userId_gruppoId: {
          userId: userId,
          gruppoId
        }
      },
      data: { active: true }
    });

    res.status(200).json({ message: "Gruppo attivato con successo" });
  } catch (err) {
    console.error("Errore attivazione gruppo:", err);
    res.status(500).json({ message: "Errore interno" });
  }
}

// ✅ Recupera inviti (messaggi) per gruppi da attivare
async function getInvitiGruppi(req, res) {
  const userId = req.user.id;

  try {
    const inviti = await prisma.associazioneUtenteGruppoSpesa.findMany({
      where: {
        userId: userId,
        active: false
      },
      include: {
        gruppo: {
          select: {
            id: true,
            nome: true,
            creatoDa: {
              select: {
                username: true,
                email: true
              }
            }
          }
        }
      }
    });

    res.json(inviti);
  } catch (err) {
    console.error("Errore recupero messaggi gruppo:", err);
    res.status(500).json({ message: "Errore interno" });
  }
}

// ✅ Conferma invito
async function confermaInvito(req, res) {
  const { gruppoId } = req.body;
  const userId = req.user.id;

  try {
    await prisma.associazioneUtenteGruppoSpesa.update({
      where: {
        userId_gruppoId: {
          userId: userId,
          gruppoId
        }
      },
      data: { active: true }
    });

    res.json({ message: "Invito confermato" });
  } catch (err) {
    console.error("Errore conferma invito:", err);
    res.status(500).json({ message: "Errore interno" });
  }
}

// ✅ Rifiuta invito
async function rifiutaInvito(req, res) {
  const { gruppoId } = req.body;
  const userId = req.user.id;

  try {
    await prisma.associazioneUtenteGruppoSpesa.delete({
      where: {
        userId_gruppoId: {
          userId: userId,
          gruppoId
        }
      }
    });

    res.json({ message: "Invito rifiutato" });
  } catch (err) {
    console.error("Errore rifiuto invito:", err);
    res.status(500).json({ message: "Errore interno" });
  }
}


// ✅ Restituisce il numero di utenti attivi associati a un gruppo
async function getNumeroUtentiGruppo(req, res) {
  const gruppoId = parseInt(req.params.gruppoId);

  if (!gruppoId) {
    return res.status(400).json({ message: "ID gruppo obbligatorio" });
  }

  try {
    const count = await prisma.associazioneUtenteGruppoSpesa.count({
      where: {
        gruppoId: gruppoId,
        active: true
      }
    });

    res.json({ gruppoId, numeroUtenti: count });
  } catch (err) {
    console.error("Errore nel conteggio utenti del gruppo:", err);
    res.status(500).json({ message: "Errore interno" });
  }
}

// Export controller
module.exports = {
  getMieiGruppi,
  creaGruppoSpesa,
  aggiungiUtenteGruppo,
  attivaGruppo,
  getInvitiGruppi,
  confermaInvito,
  rifiutaInvito,
  getNumeroUtentiGruppo 
};
