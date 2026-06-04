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
  slug: string
}

interface WeaponChange {
  weapon_name: string
  change_type: 'buff' | 'nerf' | 'new' | null
  changed_at: Date | null
}

// ── Step 1: Tier list ──────────────────────────────────────────────────────
// codmunity.gg Angular SSR: sections by class gold/silver/bronze/ng-star-inserted
async function fetchTierList(): Promise<ScrapedWeapon[]> {
  const { data: html } = await axios.get('https://codmunity.gg/tier-list/warzone', {
    headers: HEADERS, timeout: 15000,
  })
  const $ = cheerio.load(html)
  const weapons: ScrapedWeapon[] = []
  const seen = new Set<string>()

  const classTierMap: Record<string, string> = { gold: 'S', silver: 'A', bronze: 'B' }

  $('[class*="tier-list-section"]').each((_i, section) => {
    const classList = $(section).attr('class') ?? ''
    if (classList.includes('tier-list-section-item') ||
        classList.includes('tier-list-section-title') ||
        classList.includes('tier-list-section-items')) return

    let tier = 'C'
    for (const [cls, t] of Object.entries(classTierMap)) {
      if (classList.includes(cls)) { tier = t; break }
    }

    $(section).find('[class*="tier-list-section-item-title"]').each((_j, el) => {
      const name = $(el).text().trim()
      if (!name || name.length < 2 || name.length > 60 || seen.has(name)) return
      seen.add(name)

      const subtitle = $(el)
        .closest('[class*="tier-list-section-item-texts"]')
        .find('[class*="tier-list-section-item-subtitle"]')
        .first().text().trim()

      // Get slug from parent anchor href
      const href = $(el).closest('a').attr('href') ?? ''
      const slug = href.replace('/weapon/bo7/', '')

      weapons.push({ weapon_name: name, tier, category: subtitle || guessCategory(name), slug })
    })
  })

  return weapons
}

// ── Step 2: Per-weapon change history ─────────────────────────────────────
const MONTHS: Record<string, number> = {
  Jan:0, Feb:1, Mar:2, Apr:3, May:4, Jun:5,
  Jul:6, Aug:7, Sep:8, Oct:9, Nov:10, Dec:11,
}

function parseCodmunityDate(str: string): Date | null {
  // Format: "Jun 3, 2026"
  const m = str.match(/(\w{3})\s+(\d+),\s+(\d{4})/)
  if (!m) return null
  const month = MONTHS[m[1]]
  if (month === undefined) return null
  return new Date(Number(m[3]), month, Number(m[2]))
}

async function fetchWeaponChange(slug: string, weaponName: string): Promise<WeaponChange> {
  try {
    const { data: html } = await axios.get(`https://codmunity.gg/weapon/bo7/${slug}`, {
      headers: HEADERS, timeout: 10000,
    })
    const $ = cheerio.load(html)

    // Get balancing dates and tags in order
    const dateEls: string[] = []
    const tagEls:  string[] = []

    $('[class*="balancing-date"], [class*="balancing-container"]').each((_i, el) => {
      const text = $(el).text().trim()
      if (/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d+,\s+\d{4}/.test(text)) {
        dateEls.push(text.split('\n')[0].trim())
      }
    })

    $('[class*="balancing-tag"]').each((_i, el) => {
      const tag = $(el).text().trim()
      if (/^(buff|nerf|new)$/i.test(tag)) tagEls.push(tag.toLowerCase())
    })

    // If tag-only extraction didn't get dates, try regex on raw HTML
    if (dateEls.length === 0) {
      const dates = html.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d+,\s+\d{4}/g) ?? []
      dateEls.push(...dates)
    }

    if (tagEls.length === 0 || dateEls.length === 0) {
      return { weapon_name: weaponName, change_type: null, changed_at: null }
    }

    const latestDate = parseCodmunityDate(dateEls[0])
    const latestTag  = tagEls[0] as 'buff' | 'nerf' | 'new'

    return { weapon_name: weaponName, change_type: latestTag, changed_at: latestDate }
  } catch {
    return { weapon_name: weaponName, change_type: null, changed_at: null }
  }
}

// Fetch weapon changes in batches to avoid overwhelming the server
async function fetchAllChanges(weapons: ScrapedWeapon[]): Promise<Map<string, WeaponChange>> {
  const BATCH = 5
  const results = new Map<string, WeaponChange>()
  for (let i = 0; i < weapons.length; i += BATCH) {
    const batch = weapons.slice(i, i + BATCH)
    const res = await Promise.all(batch.map(w => fetchWeaponChange(w.slug, w.weapon_name)))
    res.forEach(r => results.set(r.weapon_name, r))
    if (i + BATCH < weapons.length) await new Promise(r => setTimeout(r, 500))
  }
  return results
}

// ── Helpers ────────────────────────────────────────────────────────────────
function guessCategory(name: string): string {
  const n = name.toLowerCase()
  if (/strider|hawker|vs.recon|mors|xr.3|longbow|kar98|mk35 isr/i.test(n)) return 'Sniper Rifle'
  if (/swordfish|warden|svk|dm56|mtz.intercept|svt/i.test(n)) return 'Marksman Rifle'
  if (/mk\.78|sokol|xm325|pulemyot|rapp|dg.58|rev-46/i.test(n)) return 'LMG'
  if (/voyak|ds20|egrt|mxr|peacekeeper|ak.?27|maddox|m15|x9.mav|ram.?7|mcw|holger|bp50|kastov|carbon|vst/i.test(n)) return 'Assault Rifle'
  if (/1911|pistol|velox|handgun/i.test(n)) return 'Handgun'
  if (/m10|breacher|echo|shotgun|ravager/i.test(n)) return 'Shotgun'
  return 'SMG'
}

// ── Main scrape ────────────────────────────────────────────────────────────
export async function scrapeWeaponMeta(): Promise<void> {
  console.log('[scraper] Obteniendo tier list de codmunity.gg...')

  let weapons: ScrapedWeapon[] = []
  try {
    weapons = await fetchTierList()
    console.log(`[scraper] ${weapons.length} armas en tier list`)
  } catch (err: any) {
    console.warn(`[scraper] Tier list falló: ${err.message}`)
  }

  if (weapons.length < 5) {
    console.warn('[scraper] Datos insuficientes — meta sin cambios')
    return
  }

  console.log('[scraper] Obteniendo historial buff/nerf de páginas individuales...')
  const changeMap = await fetchAllChanges(weapons)
  console.log(`[scraper] Cambios obtenidos para ${changeMap.size} armas`)

  // Get current DB state
  const existing = await query('SELECT weapon_name, tier FROM weapon_meta')
  const currentMap = new Map(existing.rows.map((r: any) => [r.weapon_name.toLowerCase(), r.tier]))

  const RECENT_DAYS = 14

  let updated = 0
  for (const w of weapons) {
    const key    = w.weapon_name.toLowerCase()
    const oldTier = currentMap.get(key)
    const change  = changeMap.get(w.weapon_name)
    const category = w.category || guessCategory(w.weapon_name)

    // Determine change_type: prefer direct page data, fallback to tier comparison
    let changeType: string | null = null
    let changedAt: Date | null = null

    if (change?.change_type && change.changed_at) {
      const ageMs = Date.now() - change.changed_at.getTime()
      const ageDays = ageMs / (1000 * 60 * 60 * 24)
      if (ageDays <= RECENT_DAYS) {
        changeType = change.change_type
        changedAt  = change.changed_at
      }
    } else if (oldTier) {
      // Fallback: detect tier shift
      const o = TIER_RANK[oldTier?.toUpperCase()] ?? 0
      const n = TIER_RANK[w.tier?.toUpperCase()] ?? 0
      if (n > o)      { changeType = 'buff';  changedAt = new Date() }
      else if (n < o) { changeType = 'nerf';  changedAt = new Date() }
    }

    if (oldTier) {
      await query(
        `UPDATE weapon_meta
         SET tier=$1, category=$2, updated_at=NOW(),
             change_type=$3,
             changed_at=CASE WHEN $3 IS NOT NULL THEN $4 ELSE changed_at END
         WHERE LOWER(weapon_name)=$5`,
        [w.tier, category, changeType, changedAt, key]
      )
    } else {
      await query(
        `INSERT INTO weapon_meta (weapon_name, tier, category, pick_rate, change_type, changed_at)
         VALUES ($1,$2,$3,0,$4,$5)
         ON CONFLICT (weapon_name) DO NOTHING`,
        [w.weapon_name, w.tier, category, changeType, changedAt]
      )
    }
    if (changeType) updated++
  }

  console.log(`[scraper] Completado: ${updated} armas con cambios recientes, ${weapons.length} total`)
}
