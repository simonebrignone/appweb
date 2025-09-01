-- CreateTable
CREATE TABLE "Negozio" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "citta" TEXT,
    "via" TEXT,
    "numeroVia" TEXT,
    "descrizione" TEXT,
    "online" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Negozio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoricoPrezzi" (
    "id" SERIAL NOT NULL,
    "prodottoId" INTEGER NOT NULL,
    "negozioId" INTEGER NOT NULL,
    "prezzo" DOUBLE PRECISION NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "StoricoPrezzi_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Negozio" ADD CONSTRAINT "Negozio_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoricoPrezzi" ADD CONSTRAINT "StoricoPrezzi_prodottoId_fkey" FOREIGN KEY ("prodottoId") REFERENCES "Prodotto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoricoPrezzi" ADD CONSTRAINT "StoricoPrezzi_negozioId_fkey" FOREIGN KEY ("negozioId") REFERENCES "Negozio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoricoPrezzi" ADD CONSTRAINT "StoricoPrezzi_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
