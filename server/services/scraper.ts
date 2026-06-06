import axios from 'axios'
import * as cheerio from 'cheerio'
import vm from 'vm'
import { query } from './db'

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
}

const WZ_BASE = 'https://wzmetaloadouts.com'

// ── Tier numeric values ────────────────────────────────────────────────────

const TIER_VAL: Record<string, number> = { S: 4, A: 3, B: 2, C: 1 }

// S: both agree on S (4.0), OR one source S + other A (3.5) → stays S
// A: both agree A (3.0), or mix of A/B
function scoreToTier(score: number): string {
  if (score >= 3.4) return 'S'
  if (score >= 2.4) return 'A'
  if (score >= 1.4) return 'B'
  return 'C'
}

// ── Types ──────────────────────────────────────────────────────────────────

interface SourceWeapon {
  weapon_name: string
  tier: string           // S/A/B/C from this source
  tier_score: number     // 1-4 numeric score
  category: string
  ranking?: number
  image_url?: string
  game_modes?: string[]
  tactical_cat?: string
  meta_build?: Record<string, string>
  change_type?: 'buff' | 'nerf' | 'new' | null
  changed_at?: Date | null
  source: string         // identifier of the source
}

interface WZWeapon {
  ranking: number
  arma: string
  imagen_url: string
  categoria_tactica: string
  tipo_arma: string
  pick_rate: string | number
  es_nuevo: boolean
  es_buff: boolean
  es_nerfeada: boolean
  modos: string[]
  attachments: Array<{ slot: string; item: string; nivel: string }>
  codigo: string
  timestamp?: string
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

// ── Translation helpers ────────────────────────────────────────────────────

function translateCategory(tipo: string): string {
  const map: Record<string, string> = {
    'Fusil de asalto':    'Assault Rifle',
    'Subfusil':           'SMG',
    'Ametralladora ligera': 'LMG',
    'Fusil de precisión': 'Sniper Rifle',
    'Fusil de tirador':   'Marksman Rifle',
    'Fusil de batalla':   'Battle Rifle',
    'Escopeta':           'Shotgun',
    'Pistola':            'Handgun',
  }
  return map[tipo] ?? tipo ?? 'Assault Rifle'
}

function translateSlot(slot: string): string {
  const map: Record<string, string> = {
    'Boca de Cañón': 'Muzzle', 'Bocacha': 'Muzzle',
    'Cañón': 'Barrel',
    'Óptica': 'Optic',
    'Culata': 'Stock',
    'Acople inferior': 'Underbarrel',
    'Cargador': 'Magazine',
    'Munición': 'Ammunition',
    'Empuñadura trasera': 'Rear Grip', 'Empuñadura': 'Rear Grip',
    'Láser': 'Laser',
    'Mod. de disparo': 'Fire Mods',
  }
  return map[slot] ?? slot
}

// Matches wzmetaloadouts.com getTier() exactly: S=#1-5, A=#6-15, B=#16-30, C=#31+
function rankToTier(r: number): string {
  if (r <= 5)  return 'S'
  if (r <= 15) return 'A'
  if (r <= 30) return 'B'
  return 'C'
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

// ── Source 1: wzmetaloadouts.com ──────────────────────────────────────────

async function fetchWZMeta(): Promise<SourceWeapon[]> {
  const { data } = await axios.get<WZWeapon[]>(`${WZ_BASE}/meta_warzone.json`, {
    headers: HEADERS, timeout: 10000,
  })
  if (!Array.isArray(data)) return []

  return data.map(w => {
    const tier = rankToTier(w.ranking)
    const metaBuild: Record<string, string> = {}
    for (const att of w.attachments ?? []) {
      metaBuild[translateSlot(att.slot)] = att.item
    }

    let change_type: 'buff' | 'nerf' | 'new' | null = null
    if (w.es_buff)       change_type = 'buff'
    else if (w.es_nerfeada) change_type = 'nerf'
    else if (w.es_nuevo)    change_type = 'new'

    return {
      weapon_name:  w.arma,
      tier,
      tier_score:   TIER_VAL[tier],
      category:     translateCategory(w.tipo_arma),
      ranking:      w.ranking,
      image_url:    `${WZ_BASE}${w.imagen_url.startsWith('/') ? '' : '/'}${w.imagen_url}`,
      game_modes:   w.modos ?? [],
      tactical_cat: w.categoria_tactica ?? null,
      meta_build:   metaBuild,
      change_type,
      changed_at:   change_type ? new Date() : null,
      source:       'wzmetaloadouts',
    } as SourceWeapon
  })
}

// ── Source 2: codmunity.gg tier list ──────────────────────────────────────

interface CodmunityWeapon {
  weapon_name: string
  tier: string
  category: string
  slug: string
}

async function fetchCodmunityTiers(): Promise<CodmunityWeapon[]> {
  const { data: html } = await axios.get('https://codmunity.gg/tier-list/warzone', {
    headers: HEADERS, timeout: 15000,
  })
  const $ = cheerio.load(html)
  const weapons: CodmunityWeapon[] = []
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

      const href = $(el).closest('a').attr('href') ?? ''
      const slug = href.replace('/weapon/bo7/', '')

      weapons.push({ weapon_name: name, tier, category: subtitle || '', slug })
    })
  })

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
    const { data: html } = await axios.get(`https://codmunity.gg/weapon/bo7/${slug}`, {
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

async function enrichWithCodmunityChanges(weapons: CodmunityWeapon[]): Promise<Map<string, { change_type: 'buff' | 'nerf' | 'new' | null; changed_at: Date | null }>> {
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

// ── Source 3: noticias buff/nerf scan ─────────────────────────────────────

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
  wzWeapons: SourceWeapon[],
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

  // Build lookup maps
  const wzMap = new Map(wzWeapons.map(w => [normalizeKey(w.weapon_name), w]))
  const codMap = new Map(codmunityWeapons.map(w => [normalizeKey(w.weapon_name), w]))

  // Collect all unique weapon names from both sources
  const allKeys = new Set([...wzMap.keys(), ...codMap.keys()])

  const RECENT_DAYS = 21
  const results = []

  for (const key of allKeys) {
    const wz  = wzMap.get(key)
    const cod = codMap.get(key)

    // --- Tier aggregation ---
    const tierEntries: number[] = []
    if (wz)  tierEntries.push(TIER_VAL[wz.tier])
    if (cod) tierEntries.push(TIER_VAL[cod.tier])

    const avgScore   = tierEntries.reduce((a, b) => a + b, 0) / tierEntries.length
    const finalTier  = scoreToTier(avgScore)
    const sourcesCount = tierEntries.length

    // --- Best data from available sources ---
    const weapon_name = wz?.weapon_name ?? cod!.weapon_name
    const category    = wz?.category ?? (cod?.category ? cod.category : guessCategory(weapon_name))
    const ranking     = wz?.ranking ?? null
    const image_url   = wz?.image_url ?? null
    const game_modes  = wz?.game_modes ?? []
    const tactical_cat = wz?.tactical_cat ?? null
    const meta_build  = wz?.meta_build && Object.keys(wz.meta_build).length > 0
      ? wz.meta_build
      : null

    // --- Change type: merge all signals ---
    // Priority: wz flags → codmunity dated history → news scan → tier shift
    let change_type: string | null = null
    let changed_at: Date | null = null

    // Signal 1: wzmetaloadouts direct flags
    if (wz?.change_type) {
      change_type = wz.change_type
      changed_at  = wz.changed_at ?? new Date()
    }

    // Signal 2: codmunity dated history (more precise dates)
    const codChange = codmunityChanges.get(weapon_name)
    if (codChange?.change_type && codChange.changed_at) {
      const ageDays = (Date.now() - codChange.changed_at.getTime()) / (1000 * 60 * 60 * 24)
      if (ageDays <= RECENT_DAYS) {
        // If both sources agree on the type, keep it; if only one, use the dated one
        if (!change_type || change_type === codChange.change_type) {
          change_type = codChange.change_type
          changed_at  = codChange.changed_at
        }
      }
    }

    // Signal 3: news scan (weakest signal)
    if (!change_type) {
      const newsHit = newsChanges.get(weapon_name)
      if (newsHit) { change_type = newsHit; changed_at = new Date() }
    }

    results.push({
      weapon_name,
      tier: finalTier,
      tier_score: Math.round(avgScore * 100) / 100,
      category,
      ranking,
      image_url,
      game_modes,
      tactical_cat,
      meta_build,
      change_type,
      changed_at,
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

    // Tier shift detection as final fallback for change_type
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
    const primAtt = Object.fromEntries(
      (c.primaria?.attachments ?? []).map(a => [translateSlot(a.slot), a.item]),
    )
    const secAtt = Object.fromEntries(
      (c.secundaria?.attachments ?? []).map(a => [translateSlot(a.slot), a.item]),
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

  // Fetch all sources concurrently
  const [wzRes, codmunityRes, ventajasRes, clasesRes, noticiasRes] = await Promise.allSettled([
    fetchWZMeta(),
    fetchCodmunityTiers(),
    axios.get<string>(`${WZ_BASE}/ventajas.js`, { headers: HEADERS, timeout: 10000, responseType: 'text' })
      .then(r => evalJSVar(r.data, 'VENTAJAS') as VentajaItem[] ?? []),
    axios.get<string>(`${WZ_BASE}/clases.js`, { headers: HEADERS, timeout: 10000, responseType: 'text' })
      .then(r => evalJSVar(r.data, 'CLASES') as ClaseItem[] ?? []),
    fetchNoticias(),
  ])

  const wzWeapons       = wzRes.status       === 'fulfilled' ? wzRes.value       : []
  const codmunityRaw    = codmunityRes.status === 'fulfilled' ? codmunityRes.value : []
  const ventajas        = ventajasRes.status  === 'fulfilled' ? ventajasRes.value  : []
  const clases          = clasesRes.status    === 'fulfilled' ? clasesRes.value    : []
  const noticias        = noticiasRes.status  === 'fulfilled' ? noticiasRes.value  : []

  if (wzRes.status       === 'rejected') console.warn('[scraper] wzmetaloadouts falló:', (wzRes.reason as Error).message)
  if (codmunityRes.status === 'rejected') console.warn('[scraper] codmunity falló:', (codmunityRes.reason as Error).message)

  console.log(`[scraper] Fuentes: wz=${wzWeapons.length} codmunity=${codmunityRaw.length} ventajas=${ventajas.length} clases=${clases.length} noticias=${noticias.length}`)

  if (wzWeapons.length === 0 && codmunityRaw.length === 0) {
    console.warn('[scraper] Ambas fuentes de armas fallaron — abortando')
    return
  }

  // Fetch codmunity per-weapon buff/nerf history (batched)
  console.log('[scraper] Obteniendo historial buff/nerf de codmunity...')
  const codmunityChanges = codmunityRaw.length > 0
    ? await enrichWithCodmunityChanges(codmunityRaw)
    : new Map()
  console.log(`[scraper] ${codmunityChanges.size} armas con historial de cambios`)

  // Fetch noticias content for additional buff/nerf signals
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

  // Aggregate weapons from all sources
  const aggregated = aggregateWeapons(wzWeapons, codmunityRaw, codmunityChanges, newsChanges)
  console.log(`[scraper] Agregadas ${aggregated.length} armas (${aggregated.filter(w => w.sources_count >= 2).length} en 2+ fuentes)`)

  // Tier distribution log
  const tierDist: Record<string, number> = { S: 0, A: 0, B: 0, C: 0 }
  for (const w of aggregated) tierDist[w.tier] = (tierDist[w.tier] ?? 0) + 1
  console.log(`[scraper] Tiers — S:${tierDist.S} A:${tierDist.A} B:${tierDist.B} C:${tierDist.C}`)

  // Save everything
  await saveWeapons(aggregated)
  if (ventajas.length) await savePerks(ventajas)
  if (clases.length)   await saveClases(clases)
  if (noticias.length) await saveNoticias(noticias, contentMap)

  console.log(`[scraper] Completado — ${aggregated.length} armas, ${ventajas.length} ventajas, ${clases.length} clases, ${noticias.length} noticias`)
}
