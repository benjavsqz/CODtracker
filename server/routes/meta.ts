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
         CASE WHEN changed_at > NOW() - INTERVAL '21 days' THEN change_type ELSE NULL END AS recent_change,
         ranking, game_modes, tactical_cat,
         COALESCE(sources_count, 1) AS sources_count,
         COALESCE(tier_score, 0)    AS tier_score,
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
    result.rows.sort((a: any, b: any) => {
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
    result.rows.sort((a: any, b: any) => {
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

router.get('/clases', async (_req, res) => {
  try {
    const result = await query(
      `SELECT id, nombre, estilo, descripcion, dificultad, modos, color,
              primaria_arma, primaria_attachments,
              secundaria_arma, secundaria_attachments,
              stats, updated_at
       FROM meta_clases
       ORDER BY id`
    )
    res.json(result.rows)
  } catch (err) {
    console.error('[clases] Error:', err)
    res.status(500).json({ error: 'No se pudo obtener las clases' })
  }
})

router.get('/noticias', async (_req, res) => {
  try {
    const result = await query(
      `SELECT id, slug, titulo, resumen, imagen_url, categoria, fecha, destacada
       FROM meta_noticias
       ORDER BY destacada DESC, fecha DESC NULLS LAST
       LIMIT 20`
    )
    res.json(result.rows)
  } catch (err) {
    console.error('[noticias] Error:', err)
    res.status(500).json({ error: 'No se pudo obtener las noticias' })
  }
})

router.get('/noticias/:slug', async (req, res) => {
  try {
    const result = await query(
      `SELECT id, slug, titulo, resumen, imagen_url, categoria, fecha, contenido, destacada
       FROM meta_noticias WHERE slug = $1 LIMIT 1`,
      [req.params.slug]
    )
    if (!result.rows.length) return res.status(404).json({ error: 'Noticia no encontrada' })
    res.json(result.rows[0])
  } catch (err) {
    console.error('[noticias/:slug] Error:', err)
    res.status(500).json({ error: 'No se pudo obtener la noticia' })
  }
})

export default router
