/*
  Warnings:

  - You are about to drop the `Spese` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Spese" DROP CONSTRAINT "Spese_gruppoId_fkey";

-- DropForeignKey
ALTER TABLE "Spese" DROP CONSTRAINT "Spese_negozioId_fkey";

-- DropForeignKey
ALTER TABLE "Spese" DROP CONSTRAINT "Spese_prodottoId_fkey";

-- DropForeignKey
ALTER TABLE "Spese" DROP CONSTRAINT "Spese_utenteId_fkey";

-- DropTable
DROP TABLE "Spese";

-- CreateTable
CREATE TABLE "Spesa" (
    "id" SERIAL NOT NULL,
    "utenteId" INTEGER NOT NULL,
    "prodottoId" INTEGER NOT NULL,
    "negozioId" INTEGER,
    "gruppoId" INTEGER,
    "prezzo" DECIMAL(10,2) NOT NULL,
    "data" DATE NOT NULL,

    CONSTRAINT "Spesa_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Spesa" ADD CONSTRAINT "Spesa_utenteId_fkey" FOREIGN KEY ("utenteId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Spesa" ADD CONSTRAINT "Spesa_prodottoId_fkey" FOREIGN KEY ("prodottoId") REFERENCES "Prodotto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Spesa" ADD CONSTRAINT "Spesa_negozioId_fkey" FOREIGN KEY ("negozioId") REFERENCES "Negozio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Spesa" ADD CONSTRAINT "Spesa_gruppoId_fkey" FOREIGN KEY ("gruppoId") REFERENCES "GruppoSpesa"("id") ON DELETE SET NULL ON UPDATE CASCADE;
