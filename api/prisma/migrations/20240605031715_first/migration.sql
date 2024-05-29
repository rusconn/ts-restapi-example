-- CreateTable
CREATE TABLE "Author" (
    "id" CHAR(26) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" VARCHAR(255) NOT NULL,

    CONSTRAINT "Author_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthorBook" (
    "authorId" CHAR(26) NOT NULL,
    "bookId" CHAR(26) NOT NULL,

    CONSTRAINT "AuthorBook_pkey" PRIMARY KEY ("authorId","bookId")
);

-- CreateTable
CREATE TABLE "Book" (
    "id" CHAR(26) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" VARCHAR(255) NOT NULL,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Author_createdAt_id_idx" ON "Author"("createdAt", "id");

-- CreateIndex
CREATE INDEX "Author_updatedAt_id_idx" ON "Author"("updatedAt", "id");

-- CreateIndex
CREATE INDEX "Author_name_id_idx" ON "Author"("name", "id");

-- CreateIndex
CREATE INDEX "AuthorBook_bookId_idx" ON "AuthorBook"("bookId");

-- CreateIndex
CREATE INDEX "Book_createdAt_id_idx" ON "Book"("createdAt", "id");

-- CreateIndex
CREATE INDEX "Book_updatedAt_id_idx" ON "Book"("updatedAt", "id");

-- CreateIndex
CREATE INDEX "Book_title_id_idx" ON "Book"("title", "id");

-- AddForeignKey
ALTER TABLE "AuthorBook" ADD CONSTRAINT "AuthorBook_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthorBook" ADD CONSTRAINT "AuthorBook_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;
