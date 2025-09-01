-- DropForeignKey
ALTER TABLE "Pagamenti_Ricorrenti" DROP CONSTRAINT "Pagamenti_Ricorrenti_negozioId_fkey";

-- DropForeignKey
ALTER TABLE "Spese" DROP CONSTRAINT "Spese_negozioId_fkey";

-- AlterTable
ALTER TABLE "Pagamenti_Ricorrenti" ALTER COLUMN "negozioId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Spese" ALTER COLUMN "negozioId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Spese" ADD CONSTRAINT "Spese_negozioId_fkey" FOREIGN KEY ("negozioId") REFERENCES "Negozio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pagamenti_Ricorrenti" ADD CONSTRAINT "Pagamenti_Ricorrenti_negozioId_fkey" FOREIGN KEY ("negozioId") REFERENCES "Negozio"("id") ON DELETE SET NULL ON UPDATE CASCADE;
