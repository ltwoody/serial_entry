-- CreateTable
CREATE TABLE "user_table" (
    "u_id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstname" TEXT,
    "lastname" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "role" TEXT,

    CONSTRAINT "user_table_pkey" PRIMARY KEY ("u_id")
);

-- CreateTable
CREATE TABLE "serial_job" (
    "u_id" INTEGER NOT NULL,
    "serial_number" TEXT NOT NULL,
    "replace_serial" TEXT,
    "received_date" DATE NOT NULL,
    "supplier" TEXT,
    "date_receipt" DATE,
    "brand_name" TEXT,
    "product_code" TEXT,
    "product_name" TEXT,
    "job_no" TEXT,
    "condition" TEXT,
    "remark" TEXT,
    "count_round" INTEGER,
    "create_by" TEXT,
    "create_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_by" TEXT,
    "update_time" TIMESTAMP(3) NOT NULL,
    "replace_code" TEXT,
    "replace_product" TEXT,
    "rowuid" TEXT NOT NULL,

    CONSTRAINT "serial_job_pkey" PRIMARY KEY ("rowuid")
);

-- CreateTable
CREATE TABLE "product_master" (
    "oid" SERIAL NOT NULL,
    "product_code" TEXT NOT NULL,
    "brand_name" TEXT,
    "product_name" TEXT,

    CONSTRAINT "product_master_pkey" PRIMARY KEY ("oid")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_table_username_key" ON "user_table"("username");

-- CreateIndex
CREATE UNIQUE INDEX "user_table_email_key" ON "user_table"("email");

-- CreateIndex
CREATE UNIQUE INDEX "serial_job_serial_number_key" ON "serial_job"("serial_number");

-- CreateIndex
CREATE UNIQUE INDEX "serial_job_rowuid_key" ON "serial_job"("rowuid");

-- CreateIndex
CREATE UNIQUE INDEX "product_master_product_code_key" ON "product_master"("product_code");

-- AddForeignKey
ALTER TABLE "serial_job" ADD CONSTRAINT "serial_job_u_id_fkey" FOREIGN KEY ("u_id") REFERENCES "user_table"("u_id") ON DELETE RESTRICT ON UPDATE CASCADE;
