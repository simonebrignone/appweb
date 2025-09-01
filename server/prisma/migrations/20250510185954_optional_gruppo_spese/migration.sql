-- DropForeignKey
ALTER TABLE "Spese" DROP CONSTRAINT "Spese_gruppoId_fkey";

-- AlterTable
ALTER TABLE "Spese" ALTER COLUMN "gruppoId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Spese" ADD CONSTRAINT "Spese_gruppoId_fkey" FOREIGN KEY ("gruppoId") REFERENCES "GruppoSpesa"("id") ON DELETE SET NULL ON UPDATE CASCADE;
