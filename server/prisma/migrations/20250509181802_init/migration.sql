-- CreateTable
CREATE TABLE "Prodotto" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "descrizione" TEXT,
    "disabilitato" BOOLEAN NOT NULL DEFAULT false,
    "categoriaId" INTEGER,

    CONSTRAINT "Prodotto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BarcodeProdotto" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "prodottoId" INTEGER NOT NULL,
    "barcode" TEXT NOT NULL,

    CONSTRAINT "BarcodeProdotto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Categoria" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "descrizione" TEXT,
    "macroGruppo" TEXT,
    "entrata" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Categoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Prodotto_userId_nome_key" ON "Prodotto"("userId", "nome");

-- CreateIndex
CREATE UNIQUE INDEX "BarcodeProdotto_userId_barcode_key" ON "BarcodeProdotto"("userId", "barcode");

-- CreateIndex
CREATE UNIQUE INDEX "Categoria_userId_nome_key" ON "Categoria"("userId", "nome");

-- AddForeignKey
ALTER TABLE "Prodotto" ADD CONSTRAINT "Prodotto_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prodotto" ADD CONSTRAINT "Prodotto_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BarcodeProdotto" ADD CONSTRAINT "BarcodeProdotto_prodottoId_fkey" FOREIGN KEY ("prodottoId") REFERENCES "Prodotto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BarcodeProdotto" ADD CONSTRAINT "BarcodeProdotto_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Categoria" ADD CONSTRAINT "Categoria_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
