// scripts/import-serialjobs.ts
import fs from 'fs';
import csv from 'csv-parser';
import prisma from '../lib/prisma';

const data: any[] = [];

fs.createReadStream('./scripts/serial_job.csv') // your CSV path
  .pipe(csv())
  .on('data', (row) => data.push(row))
  .on('end', async () => {
    try {
      await prisma.serialJob.createMany({
        data: data.map((job) => ({
          u_id: job.u_id,
          serial_number: job.serial_number,
          replace_serial: job.replace_serial || null,
          received_date: new Date(job.received_date),
          supplier: job.supplier || null,
          date_receipt: job.date_receipt ? new Date(job.date_receipt) : null,
          brand_name: job.brand_name || null,
          product_code: job.product_code || null,
          product_name: job.product_name || null,
          job_no: job.job_no || null,
          condition: job.condition || null,
          remark: job.remark || null,
          count_round: job.count_round ? Number(job.count_round) : null,
          create_by: job.create_by || null,
          update_by: job.update_by || null,
          replace_code: job.replace_code || null,
          replace_product: job.replace_product || null,
        })),
        skipDuplicates: true, // avoid errors on duplicate `serial_number` or `rowuid`
      });

      console.log('✅ SerialJob import complete!');
    } catch (error) {
      console.error('❌ Import error:', error);
    } finally {
      await prisma.$disconnect();
    }
  });
