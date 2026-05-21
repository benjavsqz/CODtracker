import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'

// meta_build values can be the old string format OR new {name,level} format
type AttVal = string | { name: string; level: number }
const attName  = (v: AttVal) => typeof v === 'string' ? v : v.name
const attLevel = (v: AttVal): number | null => typeof v === 'string' ? null : v.level

interface WeaponMeta {
  weapon_name: string
  tier: string
  category: string
  pick_rate: number
  meta_build: Record<string, AttVal>
  image_url: string | null
  recent_change: 'buff' | 'nerf' | 'new' | null
  max_level: number | null
  updated_at: string | null
}

const TIERS = ['S', 'A', 'B', 'C'] as const

const TIER_CFG: Record<string, {
  badge: string; label: string; cssClass: string
  bar: string; heading: string; dot: string
}> = {
  S: { badge: 'text-yellow-300 border-yellow-400/40 bg-yellow-400/10', label: 'text-yellow-400', cssClass: 'tier-s', bar: 'bg-yellow-400', heading: 'from-yellow-300 to-amber-500', dot: 'bg-yellow-400' },
  A: { badge: 'text-green-300 border-green-400/40 bg-green-400/10',   label: 'text-green-400',  cssClass: 'tier-a', bar: 'bg-green-400',  heading: 'from-green-300 to-emerald-500', dot: 'bg-green-400' },
  B: { badge: 'text-blue-300 border-blue-400/40 bg-blue-400/10',      label: 'text-blue-400',   cssClass: 'tier-b', bar: 'bg-blue-400',   heading: 'from-blue-300 to-sky-500',     dot: 'bg-blue-400' },
  C: { badge: 'text-gray-400 border-gray-600/40 bg-gray-600/10',      label: 'text-gray-400',   cssClass: 'tier-c', bar: 'bg-gray-500',   heading: 'from-gray-400 to-gray-600',    dot: 'bg-gray-500' },
}

const CAT_COLOR: Record<string, string> = {
  'Assault Rifle':  'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  'SMG':            'text-sky-400 bg-sky-500/10 border-sky-500/20',
  'LMG':            'text-amber-400 bg-amber-500/10 border-amber-500/20',
  'Sniper Rifle':   'text-rose-400 bg-rose-500/10 border-rose-500/20',
  'Marksman Rifle': 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  'Battle Rifle':   'text-purple-400 bg-purple-500/10 border-purple-500/20',
  'Shotgun':        'text-pink-400 bg-pink-500/10 border-pink-500/20',
  'Handgun':        'text-gray-400 bg-gray-500/10 border-gray-500/20',
}

const WEAPON_CLASSES: Record<string, string[]> = {
  'Cortas':    ['SMG', 'Shotgun', 'Handgun'],
  'Largas':    ['Assault Rifle', 'Battle Rifle'],
  'Precisión': ['Sniper Rifle', 'Marksman Rifle'],
  'Soporte':   ['LMG'],
}

// Slot display labels (Spanish) & colors
const SLOT_ES: Record<string, string> = {
  'Muzzle':      'Bocacha',
  'Barrel':      'Cañón',
  'Optic':       'Óptica',
  'Stock':       'Culata',
  'Underbarrel': 'Acople',
  'Magazine':    'Revista',
  'Rear Grip':   'Empuñadura',
  'Laser':       'Láser',
  'Fire Mods':   'Mod. Disparo',
}
const SLOT_CLR: Record<string, string> = {
  'Muzzle':      'text-orange-400 bg-orange-500/10 border-orange-500/25',
  'Barrel':      'text-sky-400 bg-sky-500/10 border-sky-500/25',
  'Optic':       'text-teal-400 bg-teal-500/10 border-teal-500/25',
  'Stock':       'text-purple-400 bg-purple-500/10 border-purple-500/25',
  'Underbarrel': 'text-green-400 bg-green-500/10 border-green-500/25',
  'Magazine':    'text-rose-400 bg-rose-500/10 border-rose-500/25',
  'Rear Grip':   'text-amber-400 bg-amber-500/10 border-amber-500/25',
  'Laser':       'text-cyan-400 bg-cyan-500/10 border-cyan-500/25',
  'Fire Mods':   'text-pink-400 bg-pink-500/10 border-pink-500/25',
}

/* ── Animation variants ── */
const containerVariants: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } }
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  show:   { opacity: 1, y: 0, scale: 1, transition: { type: 'spring' as const, stiffness: 260, damping: 22 } },
}
const panelVariants: Variants = {
  hidden: { x: 340, opacity: 0 },
  show:   { x: 0, opacity: 1, transition: { type: 'spring' as const, stiffness: 300, damping: 30 } },
  exit:   { x: 340, opacity: 0, transition: { duration: 0.18 } },
}
const sheetVariants: Variants = {
  hidden: { y: '100%', opacity: 0 },
  show:   { y: 0, opacity: 1, transition: { type: 'spring' as const, stiffness: 280, damping: 28 } },
  exit:   { y: '100%', opacity: 0, transition: { duration: 0.2 } },
}

/* ── Helpers ── */
function WeaponImage({ src, name }: { src: string | null; name: string }) {
  const [err, setErr] = useState(false)
  if (!src || err) return (
    <div className="w-full h-20 flex items-center justify-center">
      <span className="text-white/10 text-xl font-black tracking-widest">{name.slice(0, 3).toUpperCase()}</span>
    </div>
  )
  return <img src={src} alt={name} onError={() => setErr(true)} className="w-full h-20 object-contain drop-shadow-xl" />
}
function SkeletonCard() {
  return (
    <div className="glass rounded-2xl p-3 space-y-2">
      <div className="skeleton h-20 rounded-xl" />
      <div className="skeleton h-3 rounded-full w-3/4" />
      <div className="skeleton h-2.5 rounded-full w-1/2" />
    </div>
  )
}

/* ── Level slider ── */
function LevelSlider({ level, max, onChange, weaponName }: {
  level: number; max: number; onChange: (n: number) => void; weaponName: string
}) {
  const pct = Math.round((level / max) * 100)
  return (
    <div className="px-5 pt-4 pb-3 border-b border-white/[0.05]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">Nivel del Arma</span>
        <div className="flex items-center gap-1.5">
          <span className="text-lg font-black text-white leading-none">{level}</span>
          <span className="text-xs text-white/20">/ {max}</span>
        </div>
      </div>
      <div className="relative h-6 flex items-center">
        {/* Track background */}
        <div className="absolute inset-x-0 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,.07)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(90deg,
                #f87171 0%,
                #fb923c ${Math.min(pct * 0.6, 60)}%,
                #f59e0b ${Math.min(pct * 0.8, 80)}%,
                #ef4444 100%)`,
            }}
            animate={{ width: `${pct}%` }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 30 }}
          />
        </div>
        <input
          type="range" min={1} max={max} value={level}
          onChange={e => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-6"
          aria-label={`Nivel del arma ${weaponName}`}
        />
        {/* Thumb indicator */}
        <motion.div
          className="absolute w-3.5 h-3.5 rounded-full bg-white shadow-lg pointer-events-none"
          style={{ boxShadow: '0 0 8px rgba(255,255,255,.4)' }}
          animate={{ left: `calc(${pct}% - 7px)` }}
          transition={{ type: 'spring' as const, stiffness: 300, damping: 30 }}
        />
      </div>
    </div>
  )
}

/* ── Attachment card ── */
function AttachmentCard({ slot, value, userLevel, index }: {
  slot: string; value: AttVal; userLevel: number; index: number
}) {
  const name  = attName(value)
  const reqLv = attLevel(value)
  const locked = reqLv !== null && userLevel < reqLv
  const slotLabel = SLOT_ES[slot] ?? slot
  const slotColor = SLOT_CLR[slot] ?? 'text-gray-400 bg-gray-500/10 border-gray-500/25'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 + 0.1 }}
      className={`relative rounded-xl px-3 py-2.5 transition-all ${
        locked
          ? 'opacity-40'
          : 'opacity-100'
      }`}
      style={{ background: locked ? 'rgba(255,255,255,.02)' : 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.06)' }}>

      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {/* Slot badge */}
          <span className={`inline-flex items-center text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wide mb-1 ${slotColor}`}>
            {slotLabel}
          </span>
          {/* Attachment name */}
          <p className={`text-sm font-bold leading-tight ${locked ? 'text-white/40 line-through' : 'text-white'}`}>
            {name}
          </p>
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          {/* Level badge */}
          {reqLv !== null && (
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border leading-none ${
              locked
                ? 'text-red-400 bg-red-500/10 border-red-500/25'
                : 'text-green-400 bg-green-500/10 border-green-500/25'
            }`}>
              Nv.{reqLv}
            </span>
          )}
          {/* Lock / check icon */}
          {reqLv !== null && (
            <span className={`text-xs leading-none ${locked ? 'text-red-400' : 'text-green-400'}`}>
              {locked ? '🔒' : '✓'}
            </span>
          )}
        </div>
      </div>

      {locked && (
        <p className="text-[9px] text-red-400/70 mt-0.5">Necesitas nivel {reqLv}</p>
      )}
    </motion.div>
  )
}

/* ── Build display (full panel section) ── */
function BuildDisplay({ build, weaponName, tier, category, userLevel }: {
  build: Record<string, AttVal>
  weaponName: string; tier: string; category: string; userLevel: number
}) {
  const [copied, setCopied] = useState(false)
  // Warzone allows max 5 attachments — show top 5 by unlock level
  const entries = Object.entries(build)
    .filter(([, v]) => attName(v))
    .sort((a, b) => (attLevel(b[1]) ?? 0) - (attLevel(a[1]) ?? 0))
    .slice(0, 5)
    .sort((a, b) => (attLevel(a[1]) ?? 0) - (attLevel(b[1]) ?? 0))
  const hasData = entries.length > 0
  const unlockedCount = entries.filter(([, v]) => {
    const lv = attLevel(v); return lv === null || userLevel >= lv
  }).length

  const copySetup = () => {
    const header = `=== ${weaponName} — Tier ${tier} (${category}) ===`
    const body = hasData
      ? entries.map(([slot, v]) => {
          const lv = attLevel(v)
          const locked = lv !== null && userLevel < lv
          return `${SLOT_ES[slot] ?? slot}: ${locked ? '[BLOQUEADO Nv.' + lv + '] ' : ''}${attName(v)}`
        }).join('\n')
      : '(Build meta próximamente)'
    navigator.clipboard.writeText(`${header}\n${body}`)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex-1 overflow-y-auto min-h-0 px-4 py-3" style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
      {hasData ? (
        <>
          {/* Header row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <p className="text-[10px] text-white/25 uppercase tracking-widest font-semibold">Build Meta</p>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                unlockedCount === entries.length
                  ? 'text-red-400 bg-red-500/10'
                  : 'text-amber-400 bg-amber-500/10'
              }`}>
                {unlockedCount}/{entries.length} desbloqueados · 5 max WZ
              </span>
            </div>
            <motion.button whileTap={{ scale: 0.92 }} onClick={copySetup}
              className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border transition-all ${
                copied
                  ? 'bg-red-500/20 text-red-400 border-red-500/40'
                  : 'bg-white/[0.04] text-white/35 border-white/[0.08] hover:text-white/70 hover:border-white/20'
              }`}>
              {copied ? '✓ Copiado' : '📋 Copiar'}
            </motion.button>
          </div>

          {/* Attachment cards */}
          <div className="space-y-2">
            {entries.map(([slot, value], i) => (
              <AttachmentCard key={slot} slot={slot} value={value} userLevel={userLevel} index={i} />
            ))}
          </div>

        </>
      ) : (
        <div className="text-center py-8">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl opacity-30">🔧</span>
          </div>
          <p className="text-sm text-white/25 font-medium">Build meta próximamente</p>
          <p className="text-xs text-white/15 mt-1">Puedes crear tu propio loadout</p>
        </div>
      )}
    </div>
  )
}

/* ── Weapon panel (shared between desktop & mobile) ── */
function WeaponPanel({ w, onClose, onSave, isAuth }: {
  w: WeaponMeta; onClose: () => void; onSave: (w: WeaponMeta) => void; isAuth: boolean
}) {
  const cfg = TIER_CFG[w.tier] ?? TIER_CFG.C
  const maxLv = w.max_level ?? 50

  const [userLevel, setUserLevel] = useState<number>(() => {
    const saved = localStorage.getItem(`mwz:lv:${w.weapon_name}`)
    return saved ? parseInt(saved) : maxLv
  })

  const handleLevel = (n: number) => {
    setUserLevel(n)
    localStorage.setItem(`mwz:lv:${w.weapon_name}`, String(n))
  }

  return (
    <div className="flex flex-col h-full">
      {/* ─ Header ─ */}
      <div className="px-5 pt-4 pb-3 border-b border-white/[0.06] flex items-start justify-between shrink-0">
        <div className="flex-1 min-w-0">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-lg border inline-block mb-1.5 ${cfg.badge}`}>
            Tier {w.tier}
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base font-bold text-white leading-tight">{w.weapon_name}</h2>
            {w.recent_change && (
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                w.recent_change === 'buff' ? 'bg-green-400/20 text-green-300 border border-green-400/40' :
                w.recent_change === 'nerf' ? 'bg-red-400/20 text-red-300 border border-red-400/40' :
                'bg-blue-400/20 text-blue-300 border border-blue-400/40'
              }`}>
                {w.recent_change === 'buff' ? '↑ BUFF' : w.recent_change === 'nerf' ? '↓ NERF' : '★ NUEVO'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${CAT_COLOR[w.category] ?? ''}`}>
              {w.category}
            </span>
            {w.pick_rate > 0 && (
              <span className={`text-xs ${cfg.label}`}>{w.pick_rate}% pick rate</span>
            )}
          </div>
        </div>
        <button onClick={onClose}
          className="w-7 h-7 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-white/40 hover:text-white transition-all ml-2 text-lg leading-none shrink-0">
          ×
        </button>
      </div>

      {/* ─ Weapon image ─ */}
      {w.image_url && (
        <motion.div initial={{ opacity: 0, scale: 0.93 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="px-5 pt-2 pb-2 shrink-0" style={{ background: 'rgba(255,255,255,.015)' }}>
          <WeaponImage src={w.image_url} name={w.weapon_name} />
        </motion.div>
      )}

      {/* ─ Level slider ─ */}
      <div className="shrink-0">
        <LevelSlider level={userLevel} max={maxLv} onChange={handleLevel} weaponName={w.weapon_name} />
      </div>

      {/* ─ Build ─ */}
      <BuildDisplay
        build={w.meta_build ?? {}}
        weaponName={w.weapon_name}
        tier={w.tier}
        category={w.category}
        userLevel={userLevel}
      />

      {/* ─ Save action ─ */}
      <div className="p-4 border-t border-white/[0.06] shrink-0"
        style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={() => onSave(w)}
          className="w-full py-3 rounded-xl text-sm font-semibold bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25 hover:border-red-400/50 transition-all">
          {isAuth ? '+ Guardar como mi loadout' : '+ Registrarse para guardar'}
        </motion.button>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   Main Dashboard
══════════════════════════════════════════════════════════════ */
export default function Dashboard() {
  const [meta, setMeta]               = useState<WeaponMeta[]>([])
  const [loading, setLoading]         = useState(true)
  const [activeClass, setActiveClass] = useState('Todas')
  const [selected, setSelected]       = useState<WeaponMeta | null>(null)
  const tabsRef                       = useRef<HTMLDivElement>(null)
  const { isAuthenticated }           = useAuth()
  const navigate                      = useNavigate()

  useEffect(() => {
    api.get<WeaponMeta[]>('/meta').then(r => setMeta(r.data)).finally(() => setLoading(false))
  }, [])

  // Lock body scroll when mobile sheet is open
  useEffect(() => {
    if (selected) {
      document.body.style.overflow = 'hidden'
      document.body.style.touchAction = 'none'
    } else {
      document.body.style.overflow = ''
      document.body.style.touchAction = ''
    }
    return () => {
      document.body.style.overflow = ''
      document.body.style.touchAction = ''
    }
  }, [selected])

  const classTabs = ['Todas', ...Object.keys(WEAPON_CLASSES)]
  const filtered  = activeClass === 'Todas' ? meta : meta.filter(w => WEAPON_CLASSES[activeClass]?.includes(w.category))
  const byTier    = (t: string) => filtered.filter(w => w.tier === t)

  const lastUpdated = meta.length
    ? new Date(Math.max(...meta.map(w => w.updated_at ? new Date(w.updated_at).getTime() : 0)))
    : null
  const lastUpdatedStr = lastUpdated
    ? lastUpdated.toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })
    : null

  const goSave = (w: WeaponMeta) => {
    setSelected(null)
    navigate(isAuthenticated ? '/loadouts' : '/register', {
      state: { weapon: w.weapon_name, category: w.category, attachments: w.meta_build }
    })
  }

  return (
    <div className="relative">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Meta de <span className="bg-gradient-to-r from-red-300 to-red-500 bg-clip-text text-transparent">Armas</span>
          </h1>
          <p className="text-xs sm:text-sm text-white/30 mt-1">Warzone · BO7 Season 3 · {meta.length} armas rankeadas</p>
          {lastUpdatedStr && (
            <p className="text-[10px] text-white/20 mt-0.5 flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500/60" />
              Última actualización: {lastUpdatedStr}
            </p>
          )}
        </div>
        {!isAuthenticated && (
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/register')}
            className="hidden sm:block px-4 py-2 text-sm bg-red-500/15 text-red-400 border border-red-500/30 rounded-xl hover:bg-red-500/25 transition-all">
            Guardar loadouts →
          </motion.button>
        )}
      </motion.div>

      {/* Scrollable filter tabs */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        ref={tabsRef}
        className="flex gap-2 mb-6 overflow-x-auto scrollbar-none pb-1">
        {classTabs.map(tab => (
          <motion.button key={tab} whileTap={{ scale: 0.93 }}
            onClick={() => setActiveClass(tab)}
            className={`relative shrink-0 px-4 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeClass === tab
                ? 'text-white bg-white/[0.1] border border-white/20'
                : 'text-white/35 border border-white/[0.06] hover:text-white/70 hover:border-white/15'
            }`}>
            {activeClass === tab && (
              <motion.span layoutId="tab-ind"
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-500/20 to-red-600/10 border border-red-500/30"
                transition={{ type: 'spring' as const, stiffness: 400, damping: 30 }} />
            )}
            <span className="relative">{tab}</span>
          </motion.button>
        ))}
      </motion.div>

      {/* Content — shrinks right on desktop when panel is open */}
      <motion.div
        animate={{ marginRight: selected ? 356 : 0 }}
        transition={{ type: 'spring' as const, stiffness: 300, damping: 30 }}
        className="space-y-8 lg:space-y-10">

        {loading && (
          <div className="space-y-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="skeleton h-6 w-24 rounded-lg" />
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {[...Array(5)].map((_, j) => <SkeletonCard key={j} />)}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && TIERS.map(tier => {
          const weapons = byTier(tier)
          if (!weapons.length) return null
          const cfg = TIER_CFG[tier]
          return (
            <motion.div key={tier} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-1.5 h-7 rounded-full ${cfg.dot}`} />
                <span className={`text-xl sm:text-2xl font-black bg-gradient-to-r ${cfg.heading} bg-clip-text text-transparent`}>
                  Tier {tier}
                </span>
                <span className="text-xs text-white/20 font-medium">{weapons.length} armas</span>
              </div>

              <motion.div variants={containerVariants} initial="hidden" animate="show"
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
                {weapons.map(w => {
                  const isSelected = selected?.weapon_name === w.weapon_name
                  return (
                    <motion.div key={w.weapon_name} variants={cardVariants}
                      whileHover={{ y: -3, transition: { duration: 0.15 } }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setSelected(isSelected ? null : w)}
                      className={`glass rounded-2xl p-2.5 sm:p-3 cursor-pointer transition-all duration-200 ${cfg.cssClass} ${isSelected ? 'ring-1 ring-white/20' : ''}`}>
                      <div className="relative mb-2 rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,.03)' }}>
                        <WeaponImage src={w.image_url} name={w.weapon_name} />
                        {w.recent_change && (
                          <span className={`animate-badge-pop absolute top-1.5 right-1.5 text-[9px] font-black px-1.5 py-0.5 rounded-full leading-none ${
                            w.recent_change === 'buff' ? 'bg-green-400 text-black' :
                            w.recent_change === 'nerf' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
                          }`}>
                            {w.recent_change === 'buff' ? '↑' : w.recent_change === 'nerf' ? '↓' : 'NEW'}
                          </span>
                        )}
                      </div>
                      <p className="font-bold text-white text-xs sm:text-sm leading-tight mb-2 line-clamp-1">{w.weapon_name}</p>
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full border font-medium truncate ${CAT_COLOR[w.category] ?? ''}`}>
                          {w.category}
                        </span>
                        {w.pick_rate > 0 && (
                          <span className={`text-[9px] sm:text-[10px] font-medium shrink-0 ${cfg.label}`}>{w.pick_rate}%</span>
                        )}
                      </div>
                      {w.pick_rate > 0 && (
                        <div className="mt-2 h-px bg-white/[0.06] rounded-full overflow-hidden">
                          <motion.div className={`h-full ${cfg.bar} opacity-60`}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(w.pick_rate * 4, 100)}%` }}
                            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }} />
                        </div>
                      )}
                    </motion.div>
                  )
                })}
              </motion.div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* ─── Desktop side panel ─── */}
      <AnimatePresence>
        {selected && (
          <motion.div key="panel" variants={panelVariants} initial="hidden" animate="show" exit="exit"
            className="hidden lg:flex fixed top-0 right-0 h-full w-[340px] z-40 flex-col"
            style={{
              background: 'linear-gradient(180deg,#0d0d18 0%,#09090f 100%)',
              borderLeft: '1px solid rgba(255,255,255,.07)',
              boxShadow: '-8px 0 40px rgba(0,0,0,.6)',
            }}>
            <WeaponPanel w={selected} onClose={() => setSelected(null)} onSave={goSave} isAuth={isAuthenticated} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Mobile bottom sheet ─── */}
      <AnimatePresence>
        {selected && (
          <motion.div key="sheet" variants={sheetVariants} initial="hidden" animate="show" exit="exit"
            className="lg:hidden fixed bottom-0 left-0 right-0 z-40 rounded-t-3xl flex flex-col"
            style={{
              maxHeight: '85dvh',
              background: 'linear-gradient(180deg,#0d0d18 0%,#09090f 100%)',
              borderTop: '1px solid rgba(255,255,255,.08)',
              boxShadow: '0 -8px 40px rgba(0,0,0,.7)',
              touchAction: 'pan-y',
              overscrollBehavior: 'contain',
            }}>
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full bg-white/10" />
            </div>
            <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
              <WeaponPanel w={selected} onClose={() => setSelected(null)} onSave={goSave} isAuth={isAuthenticated} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      <AnimatePresence>
        {selected && (
          <motion.div key="backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-30 backdrop-blur-sm"
            style={{ touchAction: 'none' }}
            onClick={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}
