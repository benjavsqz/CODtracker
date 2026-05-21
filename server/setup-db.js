require('dotenv').config({ path: '../.env' })
const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  ssl: false,
})

async function run() {
  const schema = fs.readFileSync(path.join(__dirname, '../db/schema.sql'), 'utf8')
  console.log('Conectando a la DB...')
  await pool.query(schema)
  console.log('Tablas creadas correctamente.')
  await pool.end()
}

run().catch(err => {
  console.error('Error:', err.message)
  process.exit(1)
})
