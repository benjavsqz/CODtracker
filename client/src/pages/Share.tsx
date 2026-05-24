import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../lib/api'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Loadout {
  id: number
  name: string
  weapon_name: string | null
  category: string | null
  attachments: Record<string, string>
  secondary_weapon: string | null
  secondary_category: string | null
  secondary_attachments: Record<string, string>
  tactical: string | null
  lethal: string | null
  melee: string | null
  perk1: string | null
  perk2: string | null
  perk3: string | null
  cod_share_code: string | null
  notes: string | null
  is_public: boolean
  username: string
}

interface WeaponMeta {
  weapon_name: string
  tier: string
  category: string
  image_url: string | null
}

interface PerkMeta {
  perk_name: string
  category: string
  tier: string
  image_url: string | null
}

interface EquipMeta {
  name: string
  category: string
  image_url: string | null
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SLOT_ES: Record<string, string> = {
  Muzzle: 'Bocacha', Barrel: 'Cañón', Optic: 'Mira',
  Stock: 'Culata', Underbarrel: 'Acople', Magazine: 'Cargador',
  Ammunition: 'Munición', 'Rear Grip': 'Empuñadura',
  Laser: 'Láser', 'Fire Mods': 'Mod. Disparo',
}

const SLOT_CLR: Record<string, string> = {
  Muzzle:       'text-orange-400 bg-orange-500/10 border-orange-500/25',
  Barrel:       'text-sky-400 bg-sky-500/10 border-sky-500/25',
  Optic:        'text-teal-400 bg-teal-500/10 border-teal-500/25',
  Stock:        'text-purple-400 bg-purple-500/10 border-purple-500/25',
  Underbarrel:  'text-green-400 bg-green-500/10 border-green-500/25',
  Magazine:     'text-rose-400 bg-rose-500/10 border-rose-500/25',
  Ammunition:   'text-yellow-400 bg-yellow-500/10 border-yellow-500/25',
  'Rear Grip':  'text-amber-400 bg-amber-500/10 border-amber-500/25',
  Laser:        'text-cyan-400 bg-cyan-500/10 border-cyan-500/25',
  'Fire Mods':  'text-pink-400 bg-pink-500/10 border-pink-500/25',
}

const CAT_COLOR: Record<string, string> = {
  'Assault Rifle':   'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  SMG:               'text-sky-400 bg-sky-500/10 border-sky-500/20',
  LMG:               'text-amber-400 bg-amber-500/10 border-amber-500/20',
  'Sniper Rifle':    'text-rose-400 bg-rose-500/10 border-rose-500/20',
  'Marksman Rifle':  'text-orange-400 bg-orange-500/10 border-orange-500/20',
  'Battle Rifle':    'text-purple-400 bg-purple-500/10 border-purple-500/20',
  Shotgun:           'text-pink-400 bg-pink-500/10 border-pink-500/20',
  Handgun:           'text-gray-400 bg-gray-500/10 border-gray-500/20',
}

const TIER_BADGE: Record<string, string> = {
  S: 'text-yellow-300 border-yellow-400/40 bg-yellow-400/10',
  A: 'text-green-300 border-green-400/40 bg-green-400/10',
  B: 'text-blue-300 border-blue-400/40 bg-blue-400/10',
  C: 'text-gray-400 border-gray-600/40 bg-gray-600/10',
}

const PERK_CLR: Record<string, string> = {
  'Perk 1': 'border-sky-400/30 bg-sky-400/5 text-sky-400',
  'Perk 2': 'border-rose-400/30 bg-rose-400/5 text-rose-400',
  'Perk 3': 'border-amber-400/30 bg-amber-400/5 text-amber-400',
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function WeaponCard({
  label, weaponName, category, attachments, meta, onExpand,
}: {
  label: string
  weaponName: string | null
  category: string | null
  attachments: Record<string, string>
  meta: WeaponMeta | null
  onExpand: () => void
}) {
  const [imgErr, setImgErr] = useState(false)
  const attCount = Object.values(attachments).filter(Boolean).length

  if (!weaponName) {
    return (
      <div className="rounded-xl border border-white/[0.05] flex flex-col">
        <div className="px-3 py-1.5 border-b border-white/[0.04]">
          <span className="text-[8px] font-bold uppercase tracking-widest text-white/20">{label}</span>
        </div>
        <div className="h-20 flex items-center justify-center">
          <span className="text-white/10 text-xs uppercase tracking-widest">Sin arma</span>
        </div>
      </div>
    )
  }

  return (
    <motion.button whileTap={{ scale: 0.99 }} onClick={onExpand}
      className="w-full rounded-xl border border-white/[0.08] hover:border-white/[0.18] overflow-hidden transition-all group text-left"
      style={{ background: 'rgba(255,255,255,.025)' }}>

      <div className="px-3 pt-2.5 pb-2 flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            <span className="text-[7px] font-bold uppercase tracking-widest text-white/20 border border-white/[0.07] px-1.5 py-0.5 rounded">
              {label}
            </span>
            {category && (
              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wide ${CAT_COLOR[category] ?? ''}`}>
                {category}
              </span>
            )}
            {meta?.tier && (
              <span className={`text-[8px] px-1 py-0.5 rounded border font-black ${TIER_BADGE[meta.tier] ?? TIER_BADGE.C}`}>
                {meta.tier}
              </span>
            )}
          </div>
          <p className="text-white font-black text-sm leading-tight tracking-tight truncate">
            {weaponName.toUpperCase()}
          </p>
        </div>
        <span className="text-[7px] text-white/15 border border-white/[0.07] px-1.5 py-0.5 rounded font-bold tracking-widest shrink-0 mt-0.5">
          BO7
        </span>
      </div>

      <div className="relative mx-3 rounded-lg overflow-hidden"
        style={{ height: '80px', background: 'linear-gradient(135deg, rgba(255,255,255,.01) 0%, rgba(255,255,255,.05) 100%)' }}>
        {meta?.image_url && !imgErr ? (
          <img src={meta.image_url} alt={weaponName}
            onError={() => setImgErr(true)}
            className="h-full w-full object-contain drop-shadow-2xl" />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <span className="text-white/10 text-lg font-black tracking-widest">
              {weaponName.slice(0, 3).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      <div className="px-3 py-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < attCount ? 'bg-white/50' : 'bg-white/[0.08]'}`} />
          ))}
          <span className="text-[9px] text-white/20 ml-1">{attCount}/5</span>
        </div>
        <span className="text-[9px] text-white/20 group-hover:text-white/50 transition-colors">
          Ver accesorios →
        </span>
      </div>
    </motion.button>
  )
}

function AttachmentSheet({
  weaponName, category, attachments, meta, onClose,
}: {
  weaponName: string
  category: string | null
  attachments: Record<string, string>
  meta: WeaponMeta | null
  onClose: () => void
}) {
  const [imgErr, setImgErr] = useState(false)
  const entries = Object.entries(attachments).filter(([, v]) => v)

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="relative z-10 w-full max-w-sm mx-4 mb-4 sm:mb-0 rounded-2xl overflow-hidden"
        style={{ background: 'rgba(9,9,16,.98)', border: '1px solid rgba(255,255,255,.1)' }}
        onClick={e => e.stopPropagation()}>

        <div className="px-4 pt-4 pb-3 flex items-start gap-3 border-b border-white/[0.06]">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {category && (
                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wide ${CAT_COLOR[category] ?? ''}`}>
                  {category}
                </span>
              )}
              {meta?.tier && (
                <span className={`text-[8px] px-1.5 py-0.5 rounded border font-black ${TIER_BADGE[meta.tier] ?? TIER_BADGE.C}`}>
                  {meta.tier}
                </span>
              )}
              <span className="text-[7px] text-white/20 border border-white/[0.07] px-1.5 py-0.5 rounded font-bold tracking-widest">BO7</span>
            </div>
            <p className="text-white font-black text-xl leading-tight tracking-tight">{weaponName}</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center text-white/40 hover:text-white transition-all shrink-0 text-sm">
            ✕
          </button>
        </div>

        <div className="h-28 flex items-center justify-center px-8 py-2"
          style={{ background: 'linear-gradient(150deg, rgba(255,255,255,.01) 0%, rgba(255,255,255,.04) 100%)' }}>
          {meta?.image_url && !imgErr ? (
            <img src={meta.image_url} alt={weaponName} onError={() => setImgErr(true)}
              className="h-full w-full object-contain drop-shadow-2xl" />
          ) : (
            <span className="text-white/[0.08] text-4xl font-black tracking-widest">
              {weaponName.slice(0, 3).toUpperCase()}
            </span>
          )}
        </div>

        <div className="px-4 pb-5">
          <p className="text-[8px] text-white/25 uppercase tracking-widest mb-2.5">
            Accesorios · {entries.length} equipado{entries.length !== 1 ? 's' : ''}
          </p>
          {entries.length === 0 ? (
            <p className="text-white/20 text-sm text-center py-5">Sin accesorios configurados</p>
          ) : (
            <div className="space-y-1.5">
              {entries.map(([slot, name]) => (
                <div key={slot}
                  className="flex items-center gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5">
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wide shrink-0 ${SLOT_CLR[slot] ?? 'text-gray-400 bg-gray-500/10 border-gray-500/25'}`}>
                    {SLOT_ES[slot] ?? slot}
                  </span>
                  <span className="text-sm font-bold text-white flex-1 min-w-0 truncate">{name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

function SlotBox({ label, name, iconType, meta }: {
  label: string
  name: string | null
  iconType: 'tactical' | 'lethal'
  meta: EquipMeta | null
}) {
  const [imgErr, setImgErr] = useState(false)
  const cfgMap = {
    tactical: { icon: '💊', clr: 'border-sky-500/25 bg-sky-500/5' },
    lethal:   { icon: '💣', clr: 'border-rose-500/25 bg-rose-500/5' },
  }
  const { icon, clr } = cfgMap[iconType]
  return (
    <div className={`flex-1 rounded-xl border p-2.5 ${name ? clr : 'border-white/[0.05] bg-white/[0.01]'}`}>
      <p className="text-[7px] font-bold uppercase tracking-widest text-white/25 mb-1.5">{label}</p>
      <div className="flex items-center gap-1.5">
        {meta?.image_url && !imgErr ? (
          <img src={meta.image_url} alt={name ?? ''} onError={() => setImgErr(true)}
            className="w-5 h-5 object-contain shrink-0" />
        ) : (
          <span className="text-base leading-none shrink-0">{icon}</span>
        )}
        <span className={`text-[11px] font-bold truncate ${name ? 'text-white' : 'text-white/15'}`}>
          {name ?? '—'}
        </span>
      </div>
    </div>
  )
}

function PerkBox({ label, perkName, perkMeta, slot }: {
  label: string
  perkName: string | null
  perkMeta: PerkMeta | undefined
  slot: string
}) {
  const [imgErr, setImgErr] = useState(false)
  const clr = PERK_CLR[slot] ?? 'border-white/[0.08] bg-white/[0.01]'
  return (
    <div className={`flex-1 rounded-xl border p-2 flex flex-col items-center gap-1.5 ${perkName ? clr : 'border-white/[0.05] bg-white/[0.01]'}`}>
      <p className="text-[7px] font-bold uppercase tracking-widest text-white/25">{label}</p>
      <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center ${perkName ? clr : 'border-white/[0.07]'}`}>
        {perkMeta?.image_url && !imgErr ? (
          <img src={perkMeta.image_url} alt={perkName ?? ''} onError={() => setImgErr(true)}
            className="w-6 h-6 object-contain" />
        ) : (
          <span className="text-[10px] font-black text-white/20">
            {perkName ? perkName.slice(0, 2).toUpperCase() : '?'}
          </span>
        )}
      </div>
      <span className={`text-[9px] font-bold text-center leading-tight line-clamp-2 ${perkName ? 'text-white' : 'text-white/15'}`}>
        {perkName?.toUpperCase() ?? '—'}
      </span>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Share() {
  const { slug } = useParams<{ slug: string }>()
  const [loadout, setLoadout] = useState<Loadout | null>(null)
  const [weaponMetaMap, setWeaponMetaMap] = useState<Record<string, WeaponMeta>>({})
  const [perkMetaMap, setPerkMetaMap]     = useState<Record<string, PerkMeta>>({})
  const [equipMetaMap, setEquipMetaMap]   = useState<Record<string, EquipMeta>>({})
  const [loading, setLoading]             = useState(true)
  const [notFound, setNotFound]           = useState(false)
  const [expandedWeapon, setExpandedWeapon] = useState<'primary' | 'secondary' | null>(null)
  const [copied, setCopied]               = useState(false)
  const [linkCopied, setLinkCopied]       = useState(false)

  useEffect(() => {
    Promise.all([
      api.get(`/loadouts/share/${slug}`),
      api.get<WeaponMeta[]>('/meta'),
      api.get<PerkMeta[]>('/meta/perks'),
      api.get<EquipMeta[]>('/meta/equipment'),
    ])
      .then(([lRes, wRes, pRes, eRes]) => {
        setLoadout(lRes.data)
        const wMap: Record<string, WeaponMeta> = {}
        wRes.data.forEach(w => { wMap[w.weapon_name] = w })
        setWeaponMetaMap(wMap)
        const pMap: Record<string, PerkMeta> = {}
        pRes.data.forEach(p => { pMap[p.perk_name] = p })
        setPerkMetaMap(pMap)
        const eMap: Record<string, EquipMeta> = {}
        eRes.data.forEach(e => { eMap[e.name] = e })
        setEquipMetaMap(eMap)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [slug])

  const copyCode = () => {
    if (!loadout?.cod_share_code) return
    navigator.clipboard.writeText(loadout.cod_share_code)
    setCopied(true); setTimeout(() => setCopied(false), 2500)
  }

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setLinkCopied(true); setTimeout(() => setLinkCopied(false), 2500)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#080810' }}>
      <div className="space-y-4 w-full max-w-2xl px-4">
        <div className="h-8 w-48 rounded-xl bg-white/[0.05] animate-pulse" />
        <div className="h-4 w-64 rounded-lg bg-white/[0.04] animate-pulse" />
        <div className="h-40 rounded-xl bg-white/[0.03] animate-pulse mt-4" />
        <div className="h-40 rounded-xl bg-white/[0.03] animate-pulse" />
      </div>
    </div>
  )

  if (notFound) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3" style={{ background: '#080810' }}>
      <span className="text-5xl">🔍</span>
      <p className="text-white/60 text-lg font-bold">Loadout no encontrado</p>
      <p className="text-white/25 text-sm">El link puede haber expirado o el loadout fue hecho privado</p>
      <Link to="/" className="mt-4 text-emerald-400 hover:underline text-sm">← Ir al inicio</Link>
    </div>
  )

  const l = loadout!
  const primaryMeta    = l.weapon_name ? (weaponMetaMap[l.weapon_name] ?? null) : null
  const secondaryMeta  = l.secondary_weapon ? (weaponMetaMap[l.secondary_weapon] ?? null) : null
  const expandedMeta   = expandedWeapon === 'primary' ? primaryMeta : secondaryMeta

  return (
    <div className="min-h-screen" style={{ background: '#080810' }}>
      {/* Watermark — same skull as in-app Layout */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
        style={{ opacity: 0.06, zIndex: 0 }}>
        <img src="/favicon.svg" alt="" style={{ width: '100vmax', height: '100vmax', objectFit: 'contain' }} />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-6 sm:py-10">

        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-3 mb-6">
          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/25 mb-1">
              META WZ · Loadout compartido
            </p>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight truncate">
              {l.name.toUpperCase()}
            </h1>
            {(l.weapon_name || l.secondary_weapon) && (
              <p className="text-sm text-white/35 mt-1">
                {[l.weapon_name, l.secondary_weapon].filter(Boolean).join(' · ')}
              </p>
            )}
            <p className="text-xs text-white/20 mt-0.5">por {l.username}</p>
          </div>

          <button onClick={copyLink}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
              linkCopied
                ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                : 'bg-white/[0.05] border-white/[0.08] text-white/40 hover:text-white/70 hover:bg-white/[0.08]'
            }`}>
            <span>{linkCopied ? '✓' : '🔗'}</span>
            <span className="hidden sm:inline">{linkCopied ? 'Copiado' : 'Copiar link'}</span>
          </button>
        </div>

        {/* ── Weapon Cards ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <WeaponCard
            label="Arma Primaria"
            weaponName={l.weapon_name}
            category={l.category}
            attachments={l.attachments ?? {}}
            meta={primaryMeta}
            onExpand={() => setExpandedWeapon('primary')}
          />
          <WeaponCard
            label="Arma Secundaria"
            weaponName={l.secondary_weapon}
            category={l.secondary_category}
            attachments={l.secondary_attachments ?? {}}
            meta={secondaryMeta}
            onExpand={() => setExpandedWeapon('secondary')}
          />
        </div>

        {/* ── Equipment ───────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <SlotBox label="Táctico" name={l.tactical} iconType="tactical" meta={l.tactical ? (equipMetaMap[l.tactical] ?? null) : null} />
          <SlotBox label="Letal"   name={l.lethal}   iconType="lethal"   meta={l.lethal   ? (equipMetaMap[l.lethal]   ?? null) : null} />
        </div>

        {/* ── Perks ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <PerkBox label="Perk 1" perkName={l.perk1} perkMeta={l.perk1 ? perkMetaMap[l.perk1] : undefined} slot="Perk 1" />
          <PerkBox label="Perk 2" perkName={l.perk2} perkMeta={l.perk2 ? perkMetaMap[l.perk2] : undefined} slot="Perk 2" />
          <PerkBox label="Perk 3" perkName={l.perk3} perkMeta={l.perk3 ? perkMetaMap[l.perk3] : undefined} slot="Perk 3" />
        </div>

        {/* ── Notes ───────────────────────────────────────────────── */}
        {l.notes && (
          <div className="mb-4 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
            <p className="text-[8px] font-bold uppercase tracking-widest text-white/25 mb-1.5">Notas</p>
            <p className="text-sm text-white/60 leading-relaxed">{l.notes}</p>
          </div>
        )}

        {/* ── Share Code ──────────────────────────────────────────── */}
        {l.cod_share_code && (
          <button onClick={copyCode}
            className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all border mb-4 ${
              copied
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
            }`}>
            {copied ? '✓ Código copiado — pégalo en COD' : '📋 Copiar Share Code para COD'}
          </button>
        )}

        {/* ── Footer ──────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
            <span className="text-xs text-white/30">Público — compartible con link</span>
          </div>
          <Link to="/meta"
            className="text-xs text-white/25 hover:text-emerald-400 transition-colors">
            Crear tu propio tracker →
          </Link>
        </div>
      </div>

      {/* ── Attachment Sheet ────────────────────────────────────────── */}
      <AnimatePresence>
        {expandedWeapon && (
          <AttachmentSheet
            weaponName={expandedWeapon === 'primary' ? (l.weapon_name ?? '') : (l.secondary_weapon ?? '')}
            category={expandedWeapon === 'primary' ? l.category : l.secondary_category}
            attachments={expandedWeapon === 'primary' ? (l.attachments ?? {}) : (l.secondary_attachments ?? {})}
            meta={expandedMeta}
            onClose={() => setExpandedWeapon(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
