/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Author` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Book` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Author_createdAt_id_idx";

-- DropIndex
DROP INDEX "Book_createdAt_id_idx";

-- AlterTable
ALTER TABLE "Author" DROP COLUMN "createdAt";

-- AlterTable
ALTER TABLE "Book" DROP COLUMN "createdAt";
