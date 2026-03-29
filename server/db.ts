import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

if (process.env.NODE_ENV === 'production' && !process.env.POSTGRES_PASSWORD) {
  throw new Error('FATAL: POSTGRES_PASSWORD environment variable is required in production');
}

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'bw_nexus_ai',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || (process.env.NODE_ENV === 'production' ? undefined : 'postgres'),
  port: Number(process.env.POSTGRES_PORT || 5432),
  max: Number(process.env.POSTGRES_POOL_SIZE || 10),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL client error', err);
  process.exit(-1);
});

export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const start = Date.now();
  const result = await pool.query<T>(text, params);
  const duration = Date.now() - start;
  if (process.env.DEBUG_SQL === 'true') {
    console.log('Postgres query', { text: text.substring(0, 120), duration, rows: result.rowCount });
  }
  return result.rows;
}

export async function queryOne<T = any>(text: string, params?: any[]): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] || null;
}

export function getPool(): Pool {
  return pool;
}
