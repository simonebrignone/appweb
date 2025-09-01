const express = require("express");
const router = express.Router();

const {
  getMieiProdotti,
  creaProdotto,
  updateProdotto,
  deleteProdotto,
} = require("../controllers/prodotti");

const { authenticateToken } = require("../middlewares/authMiddleware");

// 📋 Prodotti dell’utente loggato
router.get("/miei", authenticateToken, getMieiProdotti);

// ➕ Crea un nuovo prodotto
router.post("/add", authenticateToken, creaProdotto);

// ✏️ Modifica un prodotto
router.put("/:id", authenticateToken, updateProdotto);

// 🗑 Elimina un prodotto
router.delete("/:id", authenticateToken, deleteProdotto);

module.exports = router;
