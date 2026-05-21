import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../lib/api'
import type { Loadout } from '../types'

const TIER_COLORS: Record<string, string> = { S: 'text-yellow-400', A: 'text-green-400', B: 'text-blue-400', C: 'text-gray-400' }

export default function Share() {
  const { slug } = useParams<{ slug: string }>()
  const [loadout, setLoadout] = useState<Loadout & { username: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    api.get(`/loadouts/share/${slug}`)
      .then(r => setLoadout(r.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [slug])

  const copyCode = () => {
    if (!loadout?.cod_share_code) return
    navigator.clipboard.writeText(loadout.cod_share_code)
    setCopied(true); setTimeout(() => setCopied(false), 2500)
  }

  if (loading) return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-gray-500">Cargando...</div>

  if (notFound) return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-gray-500">
      <p className="text-5xl mb-4">🔍</p>
      <p className="text-lg">Loadout no encontrado</p>
      <Link to="/meta" className="mt-4 text-green-400 hover:underline text-sm">← Ir al inicio</Link>
    </div>
  )

  const attachments = Object.entries(loadout?.attachments ?? {}).filter(([, v]) => v)

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-xs text-gray-600 uppercase tracking-widest">META WZ · Loadout compartido</span>
        </div>

        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
          <div className="mb-5">
            <h1 className="text-2xl font-bold text-white">{loadout!.name}</h1>
            <p className="text-gray-400 mt-1">{loadout!.weapon_name} {loadout!.category && `· ${loadout!.category}`}</p>
            <p className="text-xs text-gray-600 mt-1">por {loadout!.username}</p>
          </div>

          {attachments.length > 0 && (
            <div className="mb-5">
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Accesorios</p>
              <div className="space-y-2">
                {attachments.map(([slot, value]) => (
                  <div key={slot} className="flex items-center justify-between py-2 border-b border-gray-800">
                    <span className="text-xs text-gray-500">{slot}</span>
                    <span className="text-sm text-white">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {loadout!.notes && (
            <div className="mb-5 bg-gray-800 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Notas</p>
              <p className="text-sm text-gray-300">{loadout!.notes}</p>
            </div>
          )}

          {loadout!.cod_share_code && (
            <button onClick={copyCode}
              className={`w-full py-4 rounded-xl font-semibold text-sm transition-all ${
                copied
                  ? 'bg-green-500/30 text-green-300 border border-green-500/40'
                  : 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30'
              }`}>
              {copied ? '✓ Código copiado — pégalo en COD' : '📋 Copiar Share Code para COD'}
            </button>
          )}

          {!loadout!.cod_share_code && (
            <p className="text-center text-gray-600 text-sm">Sin share code adjunto</p>
          )}
        </div>

        <p className="text-center mt-6 text-xs text-gray-600">
          <Link to="/meta" className="text-gray-500 hover:text-green-400 transition-colors">Crear tu propio tracker →</Link>
        </p>
      </div>
    </div>
  )
}
