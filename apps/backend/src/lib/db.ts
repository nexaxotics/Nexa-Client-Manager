import { Pool } from 'pg'
import { logger } from './logger'

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
})

pool.on('error', (err) => {
  logger.error(err, 'PostgreSQL pool error')
})

export async function query<T = unknown>(text: string, params?: unknown[]): Promise<T[]> {
  const start = Date.now()
  const res = await pool.query(text, params)
  const duration = Date.now() - start
  logger.debug({ text, duration, rows: res.rowCount }, 'query executed')
  return res.rows as T[]
}

export async function queryOne<T = unknown>(text: string, params?: unknown[]): Promise<T | null> {
  const rows = await query<T>(text, params)
  return rows[0] ?? null
}
