const prisma = require("../lib/prisma");
const { addDays, addWeeks, addMonths, addYears } = require('date-fns');

function calcolaProssimaData(current, frequenza) {
  switch (frequenza) {
    case 'giornaliero': return addDays(current, 1);
    case 'settimanale': return addWeeks(current, 1);
    case 'mensile': return addMonths(current, 1);
    case 'annuale': return addYears(current, 1);
    default: throw new Error(`Frequenza non valida: ${frequenza}`);
  }
}

async function applicaPagamentiRicorrenti() {
  const oggi = new Date();

  const pagamenti = await prisma.pagamentoRicorrente.findMany({
    where: {
      dataProssimoPagamento: {
        lte: oggi
      }
    }
  });

  for (const pagamento of pagamenti) {
    try {
      await prisma.spesa.create({
        data: {
          idUtente: pagamento.idUser,
          idProdotto: pagamento.idProdotto,
          idNegozio: pagamento.idNegozio,
          prezzo: pagamento.prezzo,
          data: pagamento.dataProssimoPagamento,
        }
      });

      const nuovaProssima = calcolaProssimaData(pagamento.dataProssimoPagamento, pagamento.deltaFrequenza);

      await prisma.pagamentoRicorrente.update({
        where: { id: pagamento.id },
        data: {
          dataUltimoPagamento: pagamento.dataProssimoPagamento,
          dataProssimoPagamento: nuovaProssima
        }
      });

      console.log(`Pagamento ricorrente ${pagamento.id} processato.`);
    } catch (err) {
      console.error(`Errore nel pagamento ${pagamento.id}:`, err);
    }
  }
}

module.exports = { applicaPagamentiRicorrenti };
