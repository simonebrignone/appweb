const express = require("express");
const router = express.Router();
const {
  getMieiGruppi,
  creaGruppoSpesa,
  aggiungiUtenteGruppo,
  attivaGruppo,
  getInvitiGruppi,
  confermaInvito,
  rifiutaInvito,
  getNumeroUtentiGruppo
} = require("../controllers/gruppiSpesa");

const { authenticateToken } = require("../middlewares/authMiddleware");

// Visualizzo i miei gruppi
router.get("/miei", authenticateToken, getMieiGruppi);

// Crea un gruppo spesa
router.post("/create", authenticateToken, creaGruppoSpesa);

// Aggiunge un utente
router.post("/add_user", authenticateToken, aggiungiUtenteGruppo);

// Attiva un gruppo
router.post("/attiva", authenticateToken, attivaGruppo);

// Mostra inviti (messaggi)
router.get("/messaggi", authenticateToken, getInvitiGruppi);

// Conferma invito
router.post("/conferma", authenticateToken, confermaInvito);

// Rifiuta invito
router.delete("/rifiuta", authenticateToken, rifiutaInvito);

router.get("/:gruppoId/utenti-count", authenticateToken, getNumeroUtentiGruppo);


module.exports = router;
