import axios from 'axios'
import * as cheerio from 'cheerio'
import { query } from './db'

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
}

const TIER_RANK: Record<string, number> = { S: 4, A: 3, B: 2, C: 1, D: 0, E: 0 }

interface ScrapedWeapon {
  weapon_name: string
  tier: string
  category: string
}

// Parse codmunity.gg tier list page
async function fetchCodmunity(): Promise<ScrapedWeapon[]> {
  const { data: html } = await axios.get('https://codmunity.gg/tier-list/warzone', {
    headers: HEADERS, timeout: 10000,
  })

  const $ = cheerio.load(html)
  const weapons: ScrapedWeapon[] = []

  // codmunity uses tier headings then weapon cards under them
  // Pattern: look for elements that contain weapon names adjacent to tier markers
  $('[class*="tier"], [class*="Tier"]').each((_i, el) => {
    const tierText = $(el).text().trim().toUpperCase()
    const tierMatch = tierText.match(/^([SABCDE])\s*(TIER)?/)
    if (!tierMatch) return

    const tier = tierMatch[1]
    // Weapon cards are siblings or children
    $(el).nextAll().addBack().find('[class*="weapon"], [class*="card"], [class*="item"]').each((_j, card) => {
      const name = $(card).find('[class*="name"], h3, h4, strong').first().text().trim()
      if (name && name.length > 2 && name.length < 60) {
        weapons.push({ weapon_name: name, tier, category: 'Assault Rifle' })
      }
    })
  })

  // Broader fallback: look for list items that follow a tier heading
  if (!weapons.length) {
    let currentTier = ''
    $('h1, h2, h3, h4, li, div').each((_i, el) => {
      const text = $(el).text().trim()
      const tierMatch = text.match(/^(?:Tier\s)?([SABCDE])\s*(?:Tier|tier|TIER)?$/)
      if (tierMatch && text.length < 20) {
        currentTier = tierMatch[1].toUpperCase()
        return
      }
      if (currentTier && text.length > 2 && text.length < 60 && !/tier/i.test(text)) {
        // Heuristic: weapon names are short-ish and don't contain common UI words
        if (!/click|view|meta|build|guide|best|top|warzone/i.test(text)) {
          weapons.push({ weapon_name: text, tier: currentTier, category: 'Assault Rifle' })
        }
      }
    })
  }

  return weapons
}

// Parse wzhub.gg — returns tier groupings in the HTML
async function fetchWzhub(): Promise<ScrapedWeapon[]> {
  const { data: html } = await axios.get('https://wzhub.gg/loadouts', {
    headers: HEADERS, timeout: 10000,
  })

  const $ = cheerio.load(html)
  const weapons: ScrapedWeapon[] = []

  // wzhub uses sections labeled "Absolute Meta", "Meta", "Acceptable"
  const tierMap: Record<string, string> = {
    'absolute meta': 'S',
    'meta': 'A',
    'acceptable': 'B',
    'unrated': 'C',
  }

  let currentTier = 'C'
  $('h1, h2, h3, h4, span, div, p').each((_i, el) => {
    const text = $(el).text().trim().toLowerCase()
    for (const [label, tier] of Object.entries(tierMap)) {
      if (text === label || text.startsWith(label)) {
        currentTier = tier
        return
      }
    }
    // Weapon names are usually uppercase on wzhub
    const raw = $(el).text().trim()
    if (raw === raw.toUpperCase() && raw.length > 2 && raw.length < 40 &&
        !/^(WARZONE|META|ABSOLUTE|TIER|ACCEPTABLE|UNRATED|SMG|AR|LMG|SNIPER|RIFLE)$/.test(raw)) {
      weapons.push({ weapon_name: raw, tier: currentTier, category: 'Assault Rifle' })
    }
  })

  return weapons
}

// Normalize category from context or default
function guessCategory(name: string): string {
  const n = name.toLowerCase()
  if (/strider|hawker|vs.recon|xr.3|longbow|kar98/i.test(n)) return 'Sniper Rifle'
  if (/swordfish|warden|m8a1|svk|dm56|mtz.intercept/i.test(n)) return 'Marksman Rifle'
  if (/mk\.78|sokol|xm325|pulemyot|rapp|dg.58|lmg/i.test(n)) return 'LMG'
  if (/voyak|ds20|egrt|mk35|mxr|peacekeeper|ak.27|maddox|m15|x9.mav|ram.7|mcw|holger|bp50|kastov/i.test(n)) return 'Assault Rifle'
  return 'SMG'
}

// Compare tiers: returns 'buff', 'nerf', or null
function detectChange(oldTier: string, newTier: string): 'buff' | 'nerf' | null {
  const o = TIER_RANK[oldTier?.toUpperCase()] ?? 0
  const n = TIER_RANK[newTier?.toUpperCase()] ?? 0
  if (n > o) return 'buff'
  if (n < o) return 'nerf'
  return null
}

export async function scrapeWeaponMeta(): Promise<void> {
  console.log('[scraper] Intentando fetch de meta de armas...')

  let scraped: ScrapedWeapon[] = []

  // Try each source in order
  for (const [name, fn] of [['codmunity.gg', fetchCodmunity], ['wzhub.gg', fetchWzhub]] as const) {
    try {
      scraped = await fn()
      if (scraped.length >= 5) {
        console.log(`[scraper] ${scraped.length} armas obtenidas de ${name}`)
        break
      }
    } catch (err: any) {
      console.warn(`[scraper] ${name} falló: ${err.message}`)
    }
  }

  if (scraped.length < 5) {
    console.warn('[scraper] No se pudo obtener data suficiente — meta actual sin cambios')
    return
  }

  // Deduplicate by weapon name (case-insensitive)
  const seen = new Set<string>()
  const unique = scraped.filter(w => {
    const key = w.weapon_name.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  // Get current state from DB
  const existing = await query(
    'SELECT weapon_name, tier FROM weapon_meta'
  )
  const currentMap = new Map(existing.rows.map(r => [r.weapon_name.toLowerCase(), r.tier]))

  let updated = 0
  for (const w of unique) {
    const key = w.weapon_name.toLowerCase()
    const oldTier = currentMap.get(key)
    const change = oldTier ? detectChange(oldTier, w.tier) : 'new' as const
    const category = guessCategory(w.weapon_name)

    if (oldTier) {
      // Update existing weapon
      await query(
        `UPDATE weapon_meta
         SET tier = $1, category = $2, updated_at = NOW(),
             change_type = $3, changed_at = CASE WHEN $3 IS NOT NULL THEN NOW() ELSE changed_at END
         WHERE LOWER(weapon_name) = $4`,
        [w.tier, category, change, key]
      )
    } else {
      // Insert new weapon
      await query(
        `INSERT INTO weapon_meta (weapon_name, tier, category, pick_rate, change_type, changed_at)
         VALUES ($1, $2, $3, 0, 'new', NOW())
         ON CONFLICT DO NOTHING`,
        [w.weapon_name, w.tier, category]
      )
    }
    if (change) updated++
  }

  console.log(`[scraper] ${updated} armas con cambios detectados`)
}
