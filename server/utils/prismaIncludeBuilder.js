/**
 * Costruisce dinamicamente gli include Prisma per i modelli
 * che hanno relazioni leggibili (es. nome, username, fullname)
 */
function buildReadableInclude(modelName) {
  const readableFields = ["nome", "username", "fullname"];
  
  const modelloRelazioni = {
    prodotto: ["categoria", "user"],
    spesa: ["prodotto", "negozio", "gruppo", "user"],
    categoria: ["user"],
    pagamentoRicorrente: ["prodotto", "negozio", "user"],
    barcodeProdotto: ["prodotto", "user"],
    negozio: ["user"],
    storicoPrezzi: ["prodotto", "negozio", "user"],
    gruppoSpesa: ["creatoDa"],
    associazioneUtenteGruppoSpesa: ["user", "gruppo"]
  };

  const include = {};
  const relazioni = modelloRelazioni[modelName] || [];

  for (const relazione of relazioni) {
    include[relazione] = { select: {} };

    // campo leggibile per ciascuna relazione nota
    if (relazione === "user") include[relazione].select.username = true;
    else if (relazione === "creatoDa") include[relazione].select.fullname = true;
    else include[relazione].select.nome = true;
  }

  return include;
}

module.exports = {
  buildReadableInclude
};
