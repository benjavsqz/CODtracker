import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import api from '../lib/api'

interface Noticia {
  id: number
  slug: string
  titulo: string
  resumen: string
  imagen_url: string | null
  categoria: string
  fecha: string | null
  destacada: boolean
}

interface NoticiaDetalle extends Noticia {
  contenido: string
}

const CAT_COLOR: Record<string, string> = {
  temporadas: 'text-violet-400 bg-violet-500/10 border-violet-500/25',
  meta:       'text-green-400 bg-green-500/10 border-green-500/25',
  eventos:    'text-amber-400 bg-amber-500/10 border-amber-500/25',
  noticias:   'text-sky-400 bg-sky-500/10 border-sky-500/25',
}

const CAT_LABEL: Record<string, string> = {
  temporadas: 'Temporadas',
  meta:       'Meta',
  eventos:    'Eventos',
  noticias:   'Noticias',
}

function formatFecha(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })
}

function NoticiaModal({ slug, onClose }: { slug: string; onClose: () => void }) {
  const [data, setData] = useState<NoticiaDetalle | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<NoticiaDetalle>(`/meta/noticias/${encodeURIComponent(slug)}`)
      .then(r => setData(r.data))
      .finally(() => setLoading(false))
  }, [slug])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const catColor = data ? (CAT_COLOR[data.categoria] ?? CAT_COLOR.noticias) : ''

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 z-40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1, transition: { type: 'spring', stiffness: 280, damping: 28 } }}
        exit={{ y: '100%', opacity: 0, transition: { duration: 0.2 } }}
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl flex flex-col"
        style={{
          maxHeight: '92dvh',
          background: 'linear-gradient(180deg,#0d0d18 0%,#09090f 100%)',
          borderTop: '1px solid rgba(255,255,255,.08)',
          boxShadow: '0 -8px 40px rgba(0,0,0,.7)',
        }}>
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-white/10" />
        </div>
        <button onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-white/[0.07] hover:bg-white/[0.12] flex items-center justify-center text-white/40 hover:text-white text-lg leading-none transition-all">
          ×
        </button>

        <div className="flex-1 overflow-y-auto px-5 pb-8 pt-2" style={{ overscrollBehavior: 'contain' }}>
          {loading && (
            <div className="space-y-4 pt-4">
              <div className="skeleton h-6 rounded-lg w-3/4" />
              <div className="skeleton h-4 rounded w-1/3" />
              <div className="skeleton h-48 rounded-2xl" />
              <div className="space-y-2">
                {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-3 rounded w-full" />)}
              </div>
            </div>
          )}

          {!loading && data && (
            <>
              {/* Category + date */}
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide ${catColor}`}>
                  {CAT_LABEL[data.categoria] ?? data.categoria}
                </span>
                {data.fecha && (
                  <span className="text-xs text-white/25">{formatFecha(data.fecha)}</span>
                )}
              </div>

              {/* Title */}
              <h2 className="text-xl font-black text-white leading-tight mb-4">{data.titulo}</h2>

              {/* Image */}
              {data.imagen_url && (
                <div className="rounded-2xl overflow-hidden mb-5" style={{ background: 'rgba(255,255,255,.04)' }}>
                  <img src={data.imagen_url} alt={data.titulo}
                    className="w-full object-cover max-h-52"
                    onError={e => (e.currentTarget.style.display = 'none')} />
                </div>
              )}

              {/* Resumen */}
              {data.resumen && (
                <p className="text-sm text-white/50 leading-relaxed mb-5 border-l-2 border-white/10 pl-3">
                  {data.resumen}
                </p>
              )}

              {/* Content */}
              {data.contenido ? (
                <div className="text-sm text-white/70 leading-relaxed whitespace-pre-line">
                  {data.contenido}
                </div>
              ) : (
                <p className="text-sm text-white/25 text-center py-8">
                  Contenido completo disponible en wzmetaloadouts.com
                </p>
              )}
            </>
          )}
        </div>
      </motion.div>
    </>
  )
}

export default function Noticias() {
  const [noticias, setNoticias] = useState<Noticia[]>([])
  const [loading, setLoading]   = useState(true)
  const [openSlug, setOpenSlug] = useState<string | null>(null)

  useEffect(() => {
    api.get<Noticia[]>('/meta/noticias').then(r => setNoticias(r.data)).finally(() => setLoading(false))
  }, [])

  const destacada = noticias.find(n => n.destacada)
  const rest      = noticias.filter(n => !n.destacada)

  return (
    <div>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Noticias & <span className="bg-gradient-to-r from-violet-300 to-purple-500 bg-clip-text text-transparent">Parches</span>
        </h1>
        <p className="text-sm text-white/30 mt-1">Warzone · Actualizaciones, temporadas y cambios de balance</p>
      </motion.div>

      {loading && (
        <div className="space-y-4">
          <div className="skeleton h-56 rounded-3xl" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-36 rounded-2xl" />)}
          </div>
        </div>
      )}

      {!loading && noticias.length === 0 && (
        <div className="text-center py-20">
          <p className="text-white/25 text-sm">Aún no hay noticias cargadas.</p>
          <p className="text-white/15 text-xs mt-1">Se actualizan con el próximo scrape.</p>
        </div>
      )}

      {!loading && noticias.length > 0 && (
        <div className="space-y-4">
          {/* Featured article */}
          {destacada && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
              onClick={() => setOpenSlug(destacada.slug)}
              className="cursor-pointer group relative rounded-3xl overflow-hidden"
              style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)' }}>
              {destacada.imagen_url && (
                <div className="relative h-52 sm:h-64">
                  <img src={destacada.imagen_url} alt={destacada.titulo}
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-75 transition-opacity duration-300"
                    onError={e => (e.currentTarget.style.display = 'none')} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                </div>
              )}
              <div className={`p-5 ${destacada.imagen_url ? 'absolute bottom-0 left-0 right-0' : ''}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-500/80 text-white uppercase tracking-wide">
                    Destacado
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${CAT_COLOR[destacada.categoria] ?? CAT_COLOR.noticias}`}>
                    {CAT_LABEL[destacada.categoria] ?? destacada.categoria}
                  </span>
                  {destacada.fecha && (
                    <span className="text-xs text-white/40">{formatFecha(destacada.fecha)}</span>
                  )}
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white leading-snug">{destacada.titulo}</h2>
                {destacada.resumen && (
                  <p className="text-sm text-white/50 mt-1 line-clamp-2">{destacada.resumen}</p>
                )}
              </div>
            </motion.div>
          )}

          {/* Rest of articles */}
          {rest.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {rest.map((n, i) => (
                <motion.div key={n.id}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  onClick={() => setOpenSlug(n.slug)}
                  className="cursor-pointer group rounded-2xl overflow-hidden"
                  style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)' }}>
                  {n.imagen_url && (
                    <div className="h-28 overflow-hidden">
                      <img src={n.imagen_url} alt={n.titulo}
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-300"
                        onError={e => (e.currentTarget.style.display = 'none')} />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${CAT_COLOR[n.categoria] ?? CAT_COLOR.noticias}`}>
                        {CAT_LABEL[n.categoria] ?? n.categoria}
                      </span>
                      {n.fecha && (
                        <span className="text-[10px] text-white/30">{formatFecha(n.fecha)}</span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-white leading-snug line-clamp-2">{n.titulo}</h3>
                    {n.resumen && (
                      <p className="text-xs text-white/35 mt-1 line-clamp-2">{n.resumen}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      )}

      {/* Article modal */}
      {openSlug && (
        <NoticiaModal slug={openSlug} onClose={() => setOpenSlug(null)} />
      )}
    </div>
  )
}
