import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import authRouter from './routes/auth'
import loadoutsRouter from './routes/loadouts'
import metaRouter from './routes/meta'
import { startMetaCron } from './cron/metaScraper'

dotenv.config({ path: path.resolve(__dirname, '../.env') })

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRouter)
app.use('/api/loadouts', loadoutsRouter)
app.use('/api/meta', metaRouter)

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))

app.listen(PORT, () => {
  console.log(`[server] Corriendo en http://localhost:${PORT}`)
  startMetaCron()
})
