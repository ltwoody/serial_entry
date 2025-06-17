import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  connectionString : process.env.DATABASE_URL,
  
});

// types/index.ts
export interface User {
  username: string;
  password: string;
  role: string;
  firstname: string;
  lastname: string;
}

export interface SerialJob {
  u_id: string;
  serial_number: string;
  replace_serial: string;
  received_date: Date;
  supplier: string;
  date_receipt: Date;
  brand_name: string;
  product_code: string;
  product_name: string;
  job_no: string;
  condition: string;
  remark: string;
  count_round: string;
  create_by: string;
  update_by: string;
  replace_code: string;
  replace_product: string;
  rowuid: string;
}
