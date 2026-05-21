import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const { data } = await api.post('/auth/register', form)
      login(data.token, data.user)
      navigate('/loadouts')
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-8 sm:mt-16">
      <h1 className="text-2xl font-bold text-white mb-8 text-center">Crear cuenta</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {[
          { key: 'username', label: 'Username', type: 'text', placeholder: 'OSOLAGDAD' },
          { key: 'email',    label: 'Email',    type: 'email', placeholder: 'tu@email.com' },
          { key: 'password', label: 'Contraseña', type: 'password', placeholder: '••••••••' },
        ].map(({ key, label, type, placeholder }) => (
          <div key={key}>
            <label className="block text-xs text-gray-500 uppercase tracking-widest mb-2">{label}</label>
            <input
              type={type} value={form[key as keyof typeof form]}
              onChange={set(key)} required
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 transition-colors"
              placeholder={placeholder}
            />
          </div>
        ))}
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit" disabled={loading}
          className="w-full py-3 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors font-medium disabled:opacity-50"
        >
          {loading ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>
      </form>
      <p className="text-center text-gray-500 text-sm mt-6">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="text-red-400 hover:underline">Inicia sesión</Link>
      </p>
    </div>
  )
}
