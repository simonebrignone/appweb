const express = require("express");
const router = express.Router();

const {
  getMieCategorie,
  creaCategoria,
  updateCategoria,
  deleteCategoria,
} = require("../controllers/categorie");

const { authenticateToken } = require("../middlewares/authMiddleware");

// Recupera categorie dell’utente
router.get("/miei", authenticateToken, getMieCategorie);

// Aggiunge nuova categoria
router.post("/add", authenticateToken, creaCategoria);

// 🔁 Modifica una categoria esistente
router.put("/:id", authenticateToken, updateCategoria);

// 🗑 Elimina una categoria esistente
router.delete("/:id", authenticateToken, deleteCategoria);

module.exports = router;