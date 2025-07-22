// scripts/import-serialjobs.ts
import fs from 'fs';
import csv from 'csv-parser';
import prisma from '../lib/prisma';

const data: any[] = [];

fs.createReadStream('./scripts/product_master.csv') // your CSV path
  .pipe(csv())
  .on('data', (row) => data.push(row))
  .on('end', async () => {
    try {
      await prisma.productMaster.createMany({
        data: data.map((job) => ({
          oid: Number(job.oid),
          product_code: job.product_code,
          brand_name: job.brand_name || null,
          product_name: job.product_name,
          
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

 