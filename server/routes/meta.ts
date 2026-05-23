import { Router } from 'express'
import { query } from '../services/db'
import { scrapeWeaponMeta } from '../services/scraper'

const router = Router()

router.get('/', async (_req, res) => {
  try {
    const result = await query(
      `SELECT DISTINCT ON (weapon_name)
         weapon_name, tier, category, pick_rate, meta_build, image_url,
         change_type,
         CASE WHEN changed_at > NOW() - INTERVAL '14 days' THEN change_type ELSE NULL END AS recent_change,
         updated_at
       FROM weapon_meta
       ORDER BY weapon_name, updated_at DESC`
    )
    res.json(result.rows)
  } catch (err) {
    console.error('[meta] Error:', err)
    res.status(500).json({ error: 'No se pudo obtener la meta' })
  }
})

// Manual trigger para forzar scrape (útil para testing o después de un parche)
router.post('/scrape', async (_req, res) => {
  try {
    res.json({ message: 'Scrape iniciado en background' })
    scrapeWeaponMeta()
      .then(() => console.log('[meta] Scrape manual completado'))
      .catch(err => console.error('[meta] Scrape manual falló:', err))
  } catch (err) {
    res.status(500).json({ error: 'No se pudo iniciar el scrape' })
  }
})

router.get('/perks', async (_req, res) => {
  try {
    const result = await query(
      `SELECT DISTINCT ON (perk_name) id, perk_name, category, tier, description, image_url
       FROM perk_meta
       ORDER BY perk_name,
         CASE category WHEN 'Perk 1' THEN 1 WHEN 'Perk 2' THEN 2 WHEN 'Perk 3' THEN 3 END,
         CASE tier WHEN 'S' THEN 1 WHEN 'A' THEN 2 WHEN 'B' THEN 3 WHEN 'C' THEN 4 END`
    )
    // Re-sort after dedup so frontend gets category→tier order
    result.rows.sort((a, b) => {
      const catOrder: Record<string, number> = { 'Perk 1': 1, 'Perk 2': 2, 'Perk 3': 3 }
      const tierOrder: Record<string, number> = { S: 1, A: 2, B: 3, C: 4 }
      return (catOrder[a.category] - catOrder[b.category]) || (tierOrder[a.tier] - tierOrder[b.tier])
    })
    res.json(result.rows)
  } catch (err) {
    console.error('[perks] Error:', err)
    res.status(500).json({ error: 'No se pudo obtener las ventajas' })
  }
})

router.get('/equipment', async (_req, res) => {
  try {
    const result = await query(
      `SELECT DISTINCT ON (name) id, name, category, tier, description, image_url
       FROM equipment_meta
       ORDER BY name,
         CASE category WHEN 'tactical' THEN 1 WHEN 'lethal' THEN 2 WHEN 'melee' THEN 3 END,
         CASE tier WHEN 'S' THEN 1 WHEN 'A' THEN 2 WHEN 'B' THEN 3 WHEN 'C' THEN 4 END`
    )
    // Re-sort after dedup so frontend gets category→tier order
    result.rows.sort((a, b) => {
      const catOrder: Record<string, number> = { tactical: 1, lethal: 2, melee: 3 }
      const tierOrder: Record<string, number> = { S: 1, A: 2, B: 3, C: 4 }
      return (catOrder[a.category] - catOrder[b.category]) || (tierOrder[a.tier] - tierOrder[b.tier])
    })
    res.json(result.rows)
  } catch (err) {
    console.error('[equipment] Error:', err)
    res.status(500).json({ error: 'No se pudo obtener el equipo' })
  }
})

export default router
