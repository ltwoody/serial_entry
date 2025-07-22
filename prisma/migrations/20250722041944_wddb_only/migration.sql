-- DropForeignKey
ALTER TABLE "serial_job" DROP CONSTRAINT "serial_job_u_id_fkey";

-- AlterTable
ALTER TABLE "serial_job" ALTER COLUMN "u_id" SET DATA TYPE TEXT;
