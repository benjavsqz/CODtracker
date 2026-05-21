import cron from 'node-cron'
import { scrapeWeaponMeta } from '../services/scraper'

export function startMetaCron() {
  // Diariamente a medianoche
  cron.schedule('0 0 * * *', async () => {
    console.log('[cron] Actualizando meta de armas...')
    try {
      await scrapeWeaponMeta()
      console.log('[cron] Meta actualizada correctamente')
    } catch (err) {
      console.error('[cron] Error en scraper:', err)
    }
  })
  console.log('[cron] Meta scraper programado — corre diariamente a medianoche')
}
