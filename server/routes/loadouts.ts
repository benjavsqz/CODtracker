import { Router, Response } from 'express'
import crypto from 'crypto'
import { query } from '../services/db'
import { requireAuth, AuthRequest } from '../middleware/jwt'

const router = Router()

const genSlug = () => crypto.randomBytes(5).toString('hex')

router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      'SELECT * FROM loadouts WHERE user_id = $1 ORDER BY updated_at DESC',
      [req.user!.id]
    )
    res.json(result.rows)
  } catch {
    res.status(500).json({ error: 'Error al obtener loadouts' })
  }
})

router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const { name, weapon_name, category, attachments, cod_share_code, notes, is_public,
          secondary_weapon, secondary_category, secondary_attachments,
          tactical, lethal, perk1, perk2, perk3, melee } = req.body
  if (!name) return res.status(400).json({ error: 'El nombre es requerido' })

  try {
    const slug = genSlug()
    const result = await query(
      `INSERT INTO loadouts
         (user_id, name, weapon_name, category, attachments, cod_share_code, notes, is_public, share_slug,
          secondary_weapon, secondary_category, secondary_attachments,
          tactical, lethal, perk1, perk2, perk3, melee)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18) RETURNING *`,
      [req.user!.id, name, weapon_name, category, attachments ?? {}, cod_share_code, notes, is_public ?? false, slug,
       secondary_weapon, secondary_category, secondary_attachments ?? {},
       tactical, lethal, perk1, perk2, perk3, melee]
    )
    res.status(201).json(result.rows[0])
  } catch {
    res.status(500).json({ error: 'Error al crear loadout' })
  }
})

router.put('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const { name, weapon_name, category, attachments, cod_share_code, notes, is_public,
          secondary_weapon, secondary_category, secondary_attachments,
          tactical, lethal, perk1, perk2, perk3, melee } = req.body
  try {
    const result = await query(
      `UPDATE loadouts SET
         name=$1, weapon_name=$2, category=$3, attachments=$4,
         cod_share_code=$5, notes=$6, is_public=$7,
         secondary_weapon=$8, secondary_category=$9, secondary_attachments=$10,
         tactical=$11, lethal=$12, perk1=$13, perk2=$14, perk3=$15, melee=$16,
         updated_at=NOW()
       WHERE id=$17 AND user_id=$18 RETURNING *`,
      [name, weapon_name, category, attachments ?? {}, cod_share_code, notes, is_public,
       secondary_weapon, secondary_category, secondary_attachments ?? {},
       tactical, lethal, perk1, perk2, perk3, melee,
       req.params.id, req.user!.id]
    )
    if (!result.rows[0]) return res.status(404).json({ error: 'Loadout no encontrado' })
    res.json(result.rows[0])
  } catch {
    res.status(500).json({ error: 'Error al actualizar loadout' })
  }
})

router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    await query('DELETE FROM loadouts WHERE id=$1 AND user_id=$2', [req.params.id, req.user!.id])
    res.json({ ok: true })
  } catch {
    res.status(500).json({ error: 'Error al eliminar loadout' })
  }
})

// Ruta pública — no requiere auth
router.get('/share/:slug', async (req, res: Response) => {
  try {
    const result = await query(
      `SELECT l.*, u.username FROM loadouts l
       JOIN users u ON u.id = l.user_id
       WHERE l.share_slug = $1 AND l.is_public = true`,
      [req.params.slug]
    )
    if (!result.rows[0]) return res.status(404).json({ error: 'Loadout no encontrado o no es público' })
    res.json(result.rows[0])
  } catch {
    res.status(500).json({ error: 'Error al obtener loadout' })
  }
})

export default router
