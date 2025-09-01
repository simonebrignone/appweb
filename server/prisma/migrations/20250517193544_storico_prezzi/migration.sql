/*
  Warnings:

  - You are about to drop the column `utenteId` on the `AssociazioneUtenteGruppoSpesa` table. All the data in the column will be lost.
  - You are about to drop the column `utenteId` on the `Pagamenti_Ricorrenti` table. All the data in the column will be lost.
  - You are about to drop the column `utenteId` on the `Spesa` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,gruppoId]` on the table `AssociazioneUtenteGruppoSpesa` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,prodottoId,negozioId]` on the table `Pagamenti_Ricorrenti` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[prodottoId,negozioId,userId]` on the table `StoricoPrezzi` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `AssociazioneUtenteGruppoSpesa` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Pagamenti_Ricorrenti` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Spesa` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "AssociazioneUtenteGruppoSpesa" DROP CONSTRAINT "AssociazioneUtenteGruppoSpesa_gruppoId_fkey";

-- DropForeignKey
ALTER TABLE "AssociazioneUtenteGruppoSpesa" DROP CONSTRAINT "AssociazioneUtenteGruppoSpesa_utenteId_fkey";

-- DropForeignKey
ALTER TABLE "BarcodeProdotto" DROP CONSTRAINT "BarcodeProdotto_prodottoId_fkey";

-- DropForeignKey
ALTER TABLE "BarcodeProdotto" DROP CONSTRAINT "BarcodeProdotto_userId_fkey";

-- DropForeignKey
ALTER TABLE "Categoria" DROP CONSTRAINT "Categoria_userId_fkey";

-- DropForeignKey
ALTER TABLE "GruppoSpesa" DROP CONSTRAINT "GruppoSpesa_creatoDaId_fkey";

-- DropForeignKey
ALTER TABLE "Negozio" DROP CONSTRAINT "Negozio_userId_fkey";

-- DropForeignKey
ALTER TABLE "Pagamenti_Ricorrenti" DROP CONSTRAINT "Pagamenti_Ricorrenti_prodottoId_fkey";

-- DropForeignKey
ALTER TABLE "Pagamenti_Ricorrenti" DROP CONSTRAINT "Pagamenti_Ricorrenti_utenteId_fkey";

-- DropForeignKey
ALTER TABLE "Prodotto" DROP CONSTRAINT "Prodotto_userId_fkey";

-- DropForeignKey
ALTER TABLE "Spesa" DROP CONSTRAINT "Spesa_prodottoId_fkey";

-- DropForeignKey
ALTER TABLE "Spesa" DROP CONSTRAINT "Spesa_utenteId_fkey";

-- DropIndex
DROP INDEX "AssociazioneUtenteGruppoSpesa_utenteId_gruppoId_key";

-- DropIndex
DROP INDEX "Pagamenti_Ricorrenti_utenteId_prodottoId_negozioId_key";

-- AlterTable
ALTER TABLE "AssociazioneUtenteGruppoSpesa" DROP COLUMN "utenteId",
ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Pagamenti_Ricorrenti" DROP COLUMN "utenteId",
ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Spesa" DROP COLUMN "utenteId",
ADD COLUMN     "userId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "AssociazioneUtenteGruppoSpesa_userId_gruppoId_key" ON "AssociazioneUtenteGruppoSpesa"("userId", "gruppoId");

-- CreateIndex
CREATE UNIQUE INDEX "Pagamenti_Ricorrenti_userId_prodottoId_negozioId_key" ON "Pagamenti_Ricorrenti"("userId", "prodottoId", "negozioId");

-- CreateIndex
CREATE UNIQUE INDEX "StoricoPrezzi_prodottoId_negozioId_userId_key" ON "StoricoPrezzi"("prodottoId", "negozioId", "userId");

-- AddForeignKey
ALTER TABLE "Prodotto" ADD CONSTRAINT "Prodotto_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BarcodeProdotto" ADD CONSTRAINT "BarcodeProdotto_prodottoId_fkey" FOREIGN KEY ("prodottoId") REFERENCES "Prodotto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BarcodeProdotto" ADD CONSTRAINT "BarcodeProdotto_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Categoria" ADD CONSTRAINT "Categoria_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Negozio" ADD CONSTRAINT "Negozio_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GruppoSpesa" ADD CONSTRAINT "GruppoSpesa_creatoDaId_fkey" FOREIGN KEY ("creatoDaId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssociazioneUtenteGruppoSpesa" ADD CONSTRAINT "AssociazioneUtenteGruppoSpesa_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssociazioneUtenteGruppoSpesa" ADD CONSTRAINT "AssociazioneUtenteGruppoSpesa_gruppoId_fkey" FOREIGN KEY ("gruppoId") REFERENCES "GruppoSpesa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Spesa" ADD CONSTRAINT "Spesa_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Spesa" ADD CONSTRAINT "Spesa_prodottoId_fkey" FOREIGN KEY ("prodottoId") REFERENCES "Prodotto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pagamenti_Ricorrenti" ADD CONSTRAINT "Pagamenti_Ricorrenti_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pagamenti_Ricorrenti" ADD CONSTRAINT "Pagamenti_Ricorrenti_prodottoId_fkey" FOREIGN KEY ("prodottoId") REFERENCES "Prodotto"("id") ON DELETE SET NULL ON UPDATE CASCADE;
