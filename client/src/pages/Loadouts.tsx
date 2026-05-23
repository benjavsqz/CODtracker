import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'
import type { Loadout } from '../types'

// ─── Types ──────────────────────────────────────────────────────────────────

interface WeaponMeta {
  weapon_name: string
  tier: string
  category: string
  pick_rate: number
  meta_build: Record<string, unknown>
  image_url: string | null
  max_level: number | null
}

interface PerkMeta {
  id: number
  perk_name: string
  category: string
  tier: string
  description: string
  image_url: string | null
}

// ─── Constants ───────────────────────────────────────────────────────────────

const SLOT_ES: Record<string, string> = {
  'Muzzle': 'Bocacha', 'Barrel': 'Cañón', 'Optic': 'Mira',
  'Stock': 'Culata', 'Underbarrel': 'Acople', 'Magazine': 'Cargador',
  'Ammunition': 'Munición', 'Rear Grip': 'Empuñadura',
  'Laser': 'Láser', 'Fire Mods': 'Mod. Disparo',
}

const SLOT_CLR: Record<string, string> = {
  'Muzzle': 'text-orange-400 bg-orange-500/10 border-orange-500/25',
  'Barrel': 'text-sky-400 bg-sky-500/10 border-sky-500/25',
  'Optic': 'text-teal-400 bg-teal-500/10 border-teal-500/25',
  'Stock': 'text-purple-400 bg-purple-500/10 border-purple-500/25',
  'Underbarrel': 'text-green-400 bg-green-500/10 border-green-500/25',
  'Magazine': 'text-rose-400 bg-rose-500/10 border-rose-500/25',
  'Ammunition': 'text-yellow-400 bg-yellow-500/10 border-yellow-500/25',
  'Rear Grip': 'text-amber-400 bg-amber-500/10 border-amber-500/25',
  'Laser': 'text-cyan-400 bg-cyan-500/10 border-cyan-500/25',
  'Fire Mods': 'text-pink-400 bg-pink-500/10 border-pink-500/25',
}

const CAT_COLOR: Record<string, string> = {
  'Assault Rifle': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  'SMG': 'text-sky-400 bg-sky-500/10 border-sky-500/20',
  'LMG': 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  'Sniper Rifle': 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  'Marksman Rifle': 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  'Battle Rifle': 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  'Shotgun': 'text-pink-400 bg-pink-500/10 border-pink-500/20',
  'Handgun': 'text-gray-400 bg-gray-500/10 border-gray-500/20',
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

const CATEGORIES = ['Assault Rifle', 'SMG', 'LMG', 'Sniper Rifle', 'Marksman Rifle', 'Battle Rifle', 'Shotgun', 'Handgun']
const SLOTS = ['Muzzle', 'Barrel', 'Underbarrel', 'Magazine', 'Rear Grip', 'Stock', 'Laser', 'Optic', 'Fire Mods'] as const

const emptyForm = {
  name: '', weapon_name: '', category: '',
  attachments: {} as Record<string, string>,
  secondary_weapon: '', secondary_category: '',
  secondary_attachments: {} as Record<string, string>,
  tactical: '', lethal: '', perk1: '', perk2: '', perk3: '', melee: '',
  cod_share_code: '', notes: '', is_public: false,
}

// ─── WeaponCard ──────────────────────────────────────────────────────────────

function WeaponCard({
  label, weaponName, category, attachments, meta, onClick,
}: {
  label: string
  weaponName: string | null
  category: string | null
  attachments: Record<string, string> | null
  meta: WeaponMeta | null
  onClick: () => void
}) {
  const [imgErr, setImgErr] = useState(false)
  const attCount = Object.values(attachments ?? {}).filter(Boolean).length
  const userLevel = (() => {
    if (!weaponName) return null
    const stored = localStorage.getItem(`mwz:lv:${weaponName}`)
    return stored ? Number(stored) : (meta?.max_level ?? null)
  })()

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
    <motion.button whileTap={{ scale: 0.99 }} onClick={onClick}
      className="w-full rounded-xl border border-white/[0.08] hover:border-white/[0.18] overflow-hidden transition-all group text-left"
      style={{ background: 'rgba(255,255,255,.025)' }}>

      {/* Top: label + badges + weapon name */}
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

      {/* Full-width weapon image with level circle */}
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
        {userLevel !== null && (
          <div className="absolute bottom-1.5 right-1.5 w-7 h-7 rounded-full border-2 border-white/25 bg-black/70 flex items-center justify-center">
            <span className="text-[10px] font-black text-white leading-none">{userLevel}</span>
          </div>
        )}
      </div>

      {/* Footer: attachment dots + action */}
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

// ─── SlotBox ─────────────────────────────────────────────────────────────────

function SlotBox({ label, name, iconType }: {
  label: string; name: string | null; iconType: 'tactical' | 'lethal' | 'melee'
}) {
  const cfgMap = {
    tactical: { icon: '💊', clr: 'border-sky-500/25 bg-sky-500/5' },
    lethal:   { icon: '💣', clr: 'border-rose-500/25 bg-rose-500/5' },
    melee:    { icon: '🗡️', clr: 'border-amber-500/25 bg-amber-500/5' },
  }
  const { icon, clr } = cfgMap[iconType]
  return (
    <div className={`flex-1 rounded-xl border p-2.5 ${name ? clr : 'border-white/[0.05] bg-white/[0.01]'}`}>
      <p className="text-[7px] font-bold uppercase tracking-widest text-white/25 mb-1.5">{label}</p>
      <div className="flex items-center gap-1.5">
        <span className="text-base leading-none">{icon}</span>
        <span className={`text-[11px] font-bold truncate ${name ? 'text-white' : 'text-white/15'}`}>
          {name ?? '—'}
        </span>
      </div>
    </div>
  )
}

// ─── PerkBox ─────────────────────────────────────────────────────────────────

function PerkBox({ label, perkName, perkMeta, slot }: {
  label: string; perkName: string | null; perkMeta: PerkMeta | undefined; slot: string
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

// ─── AttachmentModal ──────────────────────────────────────────────────────────

function AttachmentModal({
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
        {/* Header */}
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

        {/* Weapon image */}
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

        {/* Attachments */}
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

// ─── EditModal ───────────────────────────────────────────────────────────────

function EditModal({
  initial, saving, onSave, onClose,
}: {
  initial: typeof emptyForm
  saving: boolean
  onSave: (form: typeof emptyForm) => void
  onClose: () => void
}) {
  const [form, setForm] = useState(initial)
  const set = (k: keyof typeof emptyForm, v: unknown) =>
    setForm(f => ({ ...f, [k]: v }))
  const setAtt = (slot: string, v: string, which: 'primary' | 'secondary') => {
    const key = which === 'primary' ? 'attachments' : 'secondary_attachments'
    setForm(f => ({ ...f, [key]: { ...(f[key] as Record<string, string>), [slot]: v } }))
  }

  return (
    <div className="fixed inset-0 z-[9998] flex items-end sm:items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 28 }}
        className="relative z-10 w-full max-w-lg mx-4 mb-4 sm:mb-0 rounded-2xl overflow-hidden flex flex-col"
        style={{ maxHeight: '88dvh', background: 'rgba(9,9,16,.99)', border: '1px solid rgba(255,255,255,.1)' }}
        onClick={e => e.stopPropagation()}>
        <div className="px-5 pt-5 pb-3 border-b border-white/[0.06] flex items-center justify-between shrink-0">
          <p className="text-white font-black text-lg tracking-tight">Editar Loadout</p>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center text-white/40 hover:text-white transition-all text-sm">
            ✕
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">
          {/* Name */}
          <FormField label="Nombre *" value={form.name} onChange={v => set('name', v)} placeholder="Mi loadout..." />

          {/* Primary */}
          <div>
            <p className="text-[9px] text-white/30 uppercase tracking-widest mb-2.5">Arma Primaria</p>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <FormField label="Nombre" value={form.weapon_name} onChange={v => set('weapon_name', v)} placeholder="DS20 Mirage" />
              <div>
                <label className="block text-[9px] text-white/30 uppercase tracking-widest mb-1.5">Categoría</label>
                <select value={form.category} onChange={e => set('category', e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500/50 transition-colors">
                  <option value="">—</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SLOTS.map(slot => (
                <FormField key={slot} label={SLOT_ES[slot] ?? slot}
                  value={(form.attachments as Record<string, string>)[slot] ?? ''}
                  onChange={v => setAtt(slot, v, 'primary')} placeholder="—" />
              ))}
            </div>
          </div>

          {/* Secondary */}
          <div>
            <p className="text-[9px] text-white/30 uppercase tracking-widest mb-2.5">Arma Secundaria</p>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <FormField label="Nombre" value={form.secondary_weapon} onChange={v => set('secondary_weapon', v)} placeholder="Kogot-7" />
              <div>
                <label className="block text-[9px] text-white/30 uppercase tracking-widest mb-1.5">Categoría</label>
                <select value={form.secondary_category} onChange={e => set('secondary_category', e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500/50 transition-colors">
                  <option value="">—</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SLOTS.map(slot => (
                <FormField key={slot} label={SLOT_ES[slot] ?? slot}
                  value={(form.secondary_attachments as Record<string, string>)[slot] ?? ''}
                  onChange={v => setAtt(slot, v, 'secondary')} placeholder="—" />
              ))}
            </div>
          </div>

          {/* Equipment & Perks */}
          <div className="grid grid-cols-2 gap-2">
            <FormField label="Táctico" value={form.tactical} onChange={v => set('tactical', v)} placeholder="Stim" />
            <FormField label="Letal" value={form.lethal} onChange={v => set('lethal', v)} placeholder="C4" />
            <FormField label="Melee" value={form.melee} onChange={v => set('melee', v)} placeholder="Karambit" />
            <FormField label="COD Share Code" value={form.cod_share_code} onChange={v => set('cod_share_code', v)} placeholder="Código del juego" />
            <FormField label="Perk 1" value={form.perk1} onChange={v => set('perk1', v)} placeholder="Scavenger" />
            <FormField label="Perk 2" value={form.perk2} onChange={v => set('perk2', v)} placeholder="Tempered" />
            <FormField label="Perk 3" value={form.perk3} onChange={v => set('perk3', v)} placeholder="Survivor" />
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" checked={form.is_public} onChange={e => set('is_public', e.target.checked)}
              className="w-4 h-4 rounded accent-red-500" />
            <span className="text-sm text-white/40">Hacer público</span>
          </label>
        </div>

        <div className="px-5 py-4 border-t border-white/[0.06] flex gap-3 shrink-0">
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => onSave(form)} disabled={saving || !form.name.trim()}
            className="flex-1 py-3 rounded-xl text-sm font-bold bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25 transition-all disabled:opacity-40">
            {saving ? 'Guardando...' : 'Guardar'}
          </motion.button>
          <button onClick={onClose}
            className="px-5 py-3 rounded-xl text-sm text-white/40 border border-white/[0.08] hover:text-white transition-all">
            Cancelar
          </button>
        </div>
      </motion.div>
    </div>
  )
}

function FormField({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string
}) {
  return (
    <div>
      <label className="block text-[9px] text-white/30 uppercase tracking-widest mb-1.5">{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-red-500/50 transition-colors" />
    </div>
  )
}

// ─── LoadoutDetail ────────────────────────────────────────────────────────────

function LoadoutDetail({
  loadout, weaponMap, perks, onEdit, onDelete, onBack,
}: {
  loadout: Loadout
  weaponMap: Record<string, WeaponMeta>
  perks: PerkMeta[]
  onEdit: () => void
  onDelete: () => void
  onBack?: () => void
}) {
  const [showAtts, setShowAtts] = useState<'primary' | 'secondary' | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const primaryMeta = weaponMap[loadout.weapon_name] ?? null
  const secondaryMeta = loadout.secondary_weapon ? (weaponMap[loadout.secondary_weapon] ?? null) : null
  const perk1Meta = perks.find(p => p.perk_name === loadout.perk1)
  const perk2Meta = perks.find(p => p.perk_name === loadout.perk2)
  const perk3Meta = perks.find(p => p.perk_name === loadout.perk3)

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const hasEquip = loadout.melee || loadout.tactical || loadout.lethal
  const hasPerks = loadout.perk1 || loadout.perk2 || loadout.perk3

  return (
    <div className="h-full flex flex-col min-h-0">
      {/* Header */}
      <div className="shrink-0 px-4 sm:px-5 py-3 border-b border-white/[0.06] flex items-center gap-3">
        {onBack && (
          <button onClick={onBack}
            className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-white/40 hover:text-white transition-all shrink-0 text-sm">
            ←
          </button>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-white font-black text-base tracking-tight truncate">{loadout.name.toUpperCase()}</p>
          <p className="text-[10px] text-white/25 mt-0.5">
            {loadout.weapon_name}
            {loadout.secondary_weapon ? ` · ${loadout.secondary_weapon}` : ''}
          </p>
        </div>
        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {loadout.cod_share_code && (
            <button onClick={() => copy(loadout.cod_share_code, 'code')}
              className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-white/40 border border-white/[0.08] hover:text-white hover:border-white/20 transition-all">
              {copied === 'code' ? '✓' : '📋'}
            </button>
          )}
          {loadout.is_public && (
            <button onClick={() => copy(`${window.location.origin}/share/${loadout.share_slug}`, 'link')}
              className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-sky-400/60 border border-sky-400/20 hover:text-sky-400 transition-all">
              {copied === 'link' ? '✓' : '🔗'}
            </button>
          )}
          <button onClick={onEdit}
            className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-white/40 border border-white/[0.08] hover:text-white hover:border-white/20 transition-all">
            Editar
          </button>
          <button onClick={onDelete}
            className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-red-400/50 border border-red-400/15 hover:text-red-400 hover:border-red-400/30 transition-all">
            ✕
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-5 py-4 space-y-3">
        {/* Primary weapon */}
        <WeaponCard
          label="Arma Primaria"
          weaponName={loadout.weapon_name || null}
          category={loadout.category || null}
          attachments={loadout.attachments}
          meta={primaryMeta}
          onClick={() => setShowAtts('primary')}
        />

        {/* Secondary weapon */}
        <WeaponCard
          label="Arma Secundaria"
          weaponName={loadout.secondary_weapon}
          category={loadout.secondary_category}
          attachments={loadout.secondary_attachments}
          meta={secondaryMeta}
          onClick={() => setShowAtts('secondary')}
        />

        {/* Equipment row */}
        {hasEquip && (
          <div className="flex gap-2">
            <SlotBox label="Melee" name={loadout.melee} iconType="melee" />
            <SlotBox label="Táctico" name={loadout.tactical} iconType="tactical" />
            <SlotBox label="Letal" name={loadout.lethal} iconType="lethal" />
          </div>
        )}

        {/* Perks row */}
        {hasPerks && (
          <div className="flex gap-2">
            <PerkBox label="Perk 1" perkName={loadout.perk1} perkMeta={perk1Meta} slot="Perk 1" />
            <PerkBox label="Perk 2" perkName={loadout.perk2} perkMeta={perk2Meta} slot="Perk 2" />
            <PerkBox label="Perk 3" perkName={loadout.perk3} perkMeta={perk3Meta} slot="Perk 3" />
          </div>
        )}

        {/* Notes */}
        {loadout.notes && (
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
            <p className="text-[8px] text-white/25 uppercase tracking-widest mb-1">Notas</p>
            <p className="text-sm text-white/50">{loadout.notes}</p>
          </div>
        )}

        {/* Public badge */}
        {loadout.is_public && (
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[10px] text-green-400/60">Público — compartible con link</span>
          </div>
        )}
      </div>

      {/* Attachment modal */}
      <AnimatePresence>
        {showAtts === 'primary' && (
          <AttachmentModal
            weaponName={loadout.weapon_name}
            category={loadout.category}
            attachments={loadout.attachments ?? {}}
            meta={primaryMeta}
            onClose={() => setShowAtts(null)}
          />
        )}
        {showAtts === 'secondary' && loadout.secondary_weapon && (
          <AttachmentModal
            weaponName={loadout.secondary_weapon}
            category={loadout.secondary_category}
            attachments={loadout.secondary_attachments ?? {}}
            meta={secondaryMeta}
            onClose={() => setShowAtts(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Loadouts() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as { weapon?: string; category?: string; attachments?: Record<string, string> } | null

  const [loadouts, setLoadouts] = useState<Loadout[]>([])
  const [selected, setSelected] = useState<Loadout | null>(null)
  const [weaponMap, setWeaponMap] = useState<Record<string, WeaponMeta>>({})
  const [perks, setPerks] = useState<PerkMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list')

  // Edit/create modal
  const [editTarget, setEditTarget] = useState<Loadout | null>(null)
  const [showEdit, setShowEdit] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return }

    Promise.all([
      api.get<Loadout[]>('/loadouts'),
      api.get<WeaponMeta[]>('/meta'),
      api.get<PerkMeta[]>('/meta/perks'),
    ]).then(([lo, wm, pk]) => {
      setLoadouts(lo.data)
      const map: Record<string, WeaponMeta> = {}
      wm.data.forEach(w => { map[w.weapon_name] = w })
      setWeaponMap(map)
      setPerks(pk.data)
      if (lo.data.length > 0) setSelected(lo.data[0])

      // Pre-fill from Dashboard "Save as loadout"
      if (state?.weapon) {
        setEditTarget(null)
        setShowEdit(true)
      }
    }).finally(() => setLoading(false))
  }, [isAuthenticated])

  const loadData = async () => {
    const r = await api.get<Loadout[]>('/loadouts')
    setLoadouts(r.data)
    return r.data
  }

  const handleSave = async (form: typeof emptyForm) => {
    setSaving(true)
    try {
      if (editTarget) {
        await api.put(`/loadouts/${editTarget.id}`, form)
      } else {
        await api.post('/loadouts', form)
      }
      const updated = await loadData()
      setShowEdit(false)
      setEditTarget(null)
      const target = editTarget
        ? updated.find(l => l.id === editTarget.id) ?? updated[0]
        : updated[updated.length - 1]
      setSelected(target ?? null)
      setMobileView('detail')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este loadout?')) return
    await api.delete(`/loadouts/${id}`)
    const updated = await loadData()
    if (selected?.id === id) {
      setSelected(updated[0] ?? null)
      setMobileView('list')
    }
  }

  const openEdit = (l: Loadout) => {
    setEditTarget(l)
    setShowEdit(true)
  }

  const openCreate = () => {
    setEditTarget(null)
    setShowEdit(false)
    navigate('/builder')
  }

  const selectLoadout = (l: Loadout) => {
    setSelected(l)
    setMobileView('detail')
  }

  const initialForm = (): typeof emptyForm => {
    if (editTarget) {
      return {
        name: editTarget.name,
        weapon_name: editTarget.weapon_name,
        category: editTarget.category,
        attachments: editTarget.attachments ?? {},
        secondary_weapon: editTarget.secondary_weapon ?? '',
        secondary_category: editTarget.secondary_category ?? '',
        secondary_attachments: (editTarget.secondary_attachments as Record<string, string>) ?? {},
        tactical: editTarget.tactical ?? '',
        lethal: editTarget.lethal ?? '',
        perk1: editTarget.perk1 ?? '',
        perk2: editTarget.perk2 ?? '',
        perk3: editTarget.perk3 ?? '',
        melee: editTarget.melee ?? '',
        cod_share_code: editTarget.cod_share_code ?? '',
        notes: editTarget.notes ?? '',
        is_public: editTarget.is_public,
      }
    }
    return {
      ...emptyForm,
      weapon_name: state?.weapon ?? '',
      category: state?.category ?? '',
      attachments: state?.attachments ?? {},
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 rounded-full border-2 border-red-500/30 border-t-red-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100dvh-140px)] sm:h-[calc(100dvh-80px)] -mx-4 sm:-mx-6">
      {/* ── Left panel: loadout list ── */}
      <div className={`
        w-full sm:w-60 shrink-0 flex flex-col border-r border-white/[0.06]
        ${mobileView === 'detail' ? 'hidden sm:flex' : 'flex'}
      `} style={{ background: 'rgba(10,10,16,.6)' }}>
        {/* Panel header */}
        <div className="px-4 py-3 border-b border-white/[0.06] shrink-0">
          <p className="text-[9px] font-bold uppercase tracking-widest text-white/30">Mis Loadouts</p>
          <p className="text-xs text-white/20 mt-0.5">{loadouts.length} guardado{loadouts.length !== 1 ? 's' : ''}</p>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {loadouts.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-white/15 text-xs">Sin loadouts</p>
            </div>
          ) : (
            loadouts.map(l => (
              <button key={l.id} onClick={() => selectLoadout(l)}
                className={`w-full px-4 py-3 text-left transition-all border-l-2 hover:bg-white/[0.04] ${
                  selected?.id === l.id
                    ? 'border-red-500 bg-red-500/[0.06]'
                    : 'border-transparent'
                }`}>
                <p className={`text-xs font-bold tracking-wide truncate ${selected?.id === l.id ? 'text-white' : 'text-white/50'}`}>
                  {l.name.toUpperCase()}
                </p>
                {l.weapon_name && (
                  <p className="text-[10px] text-white/25 mt-0.5 truncate">{l.weapon_name}</p>
                )}
              </button>
            ))
          )}
        </div>

        {/* Create button */}
        <div className="px-3 py-3 border-t border-white/[0.06] shrink-0">
          <motion.button whileTap={{ scale: 0.97 }} onClick={openCreate}
            className="w-full py-2.5 rounded-xl border border-white/[0.08] hover:border-red-500/30 hover:bg-red-500/[0.06] text-white/40 hover:text-red-400 transition-all text-xs font-bold flex items-center justify-center gap-2">
            <span className="text-base leading-none">+</span>
            Crear Loadout
          </motion.button>
        </div>
      </div>

      {/* ── Right panel: detail ── */}
      <div className={`
        flex-1 min-w-0 flex flex-col
        ${mobileView === 'list' ? 'hidden sm:flex' : 'flex'}
      `}>
        {selected ? (
          <LoadoutDetail
            loadout={selected}
            weaponMap={weaponMap}
            perks={perks}
            onEdit={() => openEdit(selected)}
            onDelete={() => handleDelete(selected.id)}
            onBack={mobileView === 'detail' ? () => setMobileView('list') : undefined}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8">
            <div className="w-16 h-16 rounded-2xl border border-white/[0.06] bg-white/[0.02] flex items-center justify-center text-3xl">
              🔫
            </div>
            <div>
              <p className="text-white font-bold">Sin loadouts</p>
              <p className="text-sm text-white/30 mt-1">Crea tu primer loadout con el builder</p>
            </div>
            <motion.button whileTap={{ scale: 0.97 }} onClick={openCreate}
              className="px-6 py-3 rounded-xl bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25 transition-all text-sm font-bold">
              + Crear Loadout
            </motion.button>
          </div>
        )}
      </div>

      {/* ── Edit/Create modal ── */}
      <AnimatePresence>
        {showEdit && (
          <EditModal
            key={editTarget?.id ?? 'new'}
            initial={initialForm()}
            saving={saving}
            onSave={handleSave}
            onClose={() => { setShowEdit(false); setEditTarget(null) }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
