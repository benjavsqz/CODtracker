import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../lib/api'

interface MetaClase {
  id: number
  nombre: string
  estilo: string
  descripcion: string
  dificultad: string
  modos: string[]
  color: string | null
  primaria_arma: string | null
  primaria_attachments: Record<string, string>
  secundaria_arma: string | null
  secundaria_attachments: Record<string, string>
  stats: Record<string, number>
}

const SLOT_ES: Record<string, string> = {
  Muzzle: 'Bocacha', Barrel: 'Cañón', Optic: 'Mira', Stock: 'Culata',
  Underbarrel: 'Acople', Magazine: 'Cargador', Ammunition: 'Munición',
  'Rear Grip': 'Empuñadura', Laser: 'Láser', 'Fire Mods': 'Mod. Disparo',
}

const MODO_LABEL: Record<string, string> = {
  battle_royale:    'Battle Royale',
  resurgence:       'Resurgence',
  black_ops_royale: 'BO Royale',
  clasificatorio:   'Clasificatorio',
}

const STAT_LABEL: Record<string, string> = {
  movilidad: 'Movilidad',
  daño:      'Daño',
  rango:     'Rango',
  facilidad: 'Facilidad',
}

const DIFICULTAD_COLOR: Record<string, string> = {
  'FÁCIL':       'text-green-400 bg-green-500/10 border-green-500/30',
  'MEDIO':       'text-amber-400 bg-amber-500/10 border-amber-500/30',
  'AVANZADO':    'text-orange-400 bg-orange-500/10 border-orange-500/30',
  'ALTO NIVEL':  'text-red-400 bg-red-500/10 border-red-500/30',
  'RECOMENDADO': 'text-sky-400 bg-sky-500/10 border-sky-500/30',
  'ESTRATÉGICO': 'text-purple-400 bg-purple-500/10 border-purple-500/30',
}

function StatBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-[9px] text-white/30 uppercase tracking-wider font-semibold">{label}</span>
        <span className="text-[9px] text-white/40 font-bold">{value}</span>
      </div>
      <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-red-500/60 to-red-400/80"
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
        />
      </div>
    </div>
  )
}

function WeaponAttachments({ arma, attachments, label }: {
  arma: string | null
  attachments: Record<string, string>
  label: string
}) {
  const slots = Object.entries(attachments).filter(([, v]) => v)
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[9px] text-white/25 uppercase tracking-widest font-semibold">{label}</span>
        {arma && <span className="text-xs font-bold text-white/70">{arma}</span>}
      </div>
      {slots.length > 0 ? (
        <div className="space-y-1">
          {slots.map(([slot, item]) => (
            <div key={slot} className="flex items-center gap-2 text-xs">
              <span className="text-[9px] text-white/25 w-16 shrink-0">{SLOT_ES[slot] ?? slot}</span>
              <span className="text-white/60 truncate">{item}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-white/20">Sin attachments</p>
      )}
    </div>
  )
}

function ClaseCard({ clase, onSelect, isSelected }: {
  clase: MetaClase
  onSelect: () => void
  isSelected: boolean
}) {
  const accent = clase.color ?? '#ef4444'
  const difColor = DIFICULTAD_COLOR[clase.dificultad?.toUpperCase()] ?? DIFICULTAD_COLOR['MEDIO']

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, transition: { duration: 0.15 } }}
      whileTap={{ scale: 0.97 }}
      onClick={onSelect}
      className={`cursor-pointer rounded-2xl p-4 transition-all duration-200 ${isSelected ? 'ring-1 ring-white/25' : ''}`}
      style={{
        background: isSelected
          ? `linear-gradient(135deg, rgba(255,255,255,.06) 0%, rgba(255,255,255,.03) 100%)`
          : 'rgba(255,255,255,.04)',
        border: `1px solid ${isSelected ? 'rgba(255,255,255,.15)' : 'rgba(255,255,255,.07)'}`,
        borderLeft: `3px solid ${accent}`,
      }}>
      {/* Estilo + dificultad */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-[9px] text-white/30 uppercase tracking-widest font-semibold">{clase.estilo}</span>
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${difColor}`}>
          {clase.dificultad}
        </span>
      </div>

      {/* Nombre */}
      <h3 className="text-sm font-black text-white leading-tight mb-1">{clase.nombre}</h3>

      {/* Armas */}
      <div className="flex items-center gap-1.5 mb-3 flex-wrap">
        {clase.primaria_arma && (
          <span className="text-[10px] font-semibold text-white/50 bg-white/[0.05] px-2 py-0.5 rounded-full">
            {clase.primaria_arma}
          </span>
        )}
        {clase.secundaria_arma && (
          <>
            <span className="text-white/20 text-xs">+</span>
            <span className="text-[10px] font-semibold text-white/50 bg-white/[0.05] px-2 py-0.5 rounded-full">
              {clase.secundaria_arma}
            </span>
          </>
        )}
      </div>

      {/* Modos */}
      {clase.modos?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {clase.modos.map(m => (
            <span key={m} className="text-[8px] px-1.5 py-0.5 rounded bg-white/[0.04] text-white/20 font-medium capitalize">
              {MODO_LABEL[m] ?? m}
            </span>
          ))}
        </div>
      )}

      {/* Stats mini */}
      {Object.keys(clase.stats ?? {}).length > 0 && (
        <div className="space-y-1.5">
          {Object.entries(clase.stats).slice(0, 3).map(([k, v]) => (
            <StatBar key={k} label={STAT_LABEL[k] ?? k} value={v} />
          ))}
        </div>
      )}
    </motion.div>
  )
}

function ClaseDetail({ clase, onClose }: { clase: MetaClase; onClose: () => void }) {
  const accent = clase.color ?? '#ef4444'
  const difColor = DIFICULTAD_COLOR[clase.dificultad?.toUpperCase()] ?? DIFICULTAD_COLOR['MEDIO']

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-30 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ x: 340, opacity: 0 }}
        animate={{ x: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 30 } }}
        exit={{ x: 340, opacity: 0, transition: { duration: 0.18 } }}
        className="hidden lg:flex fixed top-0 right-0 h-full w-[340px] z-40 flex-col pt-14"
        style={{
          background: 'linear-gradient(180deg,#0d0d18 0%,#09090f 100%)',
          borderLeft: '1px solid rgba(255,255,255,.07)',
          boxShadow: '-8px 0 40px rgba(0,0,0,.6)',
        }}>
        <DetailContent clase={clase} accent={accent} difColor={difColor} onClose={onClose} />
      </motion.div>

      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1, transition: { type: 'spring', stiffness: 280, damping: 28 } }}
        exit={{ y: '100%', opacity: 0, transition: { duration: 0.2 } }}
        className="lg:hidden fixed bottom-0 left-0 right-0 z-[60] rounded-t-3xl overflow-hidden flex flex-col"
        style={{
          maxHeight: '92dvh',
          background: 'linear-gradient(180deg,#0d0d18 0%,#09090f 100%)',
          borderTop: '1px solid rgba(255,255,255,.08)',
          boxShadow: '0 -8px 40px rgba(0,0,0,.7)',
        }}>
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-white/10" />
        </div>
        <DetailContent clase={clase} accent={accent} difColor={difColor} onClose={onClose} />
      </motion.div>
    </>
  )
}

function DetailContent({ clase, accent, difColor, onClose }: {
  clase: MetaClase; accent: string; difColor: string; onClose: () => void
}) {
  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Header band */}
      <div className="shrink-0 px-5 pt-4 pb-4 border-b border-white/[0.06]"
        style={{ borderLeft: `3px solid ${accent}` }}>
        <div className="flex items-start justify-between gap-2 mb-1">
          <div>
            <span className="text-[9px] text-white/30 uppercase tracking-widest font-semibold">{clase.estilo}</span>
            <h2 className="text-base font-black text-white leading-tight mt-0.5">{clase.nombre}</h2>
          </div>
          <div className="flex flex-col items-end gap-1">
            <button onClick={onClose}
              className="w-7 h-7 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center text-white/40 hover:text-white text-lg leading-none transition-all">
              ×
            </button>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${difColor}`}>
              {clase.dificultad}
            </span>
          </div>
        </div>
        {clase.descripcion && (
          <p className="text-xs text-white/40 leading-relaxed mt-2">{clase.descripcion}</p>
        )}
        {clase.modos?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {clase.modos.map(m => (
              <span key={m} className="text-[8px] px-1.5 py-0.5 rounded bg-white/[0.05] text-white/25 font-medium capitalize">
                {MODO_LABEL[m] ?? m}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5" style={{ overscrollBehavior: 'contain' }}>
        {/* Stats */}
        {Object.keys(clase.stats ?? {}).length > 0 && (
          <div>
            <p className="text-[9px] text-white/20 uppercase tracking-widest font-semibold mb-3">Estadísticas</p>
            <div className="space-y-2">
              {Object.entries(clase.stats).map(([k, v]) => (
                <StatBar key={k} label={STAT_LABEL[k] ?? k} value={v} />
              ))}
            </div>
          </div>
        )}

        {/* Primaria */}
        <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)' }}>
          <WeaponAttachments arma={clase.primaria_arma} attachments={clase.primaria_attachments ?? {}} label="Primaria" />
        </div>

        {/* Secundaria */}
        {clase.secundaria_arma && (
          <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)' }}>
            <WeaponAttachments arma={clase.secundaria_arma} attachments={clase.secundaria_attachments ?? {}} label="Secundaria" />
          </div>
        )}
      </div>
    </div>
  )
}

export default function Clases() {
  const [clases, setClases]     = useState<MetaClase[]>([])
  const [loading, setLoading]   = useState(true)
  const [selected, setSelected] = useState<MetaClase | null>(null)

  useEffect(() => {
    api.get<MetaClase[]>('/meta/clases').then(r => setClases(r.data)).finally(() => setLoading(false))
  }, [])

  return (
    <div className="relative">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Clases <span className="bg-gradient-to-r from-amber-300 to-orange-500 bg-clip-text text-transparent">Meta</span>
        </h1>
        <p className="text-sm text-white/30 mt-1">Warzone · Loadouts recomendados por estilo de juego</p>
      </motion.div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-48 rounded-2xl" />)}
        </div>
      )}

      {!loading && clases.length === 0 && (
        <div className="text-center py-20">
          <p className="text-white/25 text-sm">Las clases se cargarán con el próximo scrape.</p>
        </div>
      )}

      {!loading && clases.length > 0 && (
        <motion.div
          animate={{ marginRight: selected ? 356 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {clases.map(c => (
            <ClaseCard key={c.id} clase={c}
              isSelected={selected?.id === c.id}
              onSelect={() => setSelected(selected?.id === c.id ? null : c)} />
          ))}
        </motion.div>
      )}

      <AnimatePresence>
        {selected && <ClaseDetail clase={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  )
}
