const express = require("express");
const router = express.Router();
const {
  verificaUtente,
  suggerimentiUtenti,
  getUtente,
  updateUtente,
  deleteUtente
} = require("../controllers/utenti.js");

const { authenticateToken } = require("../middlewares/authMiddleware");

// Verifica se esiste un utente
router.get("/verifica", authenticateToken, verificaUtente);

// Suggerimenti autocomplete
router.get("/suggerimenti", authenticateToken, suggerimentiUtenti);

// Suggerimenti autocomplete
router.get("/myself", authenticateToken, getUtente);

// Placeholder route pronte:
// router.put("/:id", authenticateToken, updateUtente);
// router.delete("/:id", authenticateToken, deleteUtente);

module.exports = router;
