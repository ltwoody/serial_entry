import fs from 'fs';
import csv from 'csv-parser';
import prisma from '../lib/prisma';

const data: any[] = [];

fs.createReadStream('./scripts/user_table.csv')
  .pipe(csv())
  .on('data', (row) => {
    // Log the exact value read from the CSV for createdat
    console.log(`CSV Row Data for username: ${row.username || 'N/A'}`);
    console.log(`  raw job.createdat: "${row.createdat}" (type: ${typeof row.createdat})`);

    data.push(row);
  })
  .on('end', async () => {
    let errorEncountered = false;
    try {
      const usersToCreate = data.map((job, index) => {
        let createdAtValue = job.createdat;

        // --- CRITICAL VALIDATION AND DEFAULTING ---
        // 1. Check if the value is truthy (not null, undefined, or empty string)
        if (!createdAtValue || String(createdAtValue).trim() === '') {
          console.warn(`WARN: Row ${index + 1}: 'createdat' is missing or empty for user '${job.username || 'UNKNOWN'}'. Defaulting to current timestamp.`);
          createdAtValue = new Date().toISOString(); // Default to current UTC time
        } else {
          // 2. Attempt to validate if it's a parseable date string
          try {
            // This line will throw an error if the string is truly malformed
            const parsedDate = new Date(createdAtValue);
            if (isNaN(parsedDate.getTime())) { // Check if Date object is "Invalid Date"
                console.error(`ERROR: Row ${index + 1}: 'createdat' value "${createdAtValue}" is not a valid date. Defaulting to current timestamp.`);
                createdAtValue = new Date().toISOString();
            } else {
                // Ensure it's in a format Prisma expects, e.g., with 'Z' for UTC or offset
                createdAtValue = parsedDate.toISOString(); // Re-format to strict ISO-8601 UTC
            }
          } catch (e) {
            console.error(`ERROR: Row ${index + 1}: 'createdat' value "${createdAtValue}" caused parsing error: ${e.message}. Defaulting to current timestamp.`);
            createdAtValue = new Date().toISOString();
          }
        }
        // --- END CRITICAL VALIDATION AND DEFAULTING ---

        // Log the value that will actually be sent to Prisma for this row
        console.log(`  Sending to Prisma: username: ${job.username || 'N/A'}, createdAt: "${createdAtValue}"`);

        return {
          username: job.username,
          password: job.password,
          firstname: job.firstname,
          lastname: job.lastname,
          createdAt: createdAtValue, // Use the validated/defaulted value
          role: job.role,
        };
      });

      await prisma.user.createMany({
        data: usersToCreate,
        skipDuplicates: true,
      });

      console.log('✅ User import complete!');
    } catch (error) {
      errorEncountered = true;
      console.error('❌ Import error:', error);
      if (error.code === 'P2000' && error.meta?.field_name === 'createdAt') {
          console.error("HINT: This specific error (P2000 on createdAt) strongly suggests the 'createdat' value from your CSV (even after checks) is still not an ISO-8601 datetime string. Look at the logs above for invalid entries.");
      }
    } finally {
      if (!errorEncountered) {
         await prisma.$disconnect();
      } else {
         console.log("Not disconnecting Prisma due to an error. You might need to manually close the connection if it persists.");
         // In a real application, you might still want to disconnect here,
         // but for debugging, keeping it open can sometimes help.
         await prisma.$disconnect(); // It's generally good practice to always disconnect.
      }
    }
  });