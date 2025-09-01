const express = require("express");
const router = express.Router();

const {
  creaPagamentoRicorrente,
  getMieiPagamenti,
  updatePagamentoRicorrente,
  deletePagamentoRicorrente,
} = require("../controllers/pagamenti");

const { authenticateToken } = require("../middlewares/authMiddleware");

// ➕ Aggiunta pagamento ricorrente
router.post('/add', authenticateToken, creaPagamentoRicorrente);

// 📋 Elenco pagamenti dell’utente
router.get('/miei', authenticateToken, getMieiPagamenti);

// ✏️ Modifica pagamento
router.put('/:id', authenticateToken, updatePagamentoRicorrente);

// 🗑 Elimina pagamento
router.delete('/:id', authenticateToken, deletePagamentoRicorrente);

module.exports = router;
