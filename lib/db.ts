import { Pool } from 'pg';

export const pool = new Pool({
  user: 'wannawut',
  host: '127.0.0.1',
  database: 'postgres',
  password: 'Wd@45799',
  port: 5432,
});

// types/index.ts
export interface User {
  username: string;
  password: string;
}

export interface TrafficRecord {
  BU: string;
  Branch: string;
  Name: string;
  Quarter: string;
  Week: string;
  Traffic: number;
  SerialNo: string;
}
