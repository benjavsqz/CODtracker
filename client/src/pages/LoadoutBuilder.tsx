import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'
import type { Equipment } from '../types'

type AttVal = string | { name: string; level: number }
const attName = (v: AttVal) => typeof v === 'string' ? v : v.name
const attLevel = (v: AttVal): number | null => typeof v === 'string' ? null : v.level

interface WeaponMeta {
  weapon_name: string; tier: string; category: string
  pick_rate: number; meta_build: Record<string, AttVal>
  image_url: string | null; max_level: number | null
}
interface PerkMeta {
  id: number; perk_name: string; category: string; tier: string
  description: string; image_url: string | null
}

const TIER_BADGE: Record<string, string> = {
  S: 'text-yellow-300 bg-yellow-400/10 border-yellow-400/30',
  A: 'text-green-300 bg-green-400/10 border-green-400/30',
  B: 'text-blue-300 bg-blue-400/10 border-blue-400/30',
  C: 'text-gray-400 bg-gray-600/10 border-gray-600/30',
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
const SLOT_ES: Record<string, string> = {
  Muzzle: 'Bocacha', Barrel: 'Cañón', Optic: 'Óptica', Stock: 'Culata',
  Underbarrel: 'Acople', Magazine: 'Revista', 'Rear Grip': 'Empuñadura',
  Laser: 'Láser', 'Fire Mods': 'Mod. Disparo',
}
const SLOT_CLR: Record<string, string> = {
  Muzzle: 'text-orange-400 bg-orange-500/10 border-orange-500/25',
  Barrel: 'text-sky-400 bg-sky-500/10 border-sky-500/25',
  Optic: 'text-teal-400 bg-teal-500/10 border-teal-500/25',
  Stock: 'text-purple-400 bg-purple-500/10 border-purple-500/25',
  Underbarrel: 'text-green-400 bg-green-500/10 border-green-500/25',
  Magazine: 'text-rose-400 bg-rose-500/10 border-rose-500/25',
  'Rear Grip': 'text-amber-400 bg-amber-500/10 border-amber-500/25',
  Laser: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/25',
  'Fire Mods': 'text-pink-400 bg-pink-500/10 border-pink-500/25',
}
const PERK_CFG: Record<string, { color: string; dot: string }> = {
  'Perk 1': { color: 'border-sky-400/40 bg-sky-400/5',   dot: 'bg-sky-400' },
  'Perk 2': { color: 'border-rose-400/40 bg-rose-400/5', dot: 'bg-rose-400' },
  'Perk 3': { color: 'border-amber-400/40 bg-amber-400/5', dot: 'bg-amber-400' },
}
const EQ_CLR: Record<string, string> = {
  tactical: 'text-sky-400 bg-sky-500/10 border-sky-500/25',
  lethal:   'text-rose-400 bg-rose-500/10 border-rose-500/25',
  melee:    'text-amber-400 bg-amber-500/10 border-amber-500/25',
}

const WEAPON_FILTERS = ['Todas', 'Assault Rifle', 'SMG', 'LMG', 'Sniper Rifle', 'Marksman Rifle', 'Battle Rifle', 'Shotgun', 'Handgun']

const STEPS = ['Primaria', 'Secundaria', 'Equipo', 'Perks', 'Resumen']

/* ── Helpers ── */
function getTop5Atts(build: Record<string, AttVal>): Array<{ slot: string; value: AttVal }> {
  return Object.entries(build)
    .filter(([, v]) => attName(v))
    .sort((a, b) => (attLevel(b[1]) ?? 0) - (attLevel(a[1]) ?? 0))
    .slice(0, 5)
    .map(([slot, value]) => ({ slot, value }))
}

function attsToRecord(atts: Array<{ slot: string; value: AttVal; active: boolean }>): Record<string, string> {
  const r: Record<string, string> = {}
  atts.filter(a => a.active).forEach(a => { r[a.slot] = attName(a.value) })
  return r
}

/* ── Sub-components ── */
function WeaponCard({ w, selected, onClick }: { w: WeaponMeta; selected: boolean; onClick: () => void }) {
  const [imgErr, setImgErr] = useState(false)
  return (
    <motion.button whileTap={{ scale: 0.95 }} onClick={onClick}
      className={`relative w-full rounded-2xl p-3 text-left transition-all border ${
        selected ? 'border-red-500/70 bg-red-500/10 ring-1 ring-red-500/40' : 'border-white/[0.08] bg-white/[0.03] hover:border-white/20'
      }`}>
      {selected && (
        <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center z-10">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </span>
      )}
      <div className="h-16 flex items-center justify-center mb-2 rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,.03)' }}>
        {w.image_url && !imgErr
          ? <img src={w.image_url} alt={w.weapon_name} onError={() => setImgErr(true)} className="h-full w-full object-contain drop-shadow-xl" />
          : <span className="text-white/10 text-sm font-black tracking-widest">{w.weapon_name.slice(0,3).toUpperCase()}</span>
        }
      </div>
      <p className="font-bold text-white text-xs leading-tight line-clamp-1 mb-1.5">{w.weapon_name}</p>
      <div className="flex items-center justify-between gap-1">
        <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-medium truncate ${CAT_COLOR[w.category] ?? ''}`}>
          {w.category}
        </span>
        <span className={`text-[9px] px-1.5 py-0.5 rounded border font-black shrink-0 ${TIER_BADGE[w.tier] ?? TIER_BADGE.C}`}>
          {w.tier}
        </span>
      </div>
    </motion.button>
  )
}

function EquipCard({ item, selected, onClick }: { item: Equipment; selected: boolean; onClick: () => void }) {
  const [imgErr, setImgErr] = useState(false)
  const clr = EQ_CLR[item.category] ?? ''
  const fallback = item.category === 'tactical' ? '💉' : item.category === 'lethal' ? '💣' : '🗡️'
  return (
    <motion.button whileTap={{ scale: 0.95 }} onClick={onClick}
      className={`relative w-full rounded-2xl p-3 text-left transition-all border ${
        selected ? 'border-red-500/70 bg-red-500/10 ring-1 ring-red-500/40' : 'border-white/[0.08] bg-white/[0.03] hover:border-white/20'
      }`}>
      {selected && (
        <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </span>
      )}
      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-2 ${clr}`}>
        {item.image_url && !imgErr
          ? <img src={item.image_url} alt={item.name} onError={() => setImgErr(true)} className="w-7 h-7 object-contain" />
          : <span className="text-base">{fallback}</span>
        }
      </div>
      <p className="font-bold text-white text-xs leading-tight mb-1">{item.name}</p>
      <span className={`text-[9px] px-1.5 py-0.5 rounded border font-black ${TIER_BADGE[item.tier] ?? TIER_BADGE.C}`}>{item.tier}</span>
      <p className="text-[10px] text-white/30 mt-1 leading-tight line-clamp-2">{item.description}</p>
    </motion.button>
  )
}

function PerkCard({ perk, selected, onClick }: { perk: PerkMeta; selected: boolean; onClick: () => void }) {
  const [imgErr, setImgErr] = useState(false)
  const cfg = PERK_CFG[perk.category] ?? PERK_CFG['Perk 1']
  return (
    <motion.button whileTap={{ scale: 0.95 }} onClick={onClick}
      className={`relative w-full rounded-2xl p-3 text-left flex gap-3 items-start transition-all border ${
        selected ? 'border-red-500/70 bg-red-500/10 ring-1 ring-red-500/40' : `${cfg.color} hover:border-white/20`
      }`}>
      {selected && (
        <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </span>
      )}
      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${cfg.color}`}>
        {perk.image_url && !imgErr
          ? <img src={perk.image_url} alt={perk.perk_name} onError={() => setImgErr(true)} className="w-7 h-7 object-contain" />
          : <span className="text-white/30 text-xs font-black">{perk.perk_name.slice(0,2).toUpperCase()}</span>
        }
      </div>
      <div className="flex-1 min-w-0 pr-6">
        <p className="font-bold text-white text-xs leading-tight">{perk.perk_name}</p>
        <p className="text-[10px] text-white/30 mt-0.5 leading-tight line-clamp-2">{perk.description}</p>
      </div>
    </motion.button>
  )
}

/* ── Main component ── */
export default function LoadoutBuilder() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState(0)
  const [weapons, setWeapons]       = useState<WeaponMeta[]>([])
  const [perks, setPerks]           = useState<PerkMeta[]>([])
  const [equipment, setEquipment]   = useState<Equipment[]>([])
  const [loading, setLoading]       = useState(true)
  const [saving, setSaving]         = useState(false)
  const [weaponFilter, setWeaponFilter] = useState('Todas')

  const [primary, setPrimary]       = useState<WeaponMeta | null>(null)
  const [primaryAtts, setPrimaryAtts] = useState<Array<{ slot: string; value: AttVal; active: boolean }>>([])
  const [secondary, setSecondary]   = useState<WeaponMeta | null>(null)
  const [secondaryAtts, setSecondaryAtts] = useState<Array<{ slot: string; value: AttVal; active: boolean }>>([])
  const [tactical, setTactical]     = useState('')
  const [lethal, setLethal]         = useState('')
  const [perk1, setPerk1]           = useState('')
  const [perk2, setPerk2]           = useState('')
  const [perk3, setPerk3]           = useState('')
  const [loadoutName, setLoadoutName] = useState('')
  const [isPublic, setIsPublic]     = useState(false)

  useEffect(() => {
    Promise.all([
      api.get<WeaponMeta[]>('/meta'),
      api.get<PerkMeta[]>('/meta/perks'),
      api.get<Equipment[]>('/meta/equipment'),
    ]).then(([w, p, e]) => {
      setWeapons(w.data)
      setPerks(p.data)
      setEquipment(e.data)
    }).finally(() => setLoading(false))
  }, [])

  const selectWeapon = (w: WeaponMeta, isPrimary: boolean) => {
    const atts = getTop5Atts(w.meta_build).map(a => ({ ...a, active: true }))
    if (isPrimary) { setPrimary(w); setPrimaryAtts(atts) }
    else           { setSecondary(w); setSecondaryAtts(atts) }
  }

  const filteredWeapons = weaponFilter === 'Todas' ? weapons : weapons.filter(w => w.category === weaponFilter)

  const canNext = () => {
    if (step === 0) return primary !== null
    return true
  }

  const handleSave = async () => {
    if (!loadoutName.trim()) return
    if (!isAuthenticated) { navigate('/register'); return }
    setSaving(true)
    try {
      await api.post('/loadouts', {
        name: loadoutName,
        weapon_name: primary?.weapon_name ?? '',
        category: primary?.category ?? '',
        attachments: attsToRecord(primaryAtts),
        secondary_weapon: secondary?.weapon_name ?? null,
        secondary_category: secondary?.category ?? null,
        secondary_attachments: attsToRecord(secondaryAtts),
        tactical: tactical || null,
        lethal: lethal || null,
        perk1: perk1 || null,
        perk2: perk2 || null,
        perk3: perk3 || null,
        melee: null,
        is_public: isPublic,
        cod_share_code: '',
        notes: '',
      })
      navigate('/loadouts')
    } catch { setSaving(false) }
  }

  /* ── Step renderers ── */
  const renderCombinedStep = (isPrimary: boolean) => {
    const sel = isPrimary ? primary : secondary
    const atts = isPrimary ? primaryAtts : secondaryAtts
    const setAtts = isPrimary ? setPrimaryAtts : setSecondaryAtts
    const title = isPrimary ? 'Elige tu Arma Primaria' : 'Elige tu Arma Secundaria'
    const activeCount = atts.filter(a => a.active).length
    return (
      <div className="flex-1 overflow-y-auto scrollbar-none">
        <p className="text-white/40 text-xs mb-3">{title}</p>
        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-2 mb-3">
          {WEAPON_FILTERS.map(f => (
            <button key={f} onClick={() => setWeaponFilter(f)}
              className={`shrink-0 px-3 py-1 rounded-xl text-xs font-medium border transition-all ${
                weaponFilter === f ? 'border-red-500/50 bg-red-500/10 text-red-400' : 'border-white/[0.08] text-white/40 hover:text-white/70'
              }`}>{f}</button>
          ))}
        </div>
        {/* Weapon grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pb-4">
          {filteredWeapons.map(w => (
            <WeaponCard key={w.weapon_name} w={w}
              selected={sel?.weapon_name === w.weapon_name}
              onClick={() => selectWeapon(w, isPrimary)} />
          ))}
        </div>

        {/* Attachment section — appears inline when a weapon is selected */}
        {sel && (
          <div className="mb-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
            <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
              <p className="text-white/40 text-xs">Accesorios · <span className="text-white font-bold">{sel.weapon_name}</span></p>
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${activeCount <= 5 ? 'text-red-400 bg-red-500/10' : 'text-amber-400 bg-amber-500/10'}`}>
                {activeCount}/5 WZ
              </span>
            </div>
            <div className="p-3 space-y-2">
              {atts.map((a, i) => {
                const lv = attLevel(a.value)
                const slotClr = SLOT_CLR[a.slot] ?? 'text-gray-400 bg-gray-500/10 border-gray-500/25'
                return (
                  <div key={a.slot}
                    className={`rounded-xl p-3 flex items-center gap-3 border transition-all ${
                      a.active ? 'border-white/[0.1] bg-white/[0.04]' : 'border-white/[0.04] bg-white/[0.01] opacity-50'
                    }`}>
                    <button onClick={() => setAtts(prev => prev.map((x, j) => j === i ? { ...x, active: !x.active } : x))}
                      className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${
                        a.active ? 'border-red-500 bg-red-500' : 'border-white/20 bg-transparent'
                      }`}>
                      {a.active && <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>}
                    </button>
                    <div className="flex-1 min-w-0">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wide ${slotClr}`}>
                        {SLOT_ES[a.slot] ?? a.slot}
                      </span>
                      <p className={`text-sm font-bold mt-0.5 ${a.active ? 'text-white' : 'text-white/40'}`}>{attName(a.value)}</p>
                    </div>
                    {lv !== null && (
                      <span className="text-[9px] text-white/30 shrink-0">Nv.{lv}</span>
                    )}
                  </div>
                )
              })}
              {atts.length === 0 && (
                <p className="text-white/20 text-sm text-center py-4">Este arma no tiene build meta cargado</p>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderEquipStep = () => (
    <div className="flex-1 overflow-y-auto scrollbar-none">
      {/* Tactical */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-5 rounded-full bg-sky-400" />
          <p className="text-sm font-bold text-sky-400">Táctico</p>
          {tactical && <span className="text-xs text-white/40">— {tactical}</span>}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {equipment.filter(e => e.category === 'tactical').map(e => (
            <EquipCard key={e.id} item={e} selected={tactical === e.name}
              onClick={() => setTactical(tactical === e.name ? '' : e.name)} />
          ))}
        </div>
      </div>
      {/* Lethal */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-5 rounded-full bg-rose-400" />
          <p className="text-sm font-bold text-rose-400">Letal</p>
          {lethal && <span className="text-xs text-white/40">— {lethal}</span>}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {equipment.filter(e => e.category === 'lethal').map(e => (
            <EquipCard key={e.id} item={e} selected={lethal === e.name}
              onClick={() => setLethal(lethal === e.name ? '' : e.name)} />
          ))}
        </div>
      </div>
    </div>
  )

  const renderPerkStep = () => (
    <div className="flex-1 overflow-y-auto scrollbar-none space-y-6 pb-4">
      {(['Perk 1', 'Perk 2', 'Perk 3'] as const).map((slot, si) => {
        const selected = si === 0 ? perk1 : si === 1 ? perk2 : perk3
        const setSel   = si === 0 ? setPerk1 : si === 1 ? setPerk2 : setPerk3
        const cfg = PERK_CFG[slot]
        const slotPerks = perks.filter(p => p.category === slot)
        return (
          <div key={slot}>
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-1 h-5 rounded-full ${cfg.dot}`} />
              <p className={`text-sm font-bold ${si === 0 ? 'text-sky-400' : si === 1 ? 'text-rose-400' : 'text-amber-400'}`}>{slot}</p>
              {selected && <span className="text-xs text-white/40">— {selected}</span>}
            </div>
            <div className="space-y-2">
              {slotPerks.map(p => (
                <PerkCard key={p.id} perk={p} selected={selected === p.perk_name}
                  onClick={() => setSel(selected === p.perk_name ? '' : p.perk_name)} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )

  const renderSummary = () => {
    const rows: Array<{ label: string; value: string; color?: string }> = []
    if (primary)   rows.push({ label: 'Primaria', value: primary.weapon_name, color: 'text-emerald-400' })
    if (secondary) rows.push({ label: 'Secundaria', value: secondary.weapon_name, color: 'text-sky-400' })
    if (tactical)  rows.push({ label: 'Táctico', value: tactical, color: 'text-sky-300' })
    if (lethal)    rows.push({ label: 'Letal', value: lethal, color: 'text-rose-300' })
    if (perk1)     rows.push({ label: 'Perk 1', value: perk1, color: 'text-sky-400' })
    if (perk2)     rows.push({ label: 'Perk 2', value: perk2, color: 'text-rose-400' })
    if (perk3)     rows.push({ label: 'Perk 3', value: perk3, color: 'text-amber-400' })
    const primActiveAtts = primaryAtts.filter(a => a.active)
    const secActiveAtts  = secondaryAtts.filter(a => a.active)

    return (
      <div className="flex-1 overflow-y-auto scrollbar-none pb-4 space-y-4">
        {/* Overview card */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
          <p className="text-[10px] text-white/30 uppercase tracking-widest mb-3">Resumen del Loadout</p>
          <div className="space-y-2">
            {rows.map(r => (
              <div key={r.label} className="flex items-center justify-between">
                <span className="text-xs text-white/40">{r.label}</span>
                <span className={`text-xs font-bold ${r.color ?? 'text-white'}`}>{r.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Primary attachments */}
        {primActiveAtts.length > 0 && (
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
            <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2">Accesorios Primaria</p>
            <div className="space-y-1">
              {primActiveAtts.map(a => (
                <div key={a.slot} className="flex items-center justify-between">
                  <span className="text-[10px] text-white/30">{SLOT_ES[a.slot] ?? a.slot}</span>
                  <span className="text-[10px] text-white font-medium">{attName(a.value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Secondary attachments */}
        {secActiveAtts.length > 0 && (
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
            <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2">Accesorios Secundaria</p>
            <div className="space-y-1">
              {secActiveAtts.map(a => (
                <div key={a.slot} className="flex items-center justify-between">
                  <span className="text-[10px] text-white/30">{SLOT_ES[a.slot] ?? a.slot}</span>
                  <span className="text-[10px] text-white font-medium">{attName(a.value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Name + save */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 space-y-3">
          <p className="text-[10px] text-white/30 uppercase tracking-widest">Guardar Loadout</p>
          <input
            value={loadoutName} onChange={e => setLoadoutName(e.target.value)}
            placeholder="Nombre del loadout..."
            className="w-full bg-black/40 border border-white/[0.1] rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-red-500/50 transition-colors"
          />
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)}
              className="w-4 h-4 rounded accent-red-500" />
            <span className="text-xs text-white/50">Hacer público (compartible con link)</span>
          </label>
          <motion.button whileTap={{ scale: 0.97 }} onClick={handleSave} disabled={!loadoutName.trim() || saving}
            className="w-full py-3.5 rounded-xl text-sm font-bold bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all disabled:opacity-40">
            {saving ? 'Guardando...' : isAuthenticated ? '💾 Guardar Loadout' : '→ Registrarse para guardar'}
          </motion.button>
        </div>
      </div>
    )
  }

  const stepContent = [
    renderCombinedStep(true),
    renderCombinedStep(false),
    renderEquipStep(),
    renderPerkStep(),
    renderSummary(),
  ]

  const isOptionalStep = step === 1

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 rounded-full border-2 border-red-500/30 border-t-red-500 animate-spin" />
    </div>
  )

  return (
    <div className="flex flex-col h-[calc(100dvh-140px)] sm:h-[calc(100dvh-80px)]">
      {/* Header */}
      <div className="shrink-0 mb-4">
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          Crear <span className="bg-gradient-to-r from-red-300 to-red-500 bg-clip-text text-transparent">Loadout</span>
        </h1>
        <p className="text-xs text-white/30 mt-0.5">Warzone · BO7 · Paso {step + 1} de {STEPS.length}</p>
      </div>

      {/* Progress bar */}
      <div className="shrink-0 mb-4">
        <div className="flex gap-1.5 mb-2">
          {STEPS.map((s, i) => (
            <button key={i} onClick={() => i < step && setStep(i)}
              className={`flex-1 h-1 rounded-full transition-all ${
                i < step ? 'bg-red-500 cursor-pointer' : i === step ? 'bg-red-400' : 'bg-white/10 cursor-default'
              }`} />
          ))}
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-white">{STEPS[step]}</p>
          <p className="text-[10px] text-white/25">Paso {step + 1} / {STEPS.length}</p>
        </div>
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div key={step}
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.18 }}
          className="flex-1 min-h-0 flex flex-col">
          {stepContent[step]}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="shrink-0 flex gap-3 pt-3 border-t border-white/[0.06]">
        {step > 0 && (
          <button onClick={() => setStep(s => s - 1)}
            className="px-5 py-3 rounded-xl text-sm font-medium text-white/50 border border-white/[0.08] hover:text-white hover:border-white/20 transition-all">
            ← Atrás
          </button>
        )}
        {step < STEPS.length - 1 && (
          <>
            {isOptionalStep && (
              <button onClick={() => { setStep(s => s + 1); setWeaponFilter('Todas') }}
                className="flex-1 py-3 rounded-xl text-sm font-medium text-white/40 border border-white/[0.08] hover:text-white/70 transition-all">
                Saltar →
              </button>
            )}
            <motion.button whileTap={{ scale: 0.97 }}
              onClick={() => { setStep(s => s + 1); setWeaponFilter('Todas') }}
              disabled={!canNext()}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                canNext()
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                  : 'bg-white/[0.04] text-white/20 border border-white/[0.05] cursor-not-allowed'
              }`}>
              Siguiente →
            </motion.button>
          </>
        )}
      </div>
    </div>
  )
}
