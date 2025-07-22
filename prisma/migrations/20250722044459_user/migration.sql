/*
  Warnings:

  - The primary key for the `user_table` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `u_id` on the `user_table` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user_table" DROP CONSTRAINT "user_table_pkey",
DROP COLUMN "u_id";
