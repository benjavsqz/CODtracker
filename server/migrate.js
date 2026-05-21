require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') })
const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
})

async function run() {
  console.log('Conectando a la DB...')
  const schema = fs.readFileSync(path.join(__dirname, '../db/schema.sql'), 'utf8')
  await pool.query(schema)
  console.log('✓ Tablas listas')

  const seed = fs.readFileSync(path.join(__dirname, '../db/seed-weapons.sql'), 'utf8')
  await pool.query(seed)
  console.log('✓ Meta de armas sembrada (30 armas)')

  const seedPerks = fs.readFileSync(path.join(__dirname, '../db/seed-perks.sql'), 'utf8')
  await pool.query(seedPerks)
  console.log('✓ Meta de ventajas BO7 sembrada (15 perks)')

  const seedEquipment = fs.readFileSync(path.join(__dirname, '../db/seed-equipment.sql'), 'utf8')
  await pool.query(seedEquipment)
  console.log('✓ Equipment BO7 sembrado (24 items)')

  await pool.end()
  console.log('Migración completada.')
}

run().catch(err => { console.error('Error:', err.message); process.exit(1) })
