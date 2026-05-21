import { useState, useEffect } from 'react'
import { motion, type Variants } from 'framer-motion'
import api from '../lib/api'

interface PerkMeta { id: number; perk_name: string; category: string; tier: string; description: string; image_url: string | null }

const TIER_COLORS: Record<string, string> = {
  S: 'text-yellow-300 bg-yellow-400/10 border-yellow-400/30',
  A: 'text-green-300 bg-green-400/10 border-green-400/30',
  B: 'text-blue-300 bg-blue-400/10 border-blue-400/30',
  C: 'text-gray-400 bg-gray-600/10 border-gray-600/30',
}

const CAT_CONFIG: Record<string, { color: string; gradient: string; dot: string }> = {
  'Perk 1': { color: 'text-sky-400 border-sky-400/30 bg-sky-400/5',     gradient: 'from-sky-300 to-blue-500',     dot: 'bg-sky-400' },
  'Perk 2': { color: 'text-rose-400 border-rose-400/30 bg-rose-400/5',  gradient: 'from-rose-300 to-red-500',     dot: 'bg-rose-400' },
  'Perk 3': { color: 'text-amber-400 border-amber-400/30 bg-amber-400/5', gradient: 'from-amber-300 to-orange-500', dot: 'bg-amber-400' },
}

const CAT_ORDER = ['Perk 1', 'Perk 2', 'Perk 3']
const CAT_DESCRIPTIONS: Record<string, string> = {
  'Perk 1': 'Movilidad y logística',
  'Perk 2': 'Ventaja táctica',
  'Perk 3': 'Supervivencia',
}

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  show:   { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 260, damping: 22 } },
}

const CAT_ICON_BG: Record<string, string> = {
  'Perk 1': 'bg-sky-500/15 border-sky-400/35',
  'Perk 2': 'bg-rose-500/15 border-rose-400/35',
  'Perk 3': 'bg-amber-500/15 border-amber-400/35',
}

function PerkIcon({ src, name, category }: { src: string | null; name: string; category: string }) {
  const [err, setErr] = useState(false)
  const bgCls = CAT_ICON_BG[category] ?? 'bg-white/[0.05] border-white/10'
  if (!src || err) {
    return (
      <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${bgCls}`}>
        <span className="text-white/30 text-xs font-black">{name.slice(0, 2).toUpperCase()}</span>
      </div>
    )
  }
  return (
    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${bgCls}`}>
      <img src={src} alt={name} onError={() => setErr(true)}
        className="w-9 h-9 object-contain" style={{ imageRendering: 'crisp-edges' }} />
    </div>
  )
}

export default function Perks() {
  const [perks, setPerks]       = useState<PerkMeta[]>([])
  const [loading, setLoading]   = useState(true)
  const [activeTab, setActiveTab] = useState('Todos')

  useEffect(() => {
    api.get<PerkMeta[]>('/meta/perks').then(r => setPerks(r.data)).finally(() => setLoading(false))
  }, [])

  const tabs     = ['Todos', ...CAT_ORDER]
  const filtered = activeTab === 'Todos' ? perks : perks.filter(p => p.category === activeTab)
  const byCategory = (cat: string) => filtered.filter(p => p.category === cat)

  return (
    <div>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="mb-8">
        <h1 className="text-3xl font-black text-white tracking-tight">
          Ventajas <span className="bg-gradient-to-r from-sky-300 to-blue-500 bg-clip-text text-transparent">Meta</span>
        </h1>
        <p className="text-sm text-white/30 mt-1">Warzone · BO7 Season 3 · Mejores perks por slot</p>
      </motion.div>

      {/* Tabs */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="flex gap-2 mb-8 flex-wrap">
        {tabs.map(tab => {
          const cfg = CAT_CONFIG[tab]
          return (
            <motion.button key={tab} whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab)}
              className={`relative px-4 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 border ${
                activeTab === tab
                  ? (cfg ? cfg.color : 'text-white bg-white/[0.1] border-white/20')
                  : 'text-white/30 border-white/[0.06] hover:text-white/60 hover:border-white/15'
              }`}>
              {tab}
            </motion.button>
          )
        })}
      </motion.div>

      {loading && (
        <div className="space-y-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="skeleton h-5 w-20 rounded-lg" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="glass rounded-2xl p-4 flex gap-3">
                    <div className="skeleton w-11 h-11 rounded-xl shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="skeleton h-3 rounded-full w-3/4" />
                      <div className="skeleton h-2.5 rounded-full w-full" />
                      <div className="skeleton h-2.5 rounded-full w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && (
        <div className="space-y-10">
          {(activeTab === 'Todos' ? CAT_ORDER : [activeTab]).map(cat => {
            const catPerks = byCategory(cat)
            if (!catPerks.length) return null
            const cfg = CAT_CONFIG[cat] ?? CAT_CONFIG['Perk 1']
            return (
              <motion.div key={cat}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-1.5 h-6 rounded-full ${cfg.dot}`} />
                  <span className={`text-xl font-black bg-gradient-to-r ${cfg.gradient} bg-clip-text text-transparent`}>
                    {cat}
                  </span>
                  <span className="text-xs text-white/20">{CAT_DESCRIPTIONS[cat]}</span>
                </div>

                <motion.div variants={containerVariants} initial="hidden" animate="show"
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {catPerks.map(perk => (
                    <motion.div key={perk.id} variants={cardVariants}
                      whileHover={{ y: -2, transition: { duration: 0.15 } }}
                      className="glass rounded-2xl p-4 flex gap-3 items-start"
                      style={{ borderLeftWidth: '2px', borderLeftColor: cat === 'Perk 1' ? 'rgba(56,189,248,.5)' : cat === 'Perk 2' ? 'rgba(251,113,133,.5)' : 'rgba(251,191,36,.5)' }}>
                      <PerkIcon src={perk.image_url} name={perk.perk_name} category={perk.category} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <p className="font-bold text-white text-sm leading-tight">{perk.perk_name}</p>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded border font-black ml-2 shrink-0 ${TIER_COLORS[perk.tier] ?? TIER_COLORS.C}`}>
                            {perk.tier}
                          </span>
                        </div>
                        {perk.description && (
                          <p className="text-xs text-white/35 leading-relaxed">{perk.description}</p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
