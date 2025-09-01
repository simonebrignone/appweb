-- CreateTable
CREATE TABLE "GruppoSpesa" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "descrizione" TEXT,
    "creatoDaId" INTEGER NOT NULL,

    CONSTRAINT "GruppoSpesa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssociazioneUtenteGruppoSpesa" (
    "id" SERIAL NOT NULL,
    "utenteId" INTEGER NOT NULL,
    "gruppoId" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "admin" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "AssociazioneUtenteGruppoSpesa_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GruppoSpesa_creatoDaId_nome_key" ON "GruppoSpesa"("creatoDaId", "nome");

-- CreateIndex
CREATE UNIQUE INDEX "AssociazioneUtenteGruppoSpesa_utenteId_gruppoId_key" ON "AssociazioneUtenteGruppoSpesa"("utenteId", "gruppoId");

-- AddForeignKey
ALTER TABLE "GruppoSpesa" ADD CONSTRAINT "GruppoSpesa_creatoDaId_fkey" FOREIGN KEY ("creatoDaId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssociazioneUtenteGruppoSpesa" ADD CONSTRAINT "AssociazioneUtenteGruppoSpesa_utenteId_fkey" FOREIGN KEY ("utenteId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssociazioneUtenteGruppoSpesa" ADD CONSTRAINT "AssociazioneUtenteGruppoSpesa_gruppoId_fkey" FOREIGN KEY ("gruppoId") REFERENCES "GruppoSpesa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
