/*
  Warnings:

  - You are about to drop the column `email` on the `user_table` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `user_table` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "user_table_email_key";

-- AlterTable
ALTER TABLE "user_table" DROP COLUMN "email",
DROP COLUMN "updatedAt";
