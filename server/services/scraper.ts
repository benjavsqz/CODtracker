import axios from 'axios'
import * as cheerio from 'cheerio'
import { query } from './db'

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
}

const TIER_RANK: Record<string, number> = { S: 4, A: 3, B: 2, C: 1 }

interface ScrapedWeapon {
  weapon_name: string
  tier: string
  category: string
}

// codmunity.gg Angular SSR — tier sections use CSS classes gold/silver/bronze/ng-star-inserted
// Structure: .tier-list-section.gold > items, .tier-list-section.silver > items, etc.
async function fetchCodmunity(): Promise<ScrapedWeapon[]> {
  const { data: html } = await axios.get('https://codmunity.gg/tier-list/warzone', {
    headers: HEADERS, timeout: 15000,
  })

  const $ = cheerio.load(html)
  const weapons: ScrapedWeapon[] = []

  // Map CSS class to tier letter
  // gold = Absolute Meta (S), silver = A Tier, bronze = B Tier, rest = C
  const classTierMap: Record<string, string> = {
    gold: 'S',
    silver: 'A',
    bronze: 'B',
  }

  // Each tier section is a div with class containing "tier-list-section" plus gold/silver/bronze/ng-star
  $('[class*="tier-list-section"]').each((_i, section) => {
    const classList = $(section).attr('class') ?? ''

    // Only process direct tier sections (not child elements)
    if (!classList.includes('tier-list-section-item') &&
        !classList.includes('tier-list-section-title') &&
        !classList.includes('tier-list-section-items')) {

      let tier = 'C'
      for (const [cls, t] of Object.entries(classTierMap)) {
        if (classList.includes(cls)) { tier = t; break }
      }

      // Extract weapon names and categories from items within this section
      $(section).find('[class*="tier-list-section-item-title"]').each((_j, el) => {
        const name = $(el).text().trim()
        const subtitle = $(el)
          .closest('[class*="tier-list-section-item-texts"]')
          .find('[class*="tier-list-section-item-subtitle"]')
          .first()
          .text()
          .trim()

        if (name && name.length > 1 && name.length < 60) {
          weapons.push({
            weapon_name: name,
            tier,
            category: subtitle || guessCategory(name),
          })
        }
      })
    }
  })

  // Fallback: also try the table view (weapon-link-text + weapon-category)
  if (weapons.length < 5) {
    const rows: Array<{ name: string; category: string }> = []
    $('[class*="weapon-link-text"]').each((_i, el) => {
      const name = $(el).text().trim()
      if (name && name.length > 1 && name.length < 60) {
        const cat = $(el)
          .closest('tr')
          .find('[class*="weapon-category"]')
          .first()
          .text()
          .trim()
        rows.push({ name, category: cat || guessCategory(name) })
      }
    })
    // Without tier data from table, default to A
    rows.forEach(r => weapons.push({ weapon_name: r.name, tier: 'A', category: r.category }))
  }

  return weapons
}

// Normalize weapon category
function guessCategory(name: string): string {
  const n = name.toLowerCase()
  if (/strider|hawker|vs.recon|mors|xr.3|longbow|kar98|mk35/i.test(n)) return 'Sniper Rifle'
  if (/swordfish|warden|m8a1|svk|dm56|mtz.intercept|svt|mk35 isr/i.test(n)) return 'Marksman Rifle'
  if (/mk\.78|sokol|xm325|pulemyot|rapp|dg.58|lmg|rev-46/i.test(n)) return 'LMG'
  if (/voyak|ds20|egrt|mk35|mxr|peacekeeper|ak.?27|maddox|m15|x9.mav|ram.?7|mcw|holger|bp50|kastov|carbon|vst/i.test(n)) return 'Assault Rifle'
  if (/1911|pistol|velox|handgun/i.test(n)) return 'Handgun'
  if (/m10|breacher|echo|shotgun|ravager/i.test(n)) return 'Shotgun'
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
  console.log('[scraper] Intentando fetch de meta de armas (codmunity.gg)...')

  let scraped: ScrapedWeapon[] = []

  try {
    scraped = await fetchCodmunity()
    console.log(`[scraper] ${scraped.length} armas obtenidas de codmunity.gg`)
  } catch (err: any) {
    console.warn(`[scraper] codmunity.gg falló: ${err.message}`)
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
  const existing = await query('SELECT weapon_name, tier FROM weapon_meta')
  const currentMap = new Map(existing.rows.map(r => [r.weapon_name.toLowerCase(), r.tier]))

  let updated = 0
  for (const w of unique) {
    const key = w.weapon_name.toLowerCase()
    const oldTier = currentMap.get(key)
    const change = oldTier ? detectChange(oldTier, w.tier) : 'new' as const
    const category = w.category || guessCategory(w.weapon_name)

    if (oldTier) {
      await query(
        `UPDATE weapon_meta
         SET tier = $1, category = $2, updated_at = NOW(),
             change_type = $3, changed_at = CASE WHEN $3 IS NOT NULL THEN NOW() ELSE changed_at END
         WHERE LOWER(weapon_name) = $4`,
        [w.tier, category, change, key]
      )
    } else {
      await query(
        `INSERT INTO weapon_meta (weapon_name, tier, category, pick_rate, change_type, changed_at)
         VALUES ($1, $2, $3, 0, 'new', NOW())
         ON CONFLICT DO NOTHING`,
        [w.weapon_name, w.tier, category]
      )
    }
    if (change) updated++
  }

  console.log(`[scraper] ${updated} armas con cambios detectados, ${unique.length} total procesadas`)
}
