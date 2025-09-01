const prisma = require("../lib/prisma");
const { buildReadableInclude } = require('../utils/prismaIncludeBuilder');

async function getMieiPagamenti(req, res) {
  const userId = req.user.id;
  try {
    const spese = await prisma.pagamentoRicorrente.findMany({
      where: { userId },
      include: buildReadableInclude("pagamentoRicorrente")
    });
    res.json(spese);
  } catch (err) {
    console.error("Errore nel recupero delle spese:", err);
    res.status(500).json({ message: "Errore nel recupero deelle spese" });
  }
}

async function creaPagamentoRicorrente (req, res) {
  try {
    const {
      idUser,
      idProdotto,
      idNegozio,
      prezzo,
      dataProssimoPagamento,
      deltaFrequenza
    } = req.body;

    const nuovoPagamento = await prisma.pagamentoRicorrente.create({
      data: {
        idUser,
        idProdotto,
        idNegozio,
        prezzo,
        dataProssimoPagamento: new Date(dataProssimoPagamento),
        deltaFrequenza
      }
    });

    res.json(nuovoPagamento);
  } catch (err) {
    res.status(500).json({ error: 'Errore durante la creazione del pagamento ricorrente', details: err });
  }
};

async function updatePagamentoRicorrente(req, res) {
  const { id } = req.params;
  const { prezzo, dataUltimoPagamento, dataProssimoPagamento, deltaFrequenza } = req.body;
  const userId = req.user?.id;

  try {
    const pagamento = await prisma.pagamentoRicorrente.findUnique({ where: { id: parseInt(id) } });
    if (!pagamento || pagamento.userId !== userId) return res.status(404).json({ message: 'Pagamento non trovato' });

    const aggiornato = await prisma.pagamentoRicorrente.update({
      where: { id: parseInt(id) },
      data: {
        prezzo,
        dataUltimoPagamento: new Date(dataUltimoPagamento),
        dataProssimoPagamento: new Date(dataProssimoPagamento),
        deltaFrequenza,
      },
    });

    res.json(aggiornato);
  } catch (err) {
    console.error('Errore updatePagamentoRicorrente:', err);
    res.status(500).json({ message: 'Errore aggiornamento' });
  }
}

async function deletePagamentoRicorrente(req, res) {
  const { id } = req.params;
  const userId = req.user?.id;

  try {
    const pagamento = await prisma.pagamentoRicorrente.findUnique({ where: { id: parseInt(id) } });
    if (!pagamento || pagamento.userId !== userId) return res.status(404).json({ message: 'Pagamento non trovato' });

    await prisma.pagamentoRicorrente.delete({ where: { id: parseInt(id) } });
    res.status(204).end();
  } catch (err) {
    console.error('Errore deletePagamentoRicorrente:', err);
    res.status(500).json({ message: 'Errore eliminazione' });
  }
}


module.exports = { creaPagamentoRicorrente, getMieiPagamenti,updatePagamentoRicorrente, deletePagamentoRicorrente };
