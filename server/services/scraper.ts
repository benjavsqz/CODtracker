import axios from 'axios'
import * as cheerio from 'cheerio'
import vm from 'vm'
import { query } from './db'

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36',
  'Accept-Language': 'es-ES,es;q=0.9',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
}

const WZ_STATS_BASE = 'https://wzstats.gg'
const WZ_STATS_API  = 'https://app.wzstats.gg'
const WZ_BASE       = 'https://wzmetaloadouts.com'  // still used for perks/clases/noticias

// ── Tier numeric values ────────────────────────────────────────────────────

const TIER_VAL: Record<string, number> = { S: 4, A: 3, B: 2, C: 1 }

function scoreToTier(score: number): string {
  if (score >= 3.4) return 'S'
  if (score >= 2.4) return 'A'
  if (score >= 1.4) return 'B'
  return 'C'
}

// ── Types ──────────────────────────────────────────────────────────────────

interface SourceWeapon {
  weapon_name: string
  tier: string
  tier_score: number
  category: string
  ranking?: number
  image_url?: string
  game_modes?: string[]
  tactical_cat?: string
  meta_build?: Record<string, string>
  change_type?: 'buff' | 'nerf' | 'new' | null
  changed_at?: Date | null
  source: string
}

interface VentajaItem {
  nombre: string
  nombre_en: string
  slot: string
  icon: string
  tier: string
  uso: string
  descripcion: string
}

interface ClaseItem {
  id: string | number
  estilo: string
  nombre: string
  icono: string
  dificultad: string
  modos: string[]
  descripcion: string
  primaria: { nombre?: string; arma?: string; attachments: Array<{ slot: string; item: string }> }
  secundaria: { nombre?: string; arma?: string; attachments: Array<{ slot: string; item: string }> }
  stats: Record<string, number>
  color: string
}

interface NoticiaIndex {
  slug: string
  url: string
  titulo: string
  resumen: string
  imagen: string
  categoria: string
  destacada: boolean
  tags: string[]
  date: string
  fecha_legible: string
}


interface WZStatsTierWeapon {
  name: string
  slug: string
  tier: string
  rank: number | null
  category: string
  change_type: 'buff' | 'nerf' | 'new' | null
  image_url: string | null
}

// ── Slot key (BOR API, English) → Spanish canonical name ─────────────────

const SLOT_ES_MAP: Record<string, string> = {
  muzzle:      'Bocacha',
  barrel:      'Cañón',
  stock:       'Culata',
  underbarrel: 'Empuñadura Delantera',
  rearGrip:    'Empuñadura Trasera',
  magazine:    'Cargador',
  laser:       'Láser',
  optic:       'Mira',
  firemods:    'Mods de Disparo',
}

function slotToES(slot: string): string {
  return SLOT_ES_MAP[slot] ?? slot
}

// ── Translation helpers ────────────────────────────────────────────────────

function translateCategory(tipo: string): string {
  const map: Record<string, string> = {
    'Fusil de asalto':        'Assault Rifle',
    'Subfusil':               'SMG',
    'Ametralladora ligera':   'LMG',
    'Fusil de precisión':     'Sniper Rifle',
    'Fusil de tirador':       'Marksman Rifle',
    'Fusil de batalla':       'Battle Rifle',
    'Escopeta':               'Shotgun',
    'Pistola':                'Handgun',
    'ASSAULT_RIFLE':          'Assault Rifle',
    'SMG':                    'SMG',
    'LMG':                    'LMG',
    'SNIPER_RIFLE':           'Sniper Rifle',
    'MARKSMAN_RIFLE':         'Marksman Rifle',
    'BATTLE_RIFLE':           'Battle Rifle',
    'SHOTGUN':                'Shotgun',
    'PISTOL':                 'Handgun',
  }
  return map[tipo] ?? tipo ?? 'Assault Rifle'
}

function evalJSVar(js: string, varName: string): unknown {
  const safe = js.replace(new RegExp(`\\bconst\\s+${varName}\\s*=`), `var ${varName} =`)
  const sandbox: Record<string, unknown> = {}
  try {
    vm.createContext(sandbox)
    vm.runInContext(safe, sandbox, { timeout: 5000 })
    return sandbox[varName]
  } catch (e) {
    console.warn(`[scraper] evalJSVar(${varName}) error:`, (e as Error).message?.slice(0, 120))
    return undefined
  }
}

// ── Source 1: wzstats.gg tier list (HTML scrape) ──────────────────────────

async function fetchWZStatsTierList(): Promise<WZStatsTierWeapon[]> {
  const { data: html } = await axios.get(`${WZ_STATS_BASE}/es`, {
    headers: HEADERS, timeout: 15000,
  })

  const $ = cheerio.load(html)
  const weapons: WZStatsTierWeapon[] = []
  const seen = new Set<string>()

  const tierClassMap: Record<string, string> = {
    'tier-a': 'A', 'tier-b': 'B', 'tier-c': 'C', 'tier-d': 'D',
  }

  function extractFromOl($ol: ReturnType<typeof $>, tier: string) {
    $ol.find('> li').each((_j: number, li: unknown) => {
      const $li = $(li as cheerio.Element)
      const href = $li.find('a[href*="best-loadouts"]').first().attr('href') ?? ''
      const slug = href.replace(/^\/[a-z]{2}\/best-loadouts\//, '')
      if (!slug || seen.has(slug)) return
      seen.add(slug)

      const name = $li.find('.loadout-content-name div').first().text().trim()
      if (!name || name.length < 2) return

      const rankStr = $li.find('.rank').first().text().replace('#', '').trim()
      const rank = rankStr ? parseInt(rankStr, 10) || null : null

      const changeTag = $li.find('.loadout-content-tag').first()
      let change_type: 'buff' | 'nerf' | 'new' | null = null
      const changeText = changeTag.text().trim().toLowerCase()
      if (changeText === 'nerf') change_type = 'nerf'
      else if (changeText === 'buff') change_type = 'buff'
      else if (['new', 'nuevo', 'nueva'].includes(changeText)) change_type = 'new'

      const category = $li.find('.loadout-tag').not('.category-position').first().text().trim()
      const imgSrc = $li.find('img[src*="wzstats"]').first().attr('src') ?? null

      weapons.push({ name, slug, tier, rank, category, change_type, image_url: imgSrc })
    })
  }

  // Process A–D tiers via app-tier-header elements
  $('app-tier-header').each((_i: number, header: unknown) => {
    const tierDivCls = $(header as cheerio.Element).find('[class*="tier-"]').first().attr('class') ?? ''
    let tier = 'C'
    for (const [key, val] of Object.entries(tierClassMap)) {
      if (tierDivCls.includes(key)) { tier = val; break }
    }
    const $ol = $(header as cheerio.Element).next().find('ol').first()
    if ($ol.length) extractFromOl($ol, tier)
  })

  // Process S/META tier: remaining <li> items that have pre-loaded wzstats images
  $('li').each((_i: number, li: unknown) => {
    const $li = $(li as cheerio.Element)
    const href = $li.find('a[href*="best-loadouts"]').first().attr('href') ?? ''
    const slug = href.replace(/^\/[a-z]{2}\/best-loadouts\//, '')
    if (!slug || seen.has(slug)) return

    const imgSrc = $li.find('img[src*="wzstats"]').first().attr('src')
    if (!imgSrc) return // S tier has pre-loaded images; skip items without one

    seen.add(slug)
    const name = $li.find('.loadout-content-name div').first().text().trim()
    if (!name || name.length < 2) return

    const rankStr = $li.find('.rank').first().text().replace('#', '').trim()
    const rank = rankStr ? parseInt(rankStr, 10) || null : null

    const changeTag = $li.find('.loadout-content-tag').first()
    let change_type: 'buff' | 'nerf' | 'new' | null = null
    const changeText = changeTag.text().trim().toLowerCase()
    if (changeText === 'nerf') change_type = 'nerf'
    else if (changeText === 'buff') change_type = 'buff'
    else if (['new', 'nuevo', 'nueva'].includes(changeText)) change_type = 'new'

    const category = $li.find('.loadout-tag').not('.category-position').first().text().trim()
    weapons.push({ name, slug, tier: 'S', rank, category, change_type, image_url: imgSrc })
  })

  return weapons
}

// ── Source 1b: wzstats weapon page → embedded JSON → wz2 best build ────────
// The BOR API gives archetype builds (wrong for Warzone).
// The correct Warzone build is embedded in the page as:
//   type="application/json" → URL contains /wz2/weapons/builds/wzstats/...
//   build.type === 'wz2' && build.isBestBuild === true

const WZ_SLOTS = ['muzzle','barrel','stock','underbarrel','rearGrip','magazine','laser','optic','firemods'] as const

async function fetchWZStatsBuild(slug: string): Promise<Record<string, string> | null> {
  try {
    const { data: html } = await axios.get(
      `${WZ_STATS_BASE}/es/best-loadouts/${slug}`,
      { headers: HEADERS, timeout: 15000 },
    )

    // Extract all embedded JSON blocks
    const blocks = [...(html as string).matchAll(/application\/json">({.*?})<\/script>/gs)]

    for (const block of blocks) {
      let outer: Record<string, any>
      try { outer = JSON.parse(block[1]) } catch { continue }

      for (const val of Object.values(outer) as any[]) {
        const url: string = val?.u ?? ''
        if (!url.includes('/wz2/weapons/builds/wzstats/with-attachments/')) continue

        const builds: any[] = val?.b?.builds ?? []
        if (!builds.length) continue

        // Priority: wz2 isBestBuild → first wz2 build → bo7 isBestBuild
        const wz2Best  = builds.find(b => b.type === 'wz2' && b.isBestBuild)
        const wz2First = builds.find(b => b.type === 'wz2')
        const bo7Best  = builds.find(b => b.type === 'bo7' && b.isBO7BestBuild)
        const chosen   = wz2Best ?? wz2First ?? bo7Best
        if (!chosen) continue

        const build: Record<string, string> = {}
        for (const s of WZ_SLOTS) {
          const att = chosen[s]
          if (att?.name) build[slotToES(s)] = att.name
        }
        // Warzone max 5 attachments — keep top 5 by slot priority
        const entries = Object.entries(build).slice(0, 5)
        return entries.length > 0 ? Object.fromEntries(entries) : null
      }
    }
    return null
  } catch {
    return null
  }
}

async function fetchWZStats(): Promise<SourceWeapon[]> {
  const listWeapons = await fetchWZStatsTierList()
  console.log(
    `[scraper] WZStats tier list: ${listWeapons.length} armas ` +
    `(S:${listWeapons.filter(w => w.tier === 'S').length} ` +
    `A:${listWeapons.filter(w => w.tier === 'A').length} ` +
    `B:${listWeapons.filter(w => w.tier === 'B').length})`,
  )

  // Only fetch builds for S + A tier (quality builds worth showing)
  const needBuilds = listWeapons.filter(w => w.tier === 'S' || w.tier === 'A')
  const buildMap = new Map<string, Record<string, string>>()

  const BATCH = 5
  for (let i = 0; i < needBuilds.length; i += BATCH) {
    const batch = needBuilds.slice(i, i + BATCH)
    const results = await Promise.allSettled(
      batch.map(w => fetchWZStatsBuild(w.slug).then(b => ({ slug: w.slug, build: b }))),
    )
    for (const r of results) {
      if (r.status === 'fulfilled' && r.value.build) {
        buildMap.set(r.value.slug, r.value.build)
      }
    }
    if (i + BATCH < needBuilds.length) await new Promise(r => setTimeout(r, 300))
  }
  console.log(`[scraper] WZStats builds: ${buildMap.size}/${needBuilds.length}`)

  return listWeapons
    .filter(w => w.tier !== 'D') // skip D-tier (clearly unviable)
    .map(w => ({
      weapon_name:  w.name,
      tier:         w.tier,
      tier_score:   TIER_VAL[w.tier] ?? 1,
      category:     translateCategory(w.category),
      ranking:      w.rank ?? undefined,
      image_url:    w.image_url ?? undefined,
      game_modes:   [],
      tactical_cat: undefined,
      meta_build:   buildMap.get(w.slug) ?? undefined,
      change_type:  w.change_type,
      changed_at:   w.change_type ? new Date() : null,
      source:       'wzstats',
    } as SourceWeapon))
}

// ── Source 2: codmunity.gg/es tier list ───────────────────────────────────

interface CodmunityWeapon {
  weapon_name: string
  tier: string
  category: string
  slug: string
  image_url?: string
}

function nameKey(name: string): string {
  return name.toLowerCase().replace(/[-.\s]/g, '')
}

async function fetchCodmunityTiers(): Promise<CodmunityWeapon[]> {
  const { data: html } = await axios.get('https://codmunity.gg/es/tier-list/warzone', {
    headers: HEADERS, timeout: 15000,
  })

  // Pre-build image map via regex (Angular SSR, cheerio can't find images reliably)
  const imgMap = new Map<string, string>()
  const imgMatches = html.matchAll(
    /src="(https:\/\/assets\.codmunity\.gg\/optimized\/150w-([^"]*?Warzone-Loadout-CODMunity[^"]+)\.webp)"/g,
  )
  for (const m of imgMatches) {
    const thumbUrl = m[1]
    const filename = m[2]
    const namePart = filename.replace(
      /[-](Long[-]Range|Close[-]Range|Sniper[-]Support|Sniper|Secondary|Support|Mid[-]Range|undefined)[-]Warzone.*/i, '',
    )
    const key = nameKey(namePart.replace(/-/g, ' '))
    if (!imgMap.has(key)) imgMap.set(key, thumbUrl.replace('/150w-', '/'))
  }

  const $ = cheerio.load(html)
  const weapons: CodmunityWeapon[] = []
  const seen = new Set<string>()

  const classTierMap: Record<string, string> = { gold: 'S', silver: 'A', bronze: 'B' }

  $('[class*="tier-list-section"]').each((_i, section) => {
    const classList = $(section).attr('class') ?? ''
    if (
      classList.includes('tier-list-section-item') ||
      classList.includes('tier-list-section-title') ||
      classList.includes('tier-list-section-items')
    ) return

    let tier = 'C'
    for (const [cls, t] of Object.entries(classTierMap)) {
      if (classList.includes(cls)) { tier = t; break }
    }

    $(section).find('[class*="tier-list-section-item-title"]').each((_j, el) => {
      const name = $(el).text().trim()
      if (!name || name.length < 2 || name.length > 60 || seen.has(name)) return
      seen.add(name)

      const href     = $(el).closest('a').attr('href') ?? ''
      const slug     = href.replace('/es/weapon/bo7/', '').replace('/weapon/bo7/', '')
      const subtitle = $(el)
        .closest('[class*="tier-list-section-item-texts"]')
        .find('[class*="tier-list-section-item-subtitle"]')
        .first().text().trim()

      const image_url = imgMap.get(nameKey(name)) ?? undefined
      weapons.push({ weapon_name: name, tier, category: subtitle || '', slug, image_url })
    })
  })

  if (imgMap.size > 0) {
    const found = weapons.filter(w => w.image_url).length
    console.log(`[scraper] Codmunity imágenes: ${found}/${weapons.length} armas`)
  }
  return weapons
}

// ── Source 2b: codmunity.gg per-weapon buff/nerf history ──────────────────

const MONTHS: Record<string, number> = {
  Jan:0, Feb:1, Mar:2, Apr:3, May:4, Jun:5,
  Jul:6, Aug:7, Sep:8, Oct:9, Nov:10, Dec:11,
}

function parseCodmunityDate(str: string): Date | null {
  const m = str.match(/(\w{3})\s+(\d+),\s+(\d{4})/)
  if (!m) return null
  const month = MONTHS[m[1]]
  if (month === undefined) return null
  return new Date(Number(m[3]), month, Number(m[2]))
}

async function fetchWeaponChange(slug: string): Promise<{ change_type: 'buff' | 'nerf' | 'new' | null; changed_at: Date | null }> {
  try {
    const { data: html } = await axios.get(`https://codmunity.gg/es/weapon/bo7/${slug}`, {
      headers: HEADERS, timeout: 10000,
    })
    const dateMatches = html.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d+,\s+\d{4}/g) ?? []
    const tagMatches  = html.match(/balancing-tag[^>]*>([^<]+)</g)
      ?.map((m: string) => m.replace(/balancing-tag[^>]*>/, '').replace('<', '').trim().toLowerCase())
      .filter((t: string) => /^(buff|nerf|new)$/.test(t)) ?? []

    if (tagMatches.length === 0 || dateMatches.length === 0) {
      return { change_type: null, changed_at: null }
    }
    return {
      change_type: tagMatches[0] as 'buff' | 'nerf' | 'new',
      changed_at:  parseCodmunityDate(dateMatches[0]),
    }
  } catch {
    return { change_type: null, changed_at: null }
  }
}

async function enrichWithCodmunityChanges(
  weapons: CodmunityWeapon[],
): Promise<Map<string, { change_type: 'buff' | 'nerf' | 'new' | null; changed_at: Date | null }>> {
  const results = new Map<string, { change_type: 'buff' | 'nerf' | 'new' | null; changed_at: Date | null }>()
  const BATCH = 5
  const weaponsWithSlug = weapons.filter(w => w.slug)

  for (let i = 0; i < weaponsWithSlug.length; i += BATCH) {
    const batch = weaponsWithSlug.slice(i, i + BATCH)
    const res = await Promise.allSettled(
      batch.map(w => fetchWeaponChange(w.slug).then(r => ({ name: w.weapon_name, ...r }))),
    )
    for (const r of res) {
      if (r.status === 'fulfilled') {
        results.set(r.value.name, { change_type: r.value.change_type, changed_at: r.value.changed_at })
      }
    }
    if (i + BATCH < weaponsWithSlug.length) await new Promise(r => setTimeout(r, 400))
  }
  return results
}

function guessCategory(name: string): string {
  const n = name.toLowerCase()
  if (/strider|hawker|vs.recon|mors|xr.3|longbow|kar98|mk35 isr/i.test(n)) return 'Sniper Rifle'
  if (/swordfish|warden|svk|dm56|mtz.intercept|svt/i.test(n)) return 'Marksman Rifle'
  if (/mk\.78|sokol|xm325|pulemyot|rapp|dg.58|rev-46/i.test(n)) return 'LMG'
  if (/voyak|ds20|egrt|mxr|peacekeeper|ak.?27|maddox|m15|x9.mav|ram.?7|mcw|holger|bp50|kastov|carbon|vst/i.test(n)) return 'Assault Rifle'
  if (/1911|pistol|velox|handgun/i.test(n)) return 'Handgun'
  if (/m10|breacher|echo|shotgun|ravager|akita|sg-12/i.test(n)) return 'Shotgun'
  return 'SMG'
}

// ── Source 3: noticias buff/nerf scan (still from wzmetaloadouts) ──────────

async function fetchNoticias(): Promise<NoticiaIndex[]> {
  const { data } = await axios.get<NoticiaIndex[]>(`${WZ_BASE}/noticias-index.json`, {
    headers: HEADERS, timeout: 10000,
  })
  return Array.isArray(data) ? data : []
}

async function fetchArticleContent(url: string): Promise<string> {
  try {
    const { data: html } = await axios.get(`${WZ_BASE}${url}`, {
      headers: HEADERS, timeout: 12000,
    })
    const $ = cheerio.load(html)
    return $('.noticia-cuerpo').text().trim().slice(0, 8000)
  } catch {
    return ''
  }
}

function extractNewsChanges(text: string): Map<string, 'buff' | 'nerf'> {
  const changes = new Map<string, 'buff' | 'nerf'>()
  const buffRe  = /buffead|mejorad|potenciad|aumentad|increment|fortalecid/i
  const nerfRe  = /nerfeada|nerfeado|reducid|debilitad|bajad|empeorad|disminuid/i

  for (const sent of text.split(/[.\n]/)) {
    const type = buffRe.test(sent) ? 'buff' : nerfRe.test(sent) ? 'nerf' : null
    if (!type) continue
    const words = sent.match(/[A-Z][A-Za-z0-9\- ]{2,29}(?=\s|$)/g) ?? []
    for (const w of words) {
      const name = w.trim()
      if (name.length >= 3 && !changes.has(name)) changes.set(name, type)
    }
  }
  return changes
}

// ── Aggregation engine ─────────────────────────────────────────────────────

function aggregateWeapons(
  wzStatsWeapons: SourceWeapon[],
  codmunityWeapons: CodmunityWeapon[],
  codmunityChanges: Map<string, { change_type: 'buff' | 'nerf' | 'new' | null; changed_at: Date | null }>,
  newsChanges: Map<string, 'buff' | 'nerf'>,
): Array<{
  weapon_name: string
  tier: string
  tier_score: number
  category: string
  ranking: number | null
  image_url: string | null
  game_modes: string[]
  tactical_cat: string | null
  meta_build: Record<string, string> | null
  change_type: string | null
  changed_at: Date | null
  sources_count: number
}> {
  const wzMap  = new Map(wzStatsWeapons.map(w => [normalizeKey(w.weapon_name), w]))
  const codMap = new Map(codmunityWeapons.map(w => [normalizeKey(w.weapon_name), w]))
  const allKeys = new Set([...wzMap.keys(), ...codMap.keys()])

  const RECENT_DAYS = 21
  const results = []

  for (const key of allKeys) {
    const wz  = wzMap.get(key)
    const cod = codMap.get(key)

    // wzstats is authoritative when available; codmunity supplements
    const finalTier  = wz ? wz.tier : scoreToTier(TIER_VAL[cod!.tier] ?? 1)
    const tierScore  = TIER_VAL[finalTier] ?? 1
    const sourcesCount = (wz ? 1 : 0) + (cod ? 1 : 0)

    const weapon_name  = wz?.weapon_name ?? cod!.weapon_name
    const category     = wz?.category ?? (cod?.category ? translateCategory(cod.category) : guessCategory(weapon_name))
    const ranking      = wz?.ranking ?? null
    // Prefer codmunity clean renders, fall back to wzstats image
    const image_url    = cod?.image_url ?? wz?.image_url ?? null
    const game_modes   = wz?.game_modes ?? []
    const tactical_cat = wz?.tactical_cat ?? null
    const meta_build   = wz?.meta_build && Object.keys(wz.meta_build).length > 0
      ? wz.meta_build
      : null

    // Change type: wzstats flags → codmunity dated history → news scan
    let change_type: string | null = null
    let changed_at: Date | null = null

    if (wz?.change_type) {
      change_type = wz.change_type
      changed_at  = wz.changed_at ?? new Date()
    }

    const codChange = codmunityChanges.get(weapon_name)
    if (codChange?.change_type && codChange.changed_at) {
      const ageDays = (Date.now() - codChange.changed_at.getTime()) / (1000 * 60 * 60 * 24)
      if (ageDays <= RECENT_DAYS) {
        if (!change_type || change_type === codChange.change_type) {
          change_type = codChange.change_type
          changed_at  = codChange.changed_at
        }
      }
    }

    if (!change_type) {
      const newsHit = newsChanges.get(weapon_name)
      if (newsHit) { change_type = newsHit; changed_at = new Date() }
    }

    results.push({
      weapon_name, tier: finalTier, tier_score: tierScore,
      category, ranking, image_url, game_modes, tactical_cat,
      meta_build, change_type, changed_at,
      sources_count: sourcesCount,
    })
  }

  return results
}

function normalizeKey(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, ' ')
}

// ── Persist weapons ────────────────────────────────────────────────────────

async function saveWeapons(aggregated: ReturnType<typeof aggregateWeapons>): Promise<void> {
  const existing = await query('SELECT weapon_name, tier FROM weapon_meta')
  const currentMap = new Map(existing.rows.map((r: any) => [normalizeKey(r.weapon_name), r.tier]))

  for (const w of aggregated) {
    const oldTier = currentMap.get(normalizeKey(w.weapon_name))

    let changeType = w.change_type
    let changedAt  = w.changed_at
    if (!changeType && oldTier) {
      const o = TIER_VAL[oldTier?.toUpperCase()] ?? 0
      const n = TIER_VAL[w.tier?.toUpperCase()] ?? 0
      if (n > o)      { changeType = 'buff'; changedAt = new Date() }
      else if (n < o) { changeType = 'nerf'; changedAt = new Date() }
    }

    const buildParam = w.meta_build ? JSON.stringify(w.meta_build) : null

    if (oldTier !== undefined) {
      await query(
        `UPDATE weapon_meta
         SET tier=$1, category=$2, updated_at=NOW(), image_url=$3,
             change_type=$4::varchar,
             changed_at=CASE WHEN $4::varchar IS NOT NULL THEN $5 ELSE changed_at END,
             ranking=$6, game_modes=$7, tactical_cat=$8,
             sources_count=$9, tier_score=$10
             ${buildParam ? ', meta_build=$11' : ''}
         WHERE LOWER(weapon_name)=${buildParam ? '$12' : '$11'}`,
        buildParam
          ? [w.tier, w.category, w.image_url, changeType, changedAt,
             w.ranking, w.game_modes, w.tactical_cat,
             w.sources_count, w.tier_score, buildParam, normalizeKey(w.weapon_name)]
          : [w.tier, w.category, w.image_url, changeType, changedAt,
             w.ranking, w.game_modes, w.tactical_cat,
             w.sources_count, w.tier_score, normalizeKey(w.weapon_name)],
      )
    } else {
      await query(
        `INSERT INTO weapon_meta
           (weapon_name, tier, category, pick_rate, image_url, change_type, changed_at,
            ranking, game_modes, tactical_cat, sources_count, tier_score, meta_build)
         VALUES ($1,$2,$3,0,$4,$5::varchar,$6,$7,$8,$9,$10,$11,$12)
         ON CONFLICT (weapon_name) DO NOTHING`,
        [w.weapon_name, w.tier, w.category, w.image_url,
         changeType, changedAt, w.ranking, w.game_modes,
         w.tactical_cat, w.sources_count, w.tier_score,
         buildParam ? JSON.parse(buildParam) : {}],
      )
    }
  }
}

// ── Persist perks ──────────────────────────────────────────────────────────

async function savePerks(ventajas: VentajaItem[]): Promise<void> {
  for (const v of ventajas) {
    const category = v.slot.replace('PERK ', 'Perk ')
    const iconUrl  = `${WZ_BASE}/${v.icon}`
    await query(
      `INSERT INTO perk_meta (perk_name, category, tier, description, image_url, updated_at)
       VALUES ($1,$2,$3,$4,$5,NOW())
       ON CONFLICT (perk_name) DO UPDATE
         SET category=$2, tier=$3, description=$4, image_url=$5, updated_at=NOW()`,
      [v.nombre_en || v.nombre, category, v.tier, v.descripcion, iconUrl],
    )
  }
}

// ── Persist clases ─────────────────────────────────────────────────────────

async function saveClases(clases: ClaseItem[]): Promise<void> {
  for (const c of clases) {
    // Store slot names as-is (clases.js slots are already in Spanish)
    const primAtt = Object.fromEntries(
      (c.primaria?.attachments ?? []).map(a => [a.slot, a.item]),
    )
    const secAtt = Object.fromEntries(
      (c.secundaria?.attachments ?? []).map(a => [a.slot, a.item]),
    )
    const primArma = c.primaria?.nombre ?? c.primaria?.arma ?? null
    const secArma  = c.secundaria?.nombre ?? c.secundaria?.arma ?? null

    await query(
      `INSERT INTO meta_clases
         (nombre, estilo, descripcion, dificultad, modos, color,
          primaria_arma, primaria_attachments, secundaria_arma, secundaria_attachments, stats, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW())
       ON CONFLICT (nombre) DO UPDATE
         SET estilo=$2, descripcion=$3, dificultad=$4, modos=$5, color=$6,
             primaria_arma=$7, primaria_attachments=$8,
             secundaria_arma=$9, secundaria_attachments=$10,
             stats=$11, updated_at=NOW()`,
      [c.nombre, c.estilo, c.descripcion, c.dificultad,
       c.modos ?? [], c.color ?? null,
       primArma, primAtt, secArma, secAtt, c.stats ?? {}],
    )
  }
}

// ── Persist noticias ───────────────────────────────────────────────────────

async function saveNoticias(
  list: NoticiaIndex[],
  contentMap: Map<string, string>,
): Promise<void> {
  for (const n of list) {
    const fecha  = n.date ? new Date(n.date) : null
    const imgUrl = n.imagen ? `${WZ_BASE}${n.imagen.startsWith('/') ? '' : '/'}${n.imagen}` : null
    await query(
      `INSERT INTO meta_noticias (slug, titulo, resumen, imagen_url, categoria, fecha, contenido, destacada, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW())
       ON CONFLICT (slug) DO UPDATE
         SET titulo=$2, resumen=$3, imagen_url=$4, categoria=$5,
             fecha=$6, contenido=$7, destacada=$8, updated_at=NOW()`,
      [n.slug, n.titulo, n.resumen, imgUrl, n.categoria, fecha,
       contentMap.get(n.slug) ?? '', n.destacada ?? false],
    )
  }
}

// ── Main scrape ────────────────────────────────────────────────────────────

export async function scrapeWeaponMeta(): Promise<void> {
  console.log('[scraper] Iniciando scrape multi-fuente...')

  const [wzStatsRes, codmunityRes, ventajasRes, clasesRes, noticiasRes] = await Promise.allSettled([
    fetchWZStats(),
    fetchCodmunityTiers(),
    axios.get<string>(`${WZ_BASE}/ventajas.js`, { headers: HEADERS, timeout: 10000, responseType: 'text' })
      .then(r => evalJSVar(r.data, 'VENTAJAS') as VentajaItem[] ?? []),
    axios.get<string>(`${WZ_BASE}/clases.js`, { headers: HEADERS, timeout: 10000, responseType: 'text' })
      .then(r => evalJSVar(r.data, 'CLASES') as ClaseItem[] ?? []),
    fetchNoticias(),
  ])

  const wzStatsWeapons = wzStatsRes.status    === 'fulfilled' ? wzStatsRes.value    : []
  const codmunityRaw   = codmunityRes.status  === 'fulfilled' ? codmunityRes.value  : []
  const ventajas       = ventajasRes.status   === 'fulfilled' ? ventajasRes.value   : []
  const clases         = clasesRes.status     === 'fulfilled' ? clasesRes.value     : []
  const noticias       = noticiasRes.status   === 'fulfilled' ? noticiasRes.value   : []

  if (wzStatsRes.status === 'rejected')   console.warn('[scraper] wzstats falló:', (wzStatsRes.reason as Error).message)
  if (codmunityRes.status === 'rejected') console.warn('[scraper] codmunity falló:', (codmunityRes.reason as Error).message)

  console.log(`[scraper] Fuentes: wzstats=${wzStatsWeapons.length} codmunity=${codmunityRaw.length} ventajas=${ventajas.length} clases=${clases.length} noticias=${noticias.length}`)

  if (wzStatsWeapons.length === 0 && codmunityRaw.length === 0) {
    console.warn('[scraper] Ambas fuentes de armas fallaron — abortando')
    return
  }

  console.log('[scraper] Obteniendo historial buff/nerf de codmunity...')
  const codmunityChanges = codmunityRaw.length > 0
    ? await enrichWithCodmunityChanges(codmunityRaw)
    : new Map()
  console.log(`[scraper] ${codmunityChanges.size} armas con historial de cambios`)

  const newsChanges = new Map<string, 'buff' | 'nerf'>()
  const contentMap  = new Map<string, string>()
  for (let i = 0; i < Math.min(noticias.length, 5); i += 2) {
    const batch = noticias.slice(i, i + 2)
    const results = await Promise.allSettled(
      batch.map(n => fetchArticleContent(n.url).then(txt => ({ slug: n.slug, txt }))),
    )
    for (const r of results) {
      if (r.status !== 'fulfilled') continue
      contentMap.set(r.value.slug, r.value.txt)
      for (const [name, type] of extractNewsChanges(r.value.txt)) {
        if (!newsChanges.has(name)) newsChanges.set(name, type)
      }
    }
    if (i + 2 < noticias.length) await new Promise(r => setTimeout(r, 400))
  }

  const aggregated = aggregateWeapons(wzStatsWeapons, codmunityRaw, codmunityChanges, newsChanges)
  console.log(`[scraper] Agregadas ${aggregated.length} armas (${aggregated.filter(w => w.sources_count >= 2).length} en 2+ fuentes)`)

  // Tier distribution
  const tierDist: Record<string, number> = { S: 0, A: 0, B: 0, C: 0 }
  for (const w of aggregated) tierDist[w.tier] = (tierDist[w.tier] ?? 0) + 1
  console.log(`[scraper] Tiers — S:${tierDist.S} A:${tierDist.A} B:${tierDist.B} C:${tierDist.C}`)

  await saveWeapons(aggregated)
  if (ventajas.length) await savePerks(ventajas)
  if (clases.length)   await saveClases(clases)
  if (noticias.length) await saveNoticias(noticias, contentMap)

  console.log(`[scraper] Completado — ${aggregated.length} armas, ${ventajas.length} ventajas, ${clases.length} clases, ${noticias.length} noticias`)
}
