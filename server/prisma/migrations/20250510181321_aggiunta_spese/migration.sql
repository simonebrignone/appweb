-- CreateEnum
CREATE TYPE "Frequenza" AS ENUM ('giornaliero', 'settimanale', 'mensile', 'annuale');

-- CreateTable
CREATE TABLE "Spese" (
    "id" SERIAL NOT NULL,
    "utenteId" INTEGER NOT NULL,
    "prodottoId" INTEGER NOT NULL,
    "negozioId" INTEGER NOT NULL,
    "prezzo" DECIMAL(10,2) NOT NULL,
    "data" DATE NOT NULL,
    "gruppoId" INTEGER NOT NULL,

    CONSTRAINT "Spese_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pagamenti_Ricorrenti" (
    "id" SERIAL NOT NULL,
    "utenteId" INTEGER NOT NULL,
    "prodottoId" INTEGER NOT NULL,
    "negozioId" INTEGER NOT NULL,
    "prezzo" DECIMAL(10,2) NOT NULL,
    "dataUltimoPagamento" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataProssimoPagamento" DATE NOT NULL,
    "deltaFrequenza" "Frequenza" NOT NULL,

    CONSTRAINT "Pagamenti_Ricorrenti_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Pagamenti_Ricorrenti_utenteId_prodottoId_negozioId_key" ON "Pagamenti_Ricorrenti"("utenteId", "prodottoId", "negozioId");

-- AddForeignKey
ALTER TABLE "Spese" ADD CONSTRAINT "Spese_utenteId_fkey" FOREIGN KEY ("utenteId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Spese" ADD CONSTRAINT "Spese_negozioId_fkey" FOREIGN KEY ("negozioId") REFERENCES "Negozio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Spese" ADD CONSTRAINT "Spese_prodottoId_fkey" FOREIGN KEY ("prodottoId") REFERENCES "Prodotto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Spese" ADD CONSTRAINT "Spese_gruppoId_fkey" FOREIGN KEY ("gruppoId") REFERENCES "GruppoSpesa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pagamenti_Ricorrenti" ADD CONSTRAINT "Pagamenti_Ricorrenti_utenteId_fkey" FOREIGN KEY ("utenteId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pagamenti_Ricorrenti" ADD CONSTRAINT "Pagamenti_Ricorrenti_negozioId_fkey" FOREIGN KEY ("negozioId") REFERENCES "Negozio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pagamenti_Ricorrenti" ADD CONSTRAINT "Pagamenti_Ricorrenti_prodottoId_fkey" FOREIGN KEY ("prodottoId") REFERENCES "Prodotto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
