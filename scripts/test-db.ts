// scripts/test-db.ts
import { pool } from '@/lib/db';

(async () => {
  try {
    console.log('Connecting...');
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL');
    client.release();
  } catch (err) {
    console.error('❌ DB connection failed:', err);
  } finally {
    process.exit();
  }
})();
