import axios from 'axios'
import * as cheerio from 'cheerio'
import vm from 'vm'
import { query } from './db'

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
}

const BASE = 'https://wzmetaloadouts.com'

// ── Types ──────────────────────────────────────────────────────────────────

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

// ── Helpers ────────────────────────────────────────────────────────────────

// Matches wzmetaloadouts.com getTier() exactly: S=#1-5, A=#6-15, B=#16-30, C=#31+
function rankToTier(r: number): string {
  if (r <= 5)  return 'S'
  if (r <= 15) return 'A'
  if (r <= 30) return 'B'
  return 'C'
}

function translateCategory(tipo: string): string {
  const map: Record<string, string> = {
    'Fusil de asalto':   'Assault Rifle',
    'Subfusil':          'SMG',
    'Ametralladora ligera': 'LMG',
    'Fusil de precisión': 'Sniper Rifle',
    'Fusil de tirador':  'Marksman Rifle',
    'Fusil de batalla':  'Battle Rifle',
    'Escopeta':          'Shotgun',
    'Pistola':           'Handgun',
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

// Safely evaluate a JS file that declares a top-level variable
function evalJSVar(js: string, varName: string): unknown {
  // Replace 'const VARNAME =' with 'var VARNAME =' (file may have leading comments)
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

// ── Source 1: meta_warzone.json ────────────────────────────────────────────

async function fetchWeapons(): Promise<WZWeapon[]> {
  const { data } = await axios.get<WZWeapon[]>(`${BASE}/meta_warzone.json`, {
    headers: HEADERS, timeout: 10000,
  })
  return Array.isArray(data) ? data : []
}

// ── Source 2: ventajas.js ──────────────────────────────────────────────────

async function fetchVentajas(): Promise<VentajaItem[]> {
  const { data: js } = await axios.get<string>(`${BASE}/ventajas.js`, {
    headers: HEADERS, timeout: 10000, responseType: 'text',
  })
  const result = evalJSVar(js, 'VENTAJAS')
  return Array.isArray(result) ? result as VentajaItem[] : []
}

// ── Source 3: clases.js ────────────────────────────────────────────────────

async function fetchClases(): Promise<ClaseItem[]> {
  const { data: js } = await axios.get<string>(`${BASE}/clases.js`, {
    headers: HEADERS, timeout: 10000, responseType: 'text',
  })
  const result = evalJSVar(js, 'CLASES')
  return Array.isArray(result) ? result as ClaseItem[] : []
}

// ── Source 4: noticias-index.json + articles ───────────────────────────────

async function fetchNoticias(): Promise<NoticiaIndex[]> {
  const { data } = await axios.get<NoticiaIndex[]>(`${BASE}/noticias-index.json`, {
    headers: HEADERS, timeout: 10000,
  })
  return Array.isArray(data) ? data : []
}

async function fetchArticleContent(url: string): Promise<string> {
  try {
    const { data: html } = await axios.get(`${BASE}${url}`, {
      headers: HEADERS, timeout: 12000,
    })
    const $ = cheerio.load(html)
    return $('.noticia-cuerpo').text().trim().slice(0, 8000)
  } catch {
    return ''
  }
}

// Extract weapon buff/nerf mentions from article text
function extractWeaponChanges(text: string): Map<string, 'buff' | 'nerf'> {
  const changes = new Map<string, 'buff' | 'nerf'>()
  const buffKeywords  = /buffead|mejorad|potenciad|aumentad|increment|fortalecid|subid/i
  const nerfKeywords  = /nerfeada|nerfeado|reducid|debilitad|bajad|empeorad|disminuid/i

  // Look for sentences mentioning weapons near buff/nerf words
  const sentences = text.split(/[.\n]/)
  for (const sent of sentences) {
    const type = buffKeywords.test(sent) ? 'buff' : nerfKeywords.test(sent) ? 'nerf' : null
    if (!type) continue
    // Extract weapon names (capitalized words 3-30 chars, may have numbers/spaces)
    const words = sent.match(/[A-Z][A-Za-z0-9\- ]{2,29}(?=\s|$)/g) ?? []
    for (const w of words) {
      const name = w.trim()
      if (name.length >= 3 && !changes.has(name)) changes.set(name, type)
    }
  }
  return changes
}

// ── Persist: weapons ───────────────────────────────────────────────────────

async function saveWeapons(
  weapons: WZWeapon[],
  newsChanges: Map<string, 'buff' | 'nerf'>,
): Promise<void> {
  const existing = await query('SELECT weapon_name, tier FROM weapon_meta')
  const currentMap = new Map(existing.rows.map((r: any) => [r.weapon_name.toLowerCase(), r.tier]))

  const TIER_RANK: Record<string, number> = { S: 4, A: 3, B: 2, C: 1 }

  for (const w of weapons) {
    const tier      = rankToTier(w.ranking)
    const category  = translateCategory(w.tipo_arma)
    const imageUrl  = `${BASE}${w.imagen_url.startsWith('/') ? '' : '/'}${w.imagen_url}`
    const oldTier   = currentMap.get(w.arma.toLowerCase())

    // Build meta_build map
    let metaBuild: Record<string, string> | null = null
    if (w.attachments?.length) {
      metaBuild = {}
      for (const att of w.attachments) {
        metaBuild[translateSlot(att.slot)] = att.item
      }
    }

    // Determine change_type — direct flags first, then news, then tier shift
    let changeType: string | null = null
    let changedAt: Date | null = null
    const now = new Date()

    if (w.es_buff)      { changeType = 'buff'; changedAt = now }
    else if (w.es_nerfeada) { changeType = 'nerf'; changedAt = now }
    else if (w.es_nuevo)    { changeType = 'new';  changedAt = now }

    if (!changeType) {
      const newsHit = newsChanges.get(w.arma)
      if (newsHit) { changeType = newsHit; changedAt = now }
    }

    if (!changeType && oldTier) {
      const o = TIER_RANK[oldTier?.toUpperCase()] ?? 0
      const n = TIER_RANK[tier.toUpperCase()] ?? 0
      if (n > o)      { changeType = 'buff'; changedAt = now }
      else if (n < o) { changeType = 'nerf'; changedAt = now }
    }

    const buildParam = metaBuild ? JSON.stringify(metaBuild) : null
    const gameModes  = w.modos ?? []
    const tactCat    = w.categoria_tactica ?? null

    if (oldTier !== undefined) {
      await query(
        `UPDATE weapon_meta
         SET tier=$1, category=$2, updated_at=NOW(), image_url=$3,
             change_type=$4::varchar,
             changed_at=CASE WHEN $4::varchar IS NOT NULL THEN $5 ELSE changed_at END,
             ranking=$6, game_modes=$7, tactical_cat=$8
             ${buildParam ? ', meta_build=$9' : ''}
         WHERE LOWER(weapon_name)=${buildParam ? '$10' : '$9'}`,
        buildParam
          ? [tier, category, imageUrl, changeType, changedAt, w.ranking, gameModes, tactCat, buildParam, w.arma.toLowerCase()]
          : [tier, category, imageUrl, changeType, changedAt, w.ranking, gameModes, tactCat, w.arma.toLowerCase()],
      )
    } else {
      await query(
        `INSERT INTO weapon_meta (weapon_name, tier, category, pick_rate, image_url, change_type, changed_at, ranking, game_modes, tactical_cat, meta_build)
         VALUES ($1,$2,$3,0,$4,$5::varchar,$6,$7,$8,$9,$10)
         ON CONFLICT (weapon_name) DO NOTHING`,
        [w.arma, tier, category, imageUrl, changeType, changedAt, w.ranking, gameModes, tactCat, buildParam ? JSON.parse(buildParam) : {}],
      )
    }
  }
}

// ── Persist: perks ─────────────────────────────────────────────────────────

async function savePerks(ventajas: VentajaItem[]): Promise<void> {
  for (const v of ventajas) {
    const cat      = v.slot   // "PERK 1" / "PERK 2" / "PERK 3"
    const category = cat.replace('PERK ', 'Perk ')
    const iconUrl  = `${BASE}/${v.icon}`

    await query(
      `INSERT INTO perk_meta (perk_name, category, tier, description, image_url, updated_at)
       VALUES ($1,$2,$3,$4,$5,NOW())
       ON CONFLICT (perk_name) DO UPDATE
         SET category=$2, tier=$3, description=$4, image_url=$5, updated_at=NOW()`,
      [v.nombre_en || v.nombre, category, v.tier, v.descripcion, iconUrl],
    )
  }
}

// ── Persist: clases ────────────────────────────────────────────────────────

async function saveClases(clases: ClaseItem[]): Promise<void> {
  for (const c of clases) {
    const primAtt  = Object.fromEntries(
      (c.primaria?.attachments ?? []).map(a => [translateSlot(a.slot), a.item]),
    )
    const secAtt   = Object.fromEntries(
      (c.secundaria?.attachments ?? []).map(a => [translateSlot(a.slot), a.item]),
    )
    // Support both 'nombre' and 'arma' field names for weapon name
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
      [
        c.nombre, c.estilo, c.descripcion, c.dificultad,
        c.modos ?? [], c.color ?? null,
        primArma, primAtt,
        secArma, secAtt,
        c.stats ?? {},
      ],
    )
  }
}

// ── Persist: noticias ──────────────────────────────────────────────────────

async function saveNoticias(
  list: NoticiaIndex[],
  contentMap: Map<string, string>,
): Promise<void> {
  for (const n of list) {
    const fecha   = n.date ? new Date(n.date) : null
    const imgUrl  = n.imagen ? `${BASE}${n.imagen.startsWith('/') ? '' : '/'}${n.imagen}` : null
    const content = contentMap.get(n.slug) ?? ''

    await query(
      `INSERT INTO meta_noticias (slug, titulo, resumen, imagen_url, categoria, fecha, contenido, destacada, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW())
       ON CONFLICT (slug) DO UPDATE
         SET titulo=$2, resumen=$3, imagen_url=$4, categoria=$5,
             fecha=$6, contenido=$7, destacada=$8, updated_at=NOW()`,
      [n.slug, n.titulo, n.resumen, imgUrl, n.categoria, fecha, content, n.destacada ?? false],
    )
  }
}

// ── Main ───────────────────────────────────────────────────────────────────

export async function scrapeWeaponMeta(): Promise<void> {
  console.log('[scraper] Iniciando scrape desde wzmetaloadouts.com...')

  // Fetch all sources concurrently
  const [weaponsRes, ventajasRes, clasesRes, noticiasRes] = await Promise.allSettled([
    fetchWeapons(),
    fetchVentajas(),
    fetchClases(),
    fetchNoticias(),
  ])

  const weapons  = weaponsRes.status  === 'fulfilled' ? weaponsRes.value  : []
  const ventajas = ventajasRes.status === 'fulfilled' ? ventajasRes.value : []
  const clases   = clasesRes.status   === 'fulfilled' ? clasesRes.value   : []
  const noticias = noticiasRes.status === 'fulfilled' ? noticiasRes.value : []

  if (weaponsRes.status  === 'rejected') console.warn('[scraper] meta_warzone.json falló:', (weaponsRes.reason as Error).message)
  if (ventajasRes.status === 'rejected') console.warn('[scraper] ventajas.js falló:', (ventajasRes.reason as Error).message)
  if (clasesRes.status   === 'rejected') console.warn('[scraper] clases.js falló:', (clasesRes.reason as Error).message)
  if (noticiasRes.status === 'rejected') console.warn('[scraper] noticias-index.json falló:', (noticiasRes.reason as Error).message)

  console.log(`[scraper] weapons:${weapons.length} ventajas:${ventajas.length} clases:${clases.length} noticias:${noticias.length}`)

  if (weapons.length === 0) {
    console.warn('[scraper] Sin armas — abortando')
    return
  }

  // Fetch article content (up to 5 most recent, in parallel batches of 2)
  const newsChanges = new Map<string, 'buff' | 'nerf'>()
  const contentMap  = new Map<string, string>()

  const recent = noticias.slice(0, 5)
  for (let i = 0; i < recent.length; i += 2) {
    const batch = recent.slice(i, i + 2)
    const results = await Promise.allSettled(
      batch.map(n => fetchArticleContent(n.url).then(txt => ({ slug: n.slug, txt }))),
    )
    for (const r of results) {
      if (r.status === 'rejected') continue
      const { slug, txt } = r.value
      contentMap.set(slug, txt)
      for (const [name, type] of extractWeaponChanges(txt)) {
        if (!newsChanges.has(name)) newsChanges.set(name, type)
      }
    }
    if (i + 2 < recent.length) await new Promise(r => setTimeout(r, 400))
  }

  console.log(`[scraper] ${newsChanges.size} cambios adicionales detectados en noticias`)

  // Persist all
  await saveWeapons(weapons, newsChanges)
  if (ventajas.length) await savePerks(ventajas)
  if (clases.length)   await saveClases(clases)
  if (noticias.length) await saveNoticias(noticias, contentMap)

  console.log(`[scraper] Completado — ${weapons.length} armas, ${ventajas.length} ventajas, ${clases.length} clases, ${noticias.length} noticias`)
}
