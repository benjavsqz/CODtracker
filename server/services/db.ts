import { Pool } from 'pg'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

export const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'wztracker',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS,
})

export const query = (text: string, params?: unknown[]) => pool.query(text, params)
