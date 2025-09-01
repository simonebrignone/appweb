const express = require("express");
const router = express.Router();

const {
  getMieiNegozi,
  creaNegozio,
  updateNegozio,
  deleteNegozio,
} = require("../controllers/negozi");

const { authenticateToken } = require("../middlewares/authMiddleware");

// 🔍 Elenco negozi dell’utente
router.get("/miei", authenticateToken, getMieiNegozi);

// ➕ Aggiunta nuovo negozio
router.post("/add", authenticateToken, creaNegozio);

// ✏️ Modifica negozio
router.put("/:id", authenticateToken, updateNegozio);

// 🗑 Elimina negozio
router.delete("/:id", authenticateToken, deleteNegozio);

module.exports = router;
