const express = require("express");
const router = express.Router();

const {
  creaSpesa,
  getMieSpese,
  getSpeseByGruppo,
  getSpeseMieByGruppo,
  updateSpesa,
  deleteSpesa,
} = require("../controllers/spese");

const { authenticateToken } = require("../middlewares/authMiddleware");

// ➕ Aggiungi una nuova spesa
router.post('/add', authenticateToken, creaSpesa);

// 📋 Ottieni tutte le spese dell’utente
router.get('/miei', authenticateToken, getMieSpese);

// 📋 Ottieni tutte le spese di un gruppo
router.get("/spese-gruppo/:id", authenticateToken, getSpeseByGruppo);
// Spese del singolo utente per quel gruppo
router.get("/spese-mie-gruppo/:id", authenticateToken, getSpeseMieByGruppo);


// ✏️ Modifica una spesa esistente
router.put('/:id', authenticateToken, updateSpesa);

// 🗑 Elimina una spesa
router.delete('/:id', authenticateToken, deleteSpesa);

module.exports = router;
