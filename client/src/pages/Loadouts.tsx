import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'
import type { Loadout } from '../types'

const SLOTS = ['Muzzle', 'Barrel', 'Underbarrel', 'Magazine', 'Rear Grip', 'Stock', 'Laser', 'Optic', 'Fire Mods'] as const
const CATEGORIES = ['Assault Rifle', 'SMG', 'LMG', 'Sniper Rifle', 'Marksman Rifle', 'Battle Rifle', 'Shotgun', 'Handgun']

const emptyForm = { name: '', weapon_name: '', category: '', attachments: {} as Record<string, string>, cod_share_code: '', notes: '', is_public: false }

export default function Loadouts() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as { weapon?: string; category?: string; attachments?: Record<string, string> } | null

  const [loadouts, setLoadouts] = useState<Loadout[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Loadout | null>(null)
  const [form, setForm] = useState({ ...emptyForm })
  const [copied, setCopied] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return }
    loadData()
    if (state?.weapon) {
      setForm(f => ({
        ...f,
        weapon_name: state.weapon!,
        category: state.category ?? '',
        attachments: state.attachments ?? {},
      }))
      setShowForm(true)
    }
  }, [isAuthenticated])

  const loadData = () =>
    api.get<Loadout[]>('/loadouts').then(r => setLoadouts(r.data))

  const openNew = () => { setEditing(null); setForm({ ...emptyForm }); setShowForm(true) }
  const openEdit = (l: Loadout) => {
    setEditing(l)
    setForm({ name: l.name, weapon_name: l.weapon_name, category: l.category, attachments: l.attachments ?? {}, cod_share_code: l.cod_share_code ?? '', notes: l.notes ?? '', is_public: l.is_public })
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.name) return
    setSaving(true)
    try {
      if (editing) await api.put(`/loadouts/${editing.id}`, form)
      else await api.post('/loadouts', form)
      await loadData()
      setShowForm(false); setEditing(null)
    } finally { setSaving(false) }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este loadout?')) return
    await api.delete(`/loadouts/${id}`)
    setLoadouts(ls => ls.filter(l => l.id !== id))
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopied(code); setTimeout(() => setCopied(null), 2000)
  }

  const copyShareLink = (slug: string) => {
    const url = `${window.location.origin}/share/${slug}`
    navigator.clipboard.writeText(url)
    setCopied(slug); setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Mis Loadouts</h1>
        <button onClick={openNew} className="px-4 py-2 text-sm bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-colors">
          + Nuevo Loadout
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-5">{editing ? 'Editar Loadout' : 'Nuevo Loadout'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Field label="Nombre del loadout *" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="Mi HRM-9 agresivo" />
            <Field label="Arma" value={form.weapon_name} onChange={v => setForm(f => ({ ...f, weapon_name: v }))} placeholder="HRM-9" />
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-widest mb-2">Categoría</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500">
                <option value="">Seleccionar...</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <Field label="COD Share Code" value={form.cod_share_code} onChange={v => setForm(f => ({ ...f, cod_share_code: v }))} placeholder="Pega el código del juego" />
          </div>

          <div className="mb-4">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Accesorios</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {SLOTS.map(slot => (
                <Field key={slot} label={slot} value={form.attachments[slot] ?? ''}
                  onChange={v => setForm(f => ({ ...f, attachments: { ...f.attachments, [slot]: v } }))}
                  placeholder="—" />
              ))}
            </div>
          </div>

          <Field label="Notas" value={form.notes} onChange={v => setForm(f => ({ ...f, notes: v }))} placeholder="Ideal para rangos medios..." />

          <div className="flex items-center gap-3 mt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_public} onChange={e => setForm(f => ({ ...f, is_public: e.target.checked }))}
                className="w-4 h-4 rounded accent-green-400" />
              <span className="text-sm text-gray-400">Hacer público (compartible con link)</span>
            </label>
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={handleSave} disabled={saving}
              className="px-6 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-colors disabled:opacity-50">
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
            <button onClick={() => { setShowForm(false); setEditing(null) }}
              className="px-6 py-2 text-gray-400 border border-gray-700 rounded-lg hover:text-white transition-colors">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {loadouts.length === 0 && !showForm && (
        <div className="text-center py-20 text-gray-500">
          <p className="text-4xl mb-4">🔫</p>
          <p>Sin loadouts todavía.</p>
          <p className="text-sm mt-1">Ve a <span className="text-green-400 cursor-pointer" onClick={() => navigate('/meta')}>Meta</span> y haz clic en un arma para empezar.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loadouts.map(l => (
          <div key={l.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-semibold text-white">{l.name}</p>
                <p className="text-sm text-gray-500">{l.weapon_name} {l.category && `· ${l.category}`}</p>
              </div>
              {l.is_public && <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full">Público</span>}
            </div>

            {Object.entries(l.attachments ?? {}).filter(([, v]) => v).length > 0 && (
              <div className="mb-3 space-y-1">
                {Object.entries(l.attachments).filter(([, v]) => v).map(([k, v]) => (
                  <p key={k} className="text-xs text-gray-500"><span className="text-gray-600">{k}:</span> {v}</p>
                ))}
              </div>
            )}

            {l.cod_share_code && (
              <button onClick={() => copyCode(l.cod_share_code)}
                className="w-full mb-2 py-2 bg-gray-800 border border-gray-700 rounded-lg text-xs text-gray-300 hover:border-green-500/50 hover:text-green-400 transition-colors flex items-center justify-center gap-2">
                {copied === l.cod_share_code ? '✓ Copiado' : '📋 Copiar Share Code'}
              </button>
            )}

            {l.is_public && (
              <button onClick={() => copyShareLink(l.share_slug)}
                className="w-full mb-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-xs text-gray-300 hover:border-blue-500/50 hover:text-blue-400 transition-colors flex items-center justify-center gap-2">
                {copied === l.share_slug ? '✓ Link copiado' : '🔗 Copiar link para amigos'}
              </button>
            )}

            <div className="flex gap-2">
              <button onClick={() => openEdit(l)} className="flex-1 py-1.5 text-xs text-gray-400 border border-gray-700 rounded-lg hover:text-white transition-colors">Editar</button>
              <button onClick={() => handleDelete(l.id)} className="py-1.5 px-3 text-xs text-red-400/60 border border-gray-700 rounded-lg hover:text-red-400 transition-colors">✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="block text-xs text-gray-500 uppercase tracking-widest mb-2">{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-green-500 transition-colors" />
    </div>
  )
}
